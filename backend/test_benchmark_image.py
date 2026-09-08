import os
import sys
import time
import json
import base64
import urllib.request

IMAGE_PATH = r"C:\Users\marmi\.gemini\antigravity-ide\brain\a633a525-5abe-4722-b6d2-b4b51e730503\.user_uploaded\media_1788891372894.jpg"

with open(IMAGE_PATH, "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode("utf-8")

sys.path.insert(0, ".")
from services.vision_service import STATUTORY_VISION_PROMPT, _clean_json_response
from services.validation_service import validate_product_compliance
from services.llm_validation_service import _build_verification_prompt, _safe_parse_json_list

configurations = [
    {
        "name": "Configuration A (Untuned/Default: num_ctx=8192, num_predict=1024)",
        "ctx": 8192,
        "predict": 1024,
    },
    {
        "name": "Configuration B (Optimized: num_ctx=2048, num_predict=350)",
        "ctx": 2048,
        "predict": 350,
    },
    {
        "name": "Configuration C (Over-Constrained: num_ctx=1024, num_predict=100)",
        "ctx": 1024,
        "predict": 100,
    },
]

results = []

for cfg in configurations:
    print(f"\n=======================================================")
    print(f"RUNNING: {cfg['name']}")
    print(f"=======================================================")
    
    # ── 1. Vision Extraction Phase ──
    v_payload = {
        "model": "qwen2.5vl:7b",
        "messages": [
            {
                "role": "user",
                "content": STATUTORY_VISION_PROMPT,
                "images": [img_b64],
            }
        ],
        "options": {
            "num_ctx": cfg["ctx"],
            "num_predict": cfg["predict"],
            "temperature": 0.05,
            "top_p": 0.85,
            "num_gpu": 99,
        },
        "stream": False,
        "format": "json",
    }
    
    req = urllib.request.Request(
        "http://localhost:11434/api/chat",
        data=json.dumps(v_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            v_data = json.loads(resp.read().decode("utf-8"))
            v_elapsed = time.time() - t0
            v_content = v_data.get("message", {}).get("content", "")
            v_eval_tokens = v_data.get("eval_count", 0)
            v_prompt_tokens = v_data.get("prompt_eval_count", 0)
            v_parsed = _clean_json_response(v_content)
    except Exception as e:
        print(f"Vision Error: {e}")
        v_elapsed, v_eval_tokens, v_prompt_tokens, v_parsed, v_content = 0, 0, 0, None, str(e)
    
    print(f"[Vision Extraction]")
    print(f"  Latency: {v_elapsed:.2f}s | Prompt Tokens: {v_prompt_tokens} | Output Tokens: {v_eval_tokens}")
    print(f"  Parse Success: {v_parsed is not None}")
    if v_parsed:
        print(f"  Extracted Fields: {json.dumps(v_parsed, indent=4)}")
    else:
        print(f"  Raw Content Preview: {v_content[:200]}")

    # ── 2. Validation Augmentation Phase ──
    extracted_fields = v_parsed or {
        "productName": "Parle-G Gluco Biscuits",
        "mrp": "Rs 10.00 incl. of all taxes",
        "netQuantity": "110g+20g EXTRA= 130g",
        "manufacturingDate": "18/06/2020",
        "expiryDate": "18/11/2020",
        "customerCare": "022-6691 6929, cs@parle.biz",
        "manufacturerAddress": "North Level Crossing, Vile Parle East, Mumbai, MH-400057",
        "fssaiLicense": "10013022002253",
        "batchNumber": "RA 18A B",
        "countryOfOrigin": "India"
    }

    # Generate deterministic report
    report = validate_product_compliance(extracted_fields, use_llm=False, evaluation_date="2026-09-08")
    reviewable = [
        {
            "rule_id": f.rule_id,
            "rule_code": f.rule_code,
            "target_field": f.target_field,
            "status": f.status,
            "evidence": f.evidence,
            "expected_standard": f.expected_standard,
            "act_name": f.act_name
        }
        for f in report.findings if f.status in ("fail", "warning")
    ]
    
    val_prompt = _build_verification_prompt(extracted_fields, reviewable, evaluation_date="2026-09-08")
    
    val_payload = {
        "model": "qwen2.5vl:7b",
        "messages": [{"role": "user", "content": val_prompt}],
        "options": {
            "num_ctx": cfg["ctx"],
            "num_predict": cfg["predict"],
            "temperature": 0.05,
            "top_p": 0.85,
            "num_gpu": 99,
        },
        "stream": False,
    }
    
    val_req = urllib.request.Request(
        "http://localhost:11434/api/chat",
        data=json.dumps(val_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    
    t1 = time.time()
    try:
        with urllib.request.urlopen(val_req, timeout=120) as resp:
            val_data = json.loads(resp.read().decode("utf-8"))
            val_elapsed = time.time() - t1
            val_content = val_data.get("message", {}).get("content", "")
            val_eval_tokens = val_data.get("eval_count", 0)
            val_prompt_tokens = val_data.get("prompt_eval_count", 0)
            val_parsed = _safe_parse_json_list(val_content)
    except Exception as e:
        print(f"Validation Error: {e}")
        val_elapsed, val_eval_tokens, val_prompt_tokens, val_parsed, val_content = 0, 0, 0, None, str(e)
    
    print(f"\n[Validation Augmentation]")
    print(f"  Latency: {val_elapsed:.2f}s | Prompt Tokens: {val_prompt_tokens} | Output Tokens: {val_eval_tokens}")
    print(f"  Parse Success: {val_parsed is not None}")
    if val_parsed:
        print(f"  Augmentations: {json.dumps(val_parsed, indent=4)}")
    else:
        print(f"  Raw Content Preview: {val_content[:200]}")
    
    total_time = v_elapsed + val_elapsed
    print(f"\n[TOTAL PIPELINE TIME]: {total_time:.2f}s")
    
    results.append({
        "config": cfg["name"],
        "v_elapsed": v_elapsed,
        "v_eval_tokens": v_eval_tokens,
        "v_prompt_tokens": v_prompt_tokens,
        "v_success": v_parsed is not None,
        "val_elapsed": val_elapsed,
        "val_eval_tokens": val_eval_tokens,
        "val_prompt_tokens": val_prompt_tokens,
        "val_success": val_parsed is not None,
        "total_time": total_time,
        "extracted_sample": v_parsed,
        "validation_sample": val_parsed
    })

print("\n\n================ FINAL SUMMARY JSON ================")
print(json.dumps(results, indent=2))
