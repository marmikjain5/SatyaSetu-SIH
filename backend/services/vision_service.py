"""
SatyaDrishti Hybrid Vision Extraction Service

Coordinates multimodal vision models (Local Ollama Vision LLMs like Qwen2.5-VL / MiniCPM-V / Llama3.2-Vision
and Cloud Gemini Flash Vision) for statutory packaging declaration extraction.

Statutory Frameworks:
  - Legal Metrology (Packaged Commodities) Rules, 2011 [G.S.R. 882(E)]
  - Unit Sale Price Amendment [G.S.R. 779(E), effective 1 Jan 2023]
  - Country of Origin Mandatory Declaration [G.S.R. 1537(E)]
  - FSSAI Labelling & Display Regulations, 2020 [F.No. 1-116/FSSAI/Imports/2021]
"""

import os
import json
import base64
import urllib.request
import urllib.error
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path

# Default Configurations
DEFAULT_OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
DEFAULT_OLLAMA_VISION_MODEL = os.getenv("OLLAMA_VISION_MODEL", "qwen2.5-vl")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

STATUTORY_VISION_PROMPT = """You are SatyaDrishti's statutory packaging compliance inspector under the Legal Metrology Act, 2009, Legal Metrology (Packaged Commodities) Rules 2011/2022, and FSSAI Regulations 2020.

Carefully inspect all text, labels, stamps, dot-matrix imprints, symbols, and tables in this product image (including curved surfaces, bottle sides, and nutritional panels).

Extract the following statutory declarations into exact JSON. Fill ALL fields you can see:
{
  "manufacturer": "Name of manufacturer, packer, or marketer company (Look for 'Packed & Marketed by', 'Manufactured by', 'Marketed by', 'Mfg. by', 'Mfrd. by', or visible company name on label)",
  "manufacturerAddress": "Complete premises address with 6-digit PIN code (Look for address block after 'Packed & Marketed by', 'Manufactured by', or any address line with PIN)",
  "productName": "Generic or common name of commodity / brand title",
  "mrp": "Maximum Retail Price number only (e.g. 10.00 or 350.00, or null if blank)",
  "mrpRaw": "Exact raw text of MRP clause (e.g. MRP Rs. 10.00 incl. of all taxes, or null if blank)",
  "netQuantity": "Net weight/volume/count in metric units (e.g. 500 g, 20 g, 350 ml)",
  "unitSalePrice": "Unit Sale Price (e.g. Rs. 0.50 / g or Rs. 1.20 / ml, or null if not declared)",
  "manufacturingDate": "Date of manufacture/packing (e.g. MM/YYYY, DD/MM/YYYY, or null if blank)",
  "expiryDate": "Expiry / Best Before / Use By date (e.g. MM/YYYY, or null if blank)",
  "batchNumber": "Batch or Lot number (e.g. BN: 1234, or null if blank)",
  "countryOfOrigin": "Country of Origin / Manufacture (e.g. Product of India, Made in India)",
  "customerCare": "Consumer grievance redressal toll-free number or email",
  "fssaiLicense": "14-digit FSSAI license number (if food item)",
  "vegNonVeg": "VEG (Green dot in square) or NON-VEG (Brown triangle in square) or NONE",
  "rawDetectedText": "Key transcript of all visible text on package"
}

IMPORTANT:
- manufacturer and manufacturerAddress are the MOST critical fields — always extract them even if other fields are unclear.
- If a field is blank/unprinted, set its value to null.
- For manufacturer: Look for 'Packed & Marketed by', 'Manufactured by', 'Marketed by', 'Mfg. by', 'Mfrd. by', or any identifiable company/brand name.
- For manufacturerAddress: Extract full address with PIN code. Include street, city, state, PIN.
Return ONLY the JSON object without markdown fences or extra text.
"""

def encode_image_to_base64(image_path_or_bytes: Any, max_dimension: int = 896) -> str:
    """Encodes an image file path or raw bytes to a base64 string, resizing to optimal dimension for speed and accuracy."""
    try:
        from PIL import Image
        import io
        
        if isinstance(image_path_or_bytes, (str, Path)):
            p = Path(image_path_or_bytes)
            if not p.exists():
                raise FileNotFoundError(f"Image file not found: {p}")
            with Image.open(p) as img:
                img = img.convert("RGB")
                if max(img.size) > max_dimension:
                    img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
                buf = io.BytesIO()
                img.save(buf, format="JPEG", quality=85)
                return base64.b64encode(buf.getvalue()).decode("utf-8")
        elif isinstance(image_path_or_bytes, bytes):
            with Image.open(io.BytesIO(image_path_or_bytes)) as img:
                img = img.convert("RGB")
                if max(img.size) > max_dimension:
                    img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
                buf = io.BytesIO()
                img.save(buf, format="JPEG", quality=85)
                return base64.b64encode(buf.getvalue()).decode("utf-8")
    except Exception:
        # Fallback to direct bytes if PIL is not available
        if isinstance(image_path_or_bytes, (str, Path)):
            with open(Path(image_path_or_bytes), "rb") as f:
                return base64.b64encode(f.read()).decode("utf-8")
        elif isinstance(image_path_or_bytes, bytes):
            return base64.b64encode(image_path_or_bytes).decode("utf-8")
    raise ValueError("image_path_or_bytes must be a file path str/Path or raw bytes.")


class OllamaVisionProvider:
    """Local Vision Extraction via Ollama (qwen2.5-vl, minicpm-v, llama3.2-vision)."""

    def __init__(
        self,
        base_url: str = DEFAULT_OLLAMA_BASE_URL,
        model_name: str = DEFAULT_OLLAMA_VISION_MODEL,
        timeout_seconds: int = 120
    ):
        self.base_url = base_url.rstrip("/")
        self.model_name = model_name
        self.timeout = timeout_seconds


    def is_available(self) -> bool:
        """Checks if local Ollama server is running and accessible."""
        try:
            req = urllib.request.Request(f"{self.base_url}/api/tags", headers={"User-Agent": "SatyaDrishti-Agent"})
            with urllib.request.urlopen(req, timeout=3) as resp:
                if resp.status == 200:
                    tags = json.loads(resp.read().decode("utf-8"))
                    installed = [m.get("name", "") for m in tags.get("models", [])]
                    if installed:
                        if self.model_name in installed:
                            return True
                        clean_target = self.model_name.lower().replace("-", "").replace(":", "")
                        for m in installed:
                            clean_m = m.lower().replace("-", "").replace(":", "")
                            if clean_target in clean_m or clean_m in clean_target:
                                self.model_name = m
                                return True
                        self.model_name = installed[0]
                        return True
                return False
        except Exception:
            return False

    def extract_declarations(self, base64_image: str) -> Tuple[Optional[Dict[str, Any]], str]:
        """Calls Ollama /api/chat endpoint with image, token pruning, and speed optimizations."""
        self.is_available()

        num_predict = int(os.getenv("OLLAMA_NUM_PREDICT", "900"))
        num_ctx = int(os.getenv("OLLAMA_NUM_CTX", "4096"))

        payload = {
            "model": self.model_name,
            "messages": [
                {
                    "role": "user",
                    "content": STATUTORY_VISION_PROMPT,
                    "images": [base64_image]
                }
            ],
            "options": {
                "num_ctx": num_ctx,
                "temperature": 0.05,
                "top_p": 0.85,
                "num_predict": num_predict,
                "num_gpu": 99,
            },
            "stream": False,
            "format": "json"
        }
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            f"{self.base_url}/api/chat",
            data=data_bytes,
            headers={"Content-Type": "application/json", "User-Agent": "SatyaDrishti-Agent"}
        )

        try:
            import time
            start_t = time.time()
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                if resp.status == 200:
                    resp_json = json.loads(resp.read().decode("utf-8"))
                    raw_text = resp_json.get("message", {}).get("content", "")
                    elapsed = time.time() - start_t
                    eval_count = resp_json.get("eval_count", 0)
                    eval_duration_s = resp_json.get("eval_duration", 0) / 1e9
                    tok_per_sec = (eval_count / eval_duration_s) if eval_duration_s > 0 else 0
                    print(f"[Ollama Vision] Model: {self.model_name} | Elapsed: {elapsed:.2f}s | Speed: {tok_per_sec:.1f} tok/s | Tokens: {eval_count}")
                    extracted = self._clean_and_parse_json(raw_text)
                    return extracted, raw_text
                return None, f"Ollama HTTP {resp.status}"
        except Exception as e:
            return None, str(e)


    def _clean_and_parse_json(self, raw_str: str) -> Optional[Dict[str, Any]]:
        import re
        raw_str = raw_str.strip()
        if raw_str.startswith("```json"):
            raw_str = raw_str[7:]
        if raw_str.startswith("```"):
            raw_str = raw_str[3:]
        if raw_str.endswith("```"):
            raw_str = raw_str[:-3]
        raw_str = raw_str.strip()

        try:
            return json.loads(raw_str)
        except Exception:
            # Attempt to locate first { and last }
            s = raw_str.find("{")
            e = raw_str.rfind("}")
            if s != -1 and e != -1 and e > s:
                try:
                    return json.loads(raw_str[s:e+1])
                except Exception:
                    pass

            # Robust fallback: extract statutory keys via regex even if JSON was unclosed
            res: Dict[str, Any] = {}
            for k in [
                "productName", "mrp", "mrpRaw", "unitSalePrice", "netQuantity",
                "manufacturer", "manufacturerAddress", "manufacturingDate", "expiryDate",
                "batchNumber", "countryOfOrigin", "customerCare", "fssaiLicense",
                "vegNonVeg", "rawDetectedText"
            ]:
                m = re.search(rf'"{k}"\s*:\s*"([^"]*)"', raw_str)
                if m:
                    res[k] = m.group(1)
                else:
                    m_num = re.search(rf'"{k}"\s*:\s*([0-9.]+)', raw_str)
                    if m_num:
                        res[k] = m_num.group(1)
            return res if res else None


class GeminiVisionProvider:
    """Cloud Vision Extraction via Google Gemini API."""

    def __init__(self, api_key: str = GEMINI_API_KEY, timeout_seconds: int = 45):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.timeout = timeout_seconds

    def is_available(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 10)

    def extract_declarations(self, base64_image: str) -> Tuple[Optional[Dict[str, Any]], str]:
        if not self.is_available():
            return None, "GEMINI_API_KEY not configured."

        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": STATUTORY_VISION_PROMPT},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": base64_image
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "response_mime_type": "application/json"
            }
        }
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            endpoint,
            data=data_bytes,
            headers={"Content-Type": "application/json"}
        )

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                if resp.status == 200:
                    resp_json = json.loads(resp.read().decode("utf-8"))
                    candidates = resp_json.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            raw_text = parts[0].get("text", "")
                            extracted = json.loads(raw_text.strip())
                            return extracted, raw_text
                return None, f"Gemini HTTP {resp.status}"
        except Exception as e:
            return None, str(e)


class HybridVisionService:
    """
    Orchestrates Vision Extraction across:
      1. Local Ollama Vision (qwen2.5-vl / minicpm-v)
      2. Cloud Gemini Flash Vision
      3. Fallback flag to client/local OCR
    """

    def __init__(self):
        self.ollama = OllamaVisionProvider()
        self.gemini = GeminiVisionProvider()

    def extract_from_image(self, image_input: Any) -> Dict[str, Any]:
        """
        Extracts statutory fields from an image file path or raw bytes using the best available provider.
        """
        try:
            base64_img = encode_image_to_base64(image_input)
        except Exception as e:
            return {
                "status": "error",
                "provider": "none",
                "error": str(e),
                "fields": {}
            }

        # 1. Attempt Local Ollama Vision
        if self.ollama.is_available():
            extracted, raw = self.ollama.extract_declarations(base64_img)
            if extracted and isinstance(extracted, dict):
                return {
                    "status": "success",
                    "provider": f"Local-Ollama-{self.ollama.model_name}",
                    "raw_text": extracted.get("rawDetectedText", raw),
                    "fields": extracted
                }

        # 2. Attempt Cloud Gemini Vision
        if self.gemini.is_available():
            extracted, raw = self.gemini.extract_declarations(base64_img)
            if extracted and isinstance(extracted, dict):
                return {
                    "status": "success",
                    "provider": "Cloud-Gemini-Flash-Vision",
                    "raw_text": extracted.get("rawDetectedText", raw),
                    "fields": extracted
                }

        # 3. Neither vision LLM available -> notify caller to use OCR fallback
        return {
            "status": "fallback_to_ocr",
            "provider": "none",
            "message": "Local Ollama server (http://localhost:11434) and GEMINI_API_KEY unavailable. Proceeding with OCR fallback.",
            "fields": {}
        }


# Singleton instance
vision_service = HybridVisionService()
