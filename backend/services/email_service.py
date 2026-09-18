"""
SatyaDrishti Email Dispatch Service
Handles Gmail OAuth2 Refresh Token exchange, RFC 2822 MIME email formatting,
and REST dispatch via Google Cloud Console Gmail API on the Python backend.
"""

import os
import base64
import json
import urllib.parse
import urllib.request
import urllib.error
from typing import Dict, Any, Optional
from datetime import datetime

# Load environment variables if python-dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def _base64url_encode(str_val: str) -> str:
    """Encodes a string into base64url format required by Gmail API raw message payload."""
    encoded_bytes = base64.b64encode(str_val.encode('utf-8'))
    encoded_str = encoded_bytes.decode('utf-8')
    return encoded_str.replace('+', '-').replace('/', '_').rstrip('=')


def _get_oauth2_access_token(client_id: str, client_secret: str, refresh_token: str) -> str:
    """Refreshes OAuth2 access token using Google Cloud OAuth Client ID, Secret, and Refresh Token."""
    token_url = "https://oauth2.googleapis.com/token"
    
    payload = urllib.parse.urlencode({
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }).encode('utf-8')
    
    req = urllib.request.Request(
        token_url,
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            access_token = data.get("access_token")
            if not access_token:
                raise ValueError("OAuth2 token endpoint response did not include access_token")
            return access_token
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        try:
            error_json = json.loads(error_body)
            err_msg = error_json.get("error_description") or error_json.get("error") or str(e)
        except Exception:
            err_msg = error_body or str(e)
        raise RuntimeError(f"OAuth token exchange failed (HTTP {e.code}): {err_msg}")


def build_scn_html_email(options: Dict[str, Any], sender_email: str, recipient_email: str) -> str:
    """Constructs HTML formatted Show Cause Notice email body."""
    penalty_estimate = options.get("penaltyEstimate", 0)
    try:
        formatted_penalty = f"₹{int(penalty_estimate):,}"
    except Exception:
        formatted_penalty = f"₹{penalty_estimate}"

    issue_date = datetime.now().strftime("%d %B %Y")
    notice_ref = options.get('noticeReference', 'SCN-2026-NOTICE')
    case_no = options.get('caseNumber', 'CASE-2026')
    manufacturer = options.get('manufacturer', 'Target Entity')
    product_name = options.get('productName', '')
    brand = options.get('brand', '')
    platform = options.get('platform', 'Direct')

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #0f172a; margin: 0; padding: 24px 12px; }}
    .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15,23,42,0.08); }}
    .header {{ background-color: #0f172a; color: #ffffff; text-align: left; padding: 24px 28px; border-bottom: 3px solid #dc2626; }}
    .header-tag {{ display: inline-block; background: #dc2626; color: #ffffff; padding: 3px 10px; border-radius: 4px; font-weight: 700; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }}
    .header h1 {{ margin: 0; font-size: 17px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }}
    .header p {{ margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; letter-spacing: 0.3px; }}
    .body {{ padding: 28px; font-size: 13px; line-height: 1.6; color: #334155; }}
    .grid-meta {{ display: table; width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; border-spacing: 0; }}
    .grid-cell {{ display: table-cell; padding: 12px 16px; font-size: 12px; border-right: 1px solid #e2e8f0; }}
    .grid-cell:last-child {{ border-right: none; }}
    .cell-label {{ font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }}
    .cell-val {{ font-weight: 700; color: #0f172a; }}
    .card-recipient {{ background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #0284c7; border-radius: 6px; padding: 14px 16px; margin-bottom: 20px; }}
    .card-recipient h4 {{ margin: 0 0 4px 0; font-size: 14px; color: #0f172a; font-weight: 700; }}
    .contravention-box {{ background: #fff5f5; border: 1px solid #fed7d7; border-left: 4px solid #dc2626; border-radius: 8px; padding: 16px; margin: 20px 0; }}
    .contravention-title {{ color: #991b1b; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }}
    .data-row {{ margin-bottom: 6px; font-size: 12px; }}
    .data-row strong {{ color: #0f172a; width: 130px; display: inline-block; }}
    .penalty-banner {{ background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px 16px; margin: 20px 0; text-align: center; }}
    .penalty-title {{ font-size: 11px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; }}
    .penalty-amount {{ font-size: 22px; font-weight: 900; color: #1e3a8a; margin: 2px 0; }}
    .signature-block {{ margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #475569; }}
    .footer {{ background: #f8fafc; text-align: center; padding: 16px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; line-height: 1.4; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-tag">Statutory Notice under LM Act 2009</div>
      <h1>Central Consumer Protection Authority</h1>
      <p>Ministry of Consumer Affairs, Food & Public Distribution • Govt. of India</p>
    </div>
    
    <div class="body">
      <div class="grid-meta">
        <div class="grid-cell">
          <div class="cell-label">Notice Ref</div>
          <div class="cell-val">{notice_ref}</div>
        </div>
        <div class="grid-cell">
          <div class="cell-label">Case File</div>
          <div class="cell-val">{case_no}</div>
        </div>
        <div class="grid-cell">
          <div class="cell-label">Issued Date</div>
          <div class="cell-val">{issue_date}</div>
        </div>
      </div>

      <div class="card-recipient">
        <div style="font-size: 10px; font-weight: 700; color: #0284c7; text-transform: uppercase; margin-bottom: 2px;">Notice Addressee</div>
        <h4>{manufacturer}</h4>
        <div style="font-size: 12px; color: #475569;">
          <strong>Product:</strong> {product_name} ({brand}) | <strong>Platform:</strong> {platform}
        </div>
      </div>

      <p style="margin: 0 0 14px 0; font-size: 13px; font-weight: 700; color: #0f172a;">
        SUBJECT: SHOW CAUSE NOTICE — LEGAL METROLOGY ACT, 2009 (SECTION 36 & 39)
      </p>

      <p style="margin: 0 0 14px 0;">
        You are hereby notified that an automated optical compliance audit conducted by the <strong>SatyaSetu Intelligence Portal</strong> detected statutory non-compliance in respect of the pre-packaged product listed above.
      </p>

      <div class="contravention-box">
        <div class="contravention-title">Detected Contravention Record</div>
        <div class="data-row"><strong>Violation:</strong> {options.get('description', '')}</div>
        <div class="data-row"><strong>Statutory Act:</strong> {options.get('section', '')} ({options.get('actName', '')})</div>
        <div class="data-row"><strong>Optical Evidence:</strong> <span style="font-family: monospace; color: #b91c1c; font-weight: 700;">{options.get('extractedValue', '')}</span></div>
        <div class="data-row"><strong>Prescribed Standard:</strong> {options.get('expectedStandard', '')}</div>
      </div>

      <div class="penalty-banner">
        <div class="penalty-title">Potential Compoundable Statutory Fine</div>
        <div class="penalty-amount">{formatted_penalty}</div>
        <div style="font-size: 11px; color: #3b82f6; font-weight: 600;">Response Required Within 15 Business Days</div>
      </div>

      <p style="margin: 0 0 14px 0;">
        <strong>REQUIRED ACTION:</strong> Please show cause in writing within <strong>fifteen (15) days</strong> from the receipt of this notice explaining why penal proceedings should not be initiated against your company and designated directors.
      </p>

      <div class="signature-block">
        <strong>Digitally Dispatched By:</strong><br>
        <span style="font-weight: 700; color: #0f172a;">{options.get('assignedOfficer', '')}</span><br>
        <em>Authorized Regulatory Officer, Legal Metrology Division, Govt. of India</em>
      </div>
    </div>

    <div class="footer">
      Official Statutory Communication • SatyaSetu Legal Metrology Directorate<br>
      Dispatched to: {recipient_email}
    </div>
  </div>
</body>
</html>"""


def build_surprise_inspection_html_email(options: Dict[str, Any], sender_email: str, recipient_email: str) -> str:
    """Constructs HTML formatted Surprise Inspection Order email body."""
    import random
    directive_ref = f"INSP-DIR-{random.randint(100000, 999999)}"
    timestamp_str = datetime.now().strftime("%d %b %Y, %I:%M %p")

    location = options.get("location", "")
    city = options.get("city", "")
    state = options.get("state", "")
    factory_name = options.get("factoryName", "")
    full_address = f"{factory_name}, {location}, {city}, {state}, India"
    maps_url = f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(full_address)}"
    
    overall_score = options.get("overallScore", 100)
    score_color = "#dc2626" if overall_score < 60 else ("#d97706" if overall_score < 80 else "#16a34a")
    compliance_status = str(options.get("complianceStatus", "compliant")).upper()
    priority = options.get("priority") or "IMMEDIATE / HIGH PRIORITY"
    directive_notes = options.get("directiveNotes", "")

    notes_html = ""
    if directive_notes:
        notes_html = f'<div style="margin-top: 10px; padding: 8px 12px; background: #fffbe6; border: 1px solid #ffe58f; border-radius: 6px; font-size: 11px; color: #d48806;"><strong>Special Directive Notes:</strong> {directive_notes}</div>'

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #0f172a; margin: 0; padding: 24px 12px; }}
    .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15,23,42,0.08); }}
    .header {{ background-color: #0f172a; color: #ffffff; text-align: left; padding: 24px 28px; border-bottom: 3px solid #dc2626; }}
    .header-badge {{ display: inline-block; background: #dc2626; color: #ffffff; padding: 3px 10px; border-radius: 4px; font-weight: 700; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }}
    .header h1 {{ margin: 0; font-size: 17px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }}
    .header p {{ margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; letter-spacing: 0.3px; }}
    .body {{ padding: 28px; font-size: 13px; line-height: 1.6; color: #334155; }}
    .meta-grid {{ display: table; width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; border-spacing: 0; }}
    .meta-cell {{ display: table-cell; padding: 12px 16px; font-size: 12px; border-right: 1px solid #e2e8f0; }}
    .meta-cell:last-child {{ border-right: none; }}
    .cell-label {{ font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }}
    .cell-val {{ font-weight: 700; color: #0f172a; }}
    .factory-card {{ background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #2563eb; padding: 16px; border-radius: 8px; margin: 20px 0; }}
    .factory-name {{ font-size: 15px; font-weight: 800; color: #1e3a8a; margin-bottom: 4px; }}
    .maps-btn {{ display: inline-block; background-color: #16a34a; color: #ffffff !important; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 700; font-size: 12px; margin-top: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
    .footer {{ background: #f8fafc; text-align: center; padding: 16px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; line-height: 1.4; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-badge">🚨 Inspection Directive</div>
      <h1>SatyaSetu Enforcement Portal</h1>
      <p>Central Consumer Protection Authority • Govt. of India</p>
    </div>
    
    <div class="body">
      <div class="meta-grid">
        <div class="meta-cell">
          <div class="cell-label">Directive Ref</div>
          <div class="cell-val">{directive_ref}</div>
        </div>
        <div class="meta-cell">
          <div class="cell-label">Dispatch Time</div>
          <div class="cell-val">{timestamp_str}</div>
        </div>
        <div class="meta-cell">
          <div class="cell-label">Priority</div>
          <div class="cell-val" style="color: #dc2626;">{priority}</div>
        </div>
      </div>

      <p style="margin: 0 0 14px 0;">
        <strong>ASSIGNED INSPECTOR:</strong> {options.get('assignedOfficer', '')}<br>
        You are hereby directed to execute an <strong>unannounced physical inspection</strong> of the facility specified below:
      </p>

      <div class="factory-card">
        <div class="factory-name">{factory_name}</div>
        <div style="font-size: 12px; color: #2563eb; margin-bottom: 8px;"><strong>Category:</strong> {options.get('category', '')} | <strong>Reg No:</strong> {options.get('registrationNumber', '')}</div>
        <div style="font-size: 12px; color: #334155;"><strong>Facility Address:</strong> {location}, {city}, {state}</div>
        <div style="margin-top: 10px;">
          <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Compliance Health:</span>
          <span style="display: inline-block; background: {score_color}; color: white; padding: 2px 8px; border-radius: 10px; font-weight: 700; font-size: 11px; margin-left: 6px;">
            {overall_score}/100 ({compliance_status})
          </span>
        </div>
        {notes_html}
      </div>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <div style="font-weight: 700; color: #166534; font-size: 12px;">📍 Facility Map Navigation</div>
        <a href="{maps_url}" target="_blank" class="maps-btn">
          🗺️ Open Google Maps Directions &rarr;
        </a>
      </div>

      <p style="margin: 0; font-size: 12px; color: #64748b;">
        Please record physical inspection findings and photographic evidence into the SatyaSetu Inspector Portal immediately upon completion.
      </p>
    </div>

    <div class="footer">
      Official Statutory Enforcement Order • Central Consumer Protection Authority<br>
      Dispatched to: {recipient_email}
    </div>
  </div>
</body>
</html>"""


def send_scn_notice_email(options: Dict[str, Any]) -> Dict[str, Any]:
    """Dispatches Show Cause Notice email via backend Gmail REST API integration."""
    import random
    
    is_enabled = os.getenv("ENABLE_GMAIL_DISPATCH", "true").lower() != "false"
    client_id = os.getenv("GMAIL_CLIENT_ID") or os.getenv("VITE_GMAIL_CLIENT_ID")
    client_secret = os.getenv("GMAIL_CLIENT_SECRET") or os.getenv("VITE_GMAIL_CLIENT_SECRET")
    refresh_token = os.getenv("GMAIL_REFRESH_TOKEN") or os.getenv("VITE_GMAIL_REFRESH_TOKEN")
    sender_email = os.getenv("GMAIL_SENDER_EMAIL") or os.getenv("VITE_GMAIL_SENDER_EMAIL") or "regulatory-notice@satyadrishti.gov.in"
    recipient_override = os.getenv("GMAIL_RECIPIENT_OVERRIDE") or os.getenv("VITE_GMAIL_RECIPIENT_OVERRIDE")

    manufacturer = options.get("manufacturer", "Manufacturer")
    clean_mfg = ''.join(c for c in manufacturer.lower() if c.isalnum())
    target_recipient = recipient_override or options.get("recipientEmail") or f"legal-compliance@{clean_mfg}.com"

    has_credentials = (
        client_id and client_id != "your-google-client-id.apps.googleusercontent.com" and
        refresh_token and refresh_token != "your-google-refresh-token"
    )

    if not is_enabled or not has_credentials:
        print(f"📧 [Backend Gmail API Simulated Dispatch] Credentials missing in .env. Email simulated successfully to: {target_recipient}")
        return {
            "success": True,
            "recipient": target_recipient,
            "mode": "SIMULATED_DEMO",
            "messageId": f"sim-msg-{random.randint(100000, 999999)}"
        }

    try:
        # 1. Access Token
        access_token = _get_oauth2_access_token(client_id, client_secret or "", refresh_token)

        # 2. Build MIME Message
        subject = f"[STATUTORY SCN] {options.get('noticeReference', '')} - Show Cause Notice ({manufacturer})"
        html_content = build_scn_html_email(options, sender_email, target_recipient)

        # Base64 encode subject header
        subject_b64 = base64.b64encode(subject.encode('utf-8')).decode('utf-8')

        mime_lines = [
            f"To: {target_recipient}",
            f"From: {sender_email}",
            f"Subject: =?utf-8?B?{subject_b64}?=",
            "MIME-Version: 1.0",
            "Content-Type: text/html; charset=utf-8",
            "",
            html_content
        ]
        raw_mime = _base64url_encode("\r\n".join(mime_lines))

        # 3. Post to Gmail API
        gmail_url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
        req_payload = json.dumps({"raw": raw_mime}).encode('utf-8')
        
        req = urllib.request.Request(
            gmail_url,
            data=req_payload,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )

        with urllib.request.urlopen(req) as resp:
            res_data = json.loads(resp.read().decode('utf-8'))
            return {
                "success": True,
                "messageId": res_data.get("id"),
                "recipient": target_recipient,
                "mode": "LIVE_GMAIL_API"
            }

    except Exception as err:
        print(f"❌ Backend Gmail API SCN Dispatch Error: {err}")
        return {
            "success": False,
            "recipient": target_recipient,
            "mode": "LIVE_GMAIL_API",
            "error": str(err)
        }


def send_surprise_inspection_email(options: Dict[str, Any]) -> Dict[str, Any]:
    """Dispatches Surprise Inspection Order email via backend Gmail REST API integration."""
    import random

    is_enabled = os.getenv("ENABLE_GMAIL_DISPATCH", "true").lower() != "false"
    client_id = os.getenv("GMAIL_CLIENT_ID") or os.getenv("VITE_GMAIL_CLIENT_ID")
    client_secret = os.getenv("GMAIL_CLIENT_SECRET") or os.getenv("VITE_GMAIL_CLIENT_SECRET")
    refresh_token = os.getenv("GMAIL_REFRESH_TOKEN") or os.getenv("VITE_GMAIL_REFRESH_TOKEN")
    sender_email = os.getenv("GMAIL_SENDER_EMAIL") or os.getenv("VITE_GMAIL_SENDER_EMAIL") or "inspection-alert@satyadrishti.gov.in"
    recipient_override = os.getenv("GMAIL_RECIPIENT_OVERRIDE") or os.getenv("VITE_GMAIL_RECIPIENT_OVERRIDE")

    target_recipient = recipient_override or options.get("officerEmail") or "vivek.sharma.inspect@satyadrishti.gov.in"

    has_credentials = (
        client_id and client_id != "your-google-client-id.apps.googleusercontent.com" and
        refresh_token and refresh_token != "your-google-refresh-token"
    )

    if not is_enabled or not has_credentials:
        print(f"📧 [Backend Gmail API Simulated Dispatch] Credentials missing in .env. Inspection order email simulated to: {target_recipient}")
        return {
            "success": True,
            "recipient": target_recipient,
            "mode": "SIMULATED_DEMO",
            "messageId": f"sim-insp-{random.randint(100000, 999999)}"
        }

    try:
        # 1. Access Token
        access_token = _get_oauth2_access_token(client_id, client_secret or "", refresh_token)

        # 2. Build MIME Message
        subject = f"[URGENT INSPECTION ORDER] Surprise Audit Directive: {options.get('factoryName', '')}"
        html_content = build_surprise_inspection_html_email(options, sender_email, target_recipient)

        # Base64 encode subject header
        subject_b64 = base64.b64encode(subject.encode('utf-8')).decode('utf-8')

        mime_lines = [
            f"To: {target_recipient}",
            f"From: {sender_email}",
            f"Subject: =?utf-8?B?{subject_b64}?=",
            "MIME-Version: 1.0",
            "Content-Type: text/html; charset=utf-8",
            "",
            html_content
        ]
        raw_mime = _base64url_encode("\r\n".join(mime_lines))

        # 3. Post to Gmail API
        gmail_url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
        req_payload = json.dumps({"raw": raw_mime}).encode('utf-8')
        
        req = urllib.request.Request(
            gmail_url,
            data=req_payload,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )

        with urllib.request.urlopen(req) as resp:
            res_data = json.loads(resp.read().decode('utf-8'))
            return {
                "success": True,
                "messageId": res_data.get("id"),
                "recipient": target_recipient,
                "mode": "LIVE_GMAIL_API"
            }

    except Exception as err:
        print(f"❌ Backend Gmail API Inspection Dispatch Error: {err}")
        return {
            "success": False,
            "recipient": target_recipient,
            "mode": "LIVE_GMAIL_API",
            "error": str(err)
        }
