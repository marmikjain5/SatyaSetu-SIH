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
    # Format penalty in INR format (e.g. ₹50,000)
    try:
        formatted_penalty = f"₹{int(penalty_estimate):,}"
    except Exception:
        formatted_penalty = f"₹{penalty_estimate}"

    issue_date = datetime.now().strftime("%d %B %Y")

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }}
    .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; }}
    .header {{ background-color: #0f172a; color: #ffffff; text-align: center; padding: 20px; }}
    .header h1 {{ margin: 0; font-size: 16px; letter-spacing: 1px; }}
    .header p {{ margin: 5px 0 0 0; font-size: 11px; color: #94a3b8; }}
    .body {{ padding: 24px; font-size: 13px; line-height: 1.6; }}
    .meta-box {{ background: #f1f5f9; padding: 12px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #2563eb; }}
    .contravention-box {{ background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; margin: 15px 0; }}
    .contravention-title {{ color: #b91c1c; font-weight: bold; margin-bottom: 5px; }}
    .footer {{ background: #f8fafc; text-align: center; padding: 15px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }}
    .badge {{ display: inline-block; background: #dc2626; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CENTRAL CONSUMER PROTECTION AUTHORITY (CCPA)</h1>
      <p>Ministry of Consumer Affairs, Food & Public Distribution • Govt. of India</p>
    </div>
    
    <div class="body">
      <div style="text-align: right;"><span class="badge">STATUTORY SUMMONS</span></div>
      
      <div class="meta-box">
        <strong>NOTICE REFERENCE:</strong> {options.get('noticeReference', '')}<br>
        <strong>CASE FILE NUMBER:</strong> {options.get('caseNumber', '')}<br>
        <strong>DATE OF ISSUANCE:</strong> {issue_date}
      </div>

      <p><strong>TO:</strong><br>
      The Managing Director / Authorized Compliance Officer<br>
      <strong>{options.get('manufacturer', '')}</strong><br>
      Product / Brand: {options.get('productName', '')} ({options.get('brand', '')})<br>
      E-Commerce Marketplace: {options.get('platform', '')}</p>

      <p><strong>SUBJECT: SHOW CAUSE NOTICE UNDER SECTION 36 & 39 OF LEGAL METROLOGY ACT, 2009 (PACKAGED COMMODITIES RULES, 2011)</strong></p>

      <p>1. WHEREAS, automated optical surveillance and algorithmic compliance audit conducted by the National SatyaDrishti Intelligence Platform has uncovered prima facie statutory non-compliance in respect of the pre-packaged commodity marketed by your entity.</p>

      <div class="contravention-box">
        <div class="contravention-title">SPECIFIC CONTRAVENTION RECORD</div>
        <strong>Contravention:</strong> {options.get('description', '')}<br>
        <strong>Statutory Clause:</strong> {options.get('section', '')} ({options.get('actName', '')})<br>
        <strong>Optical Evidence Record:</strong> {options.get('extractedValue', '')}<br>
        <strong>Prescribed Standard:</strong> {options.get('expectedStandard', '')}
      </div>

      <p>2. NOW THEREFORE, you are hereby called upon to <strong>SHOW CAUSE</strong> in writing within <strong>fifteen (15) days</strong> of receipt of this notice as to why penal proceedings involving compoundable penalty up to <strong>{formatted_penalty}</strong> and legal prosecution should not be initiated against your company and designated directors.</p>

      <div style="margin-top: 25px; border-top: 1px solid #cbd5e1; padding-top: 15px;">
        <strong>Digitally Signed & Dispatched By:</strong><br>
        {options.get('assignedOfficer', '')}<br>
        <em>Authorized Regulatory Officer, Legal Metrology Enforcement Division</em>
      </div>
    </div>

    <div class="footer">
      This is an official statutory communication generated by SatyaDrishti Legal Enforcement Engine.<br>
      Sent from: {sender_email} • Delivered to: {recipient_email}
    </div>
  </div>
</body>
</html>"""


def build_surprise_inspection_html_email(options: Dict[str, Any], sender_email: str, recipient_email: str) -> str:
    """Constructs HTML formatted Surprise Inspection Order email body."""
    import random
    directive_ref = f"INSP-DIR-{random.randint(100000, 999999)}"
    timestamp_str = datetime.now().strftime("%A, %d %B %Y, %I:%M:%S %p")

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
        notes_html = f'<p style="margin-top: 10px; font-size: 12px; font-style: italic; color: #92400e;"><strong>Special Notes:</strong> {directive_notes}</p>'

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }}
    .container {{ max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
    .header {{ background-color: #0f172a; color: #ffffff; text-align: center; padding: 24px; border-bottom: 4px solid #dc2626; }}
    .header h1 {{ margin: 0; font-size: 18px; letter-spacing: 1.5px; font-weight: 800; text-transform: uppercase; }}
    .header p {{ margin: 6px 0 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }}
    .body {{ padding: 28px; font-size: 13px; line-height: 1.6; }}
    .urgent-banner {{ background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 12px 16px; border-radius: 6px; font-weight: bold; font-size: 13px; margin-bottom: 20px; display: flex; items-center; justify-content: space-between; }}
    .meta-grid {{ background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; margin: 16px 0; display: grid; gap: 8px; }}
    .meta-item {{ font-size: 12px; }}
    .meta-label {{ font-weight: bold; color: #475569; width: 140px; display: inline-block; }}
    .factory-card {{ background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; border-radius: 6px; margin: 20px 0; }}
    .score-badge {{ display: inline-block; background: {score_color}; color: white; padding: 3px 10px; border-radius: 12px; font-weight: bold; font-size: 12px; }}
    .directive-box {{ background: #fffbebfb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; margin: 20px 0; }}
    .maps-box {{ background: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px 16px; border-radius: 8px; margin: 16px 0; }}
    .maps-btn {{ display: inline-block; background-color: #16a34a; color: #ffffff !important; text-decoration: none; padding: 9px 18px; border-radius: 6px; font-weight: bold; font-size: 12px; margin-top: 8px; }}
    .footer {{ background: #f8fafc; text-align: center; padding: 16px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SatyaSetu Intelligence & Enforcement Portal</h1>
      <p>Central Consumer Protection Authority • Ministry of Consumer Affairs, Govt. of India</p>
    </div>
    
    <div class="body">
      <div class="urgent-banner">
        <span>🚨 URGENT: UNANNOUNCED SURPRISE INSPECTION DIRECTIVE</span>
      </div>
      
      <p><strong>OFFICIAL ORDER ISSUED TO:</strong><br>
      <strong>{options.get('assignedOfficer', '')}</strong><br>
      Regulatory Compliance & Enforcement Division</p>

      <div class="meta-grid">
        <div class="meta-item"><span class="meta-label">DIRECTIVE REF:</span> <strong>{directive_ref}</strong></div>
        <div class="meta-item"><span class="meta-label">DISPATCH TIMESTAMP:</span> <span>{timestamp_str}</span></div>
        <div class="meta-item"><span class="meta-label">PRIORITY STATUS:</span> <span style="color: #dc2626; font-weight: bold;">{priority}</span></div>
      </div>

      <p>In accordance with statutory powers vested under the Legal Metrology Act, 2009 and Central Compliance Guidelines, you are hereby ordered to conduct an <strong>immediate, unannounced surprise physical inspection</strong> of the following manufacturing facility:</p>

      <div class="factory-card">
        <div style="font-size: 16px; font-weight: bold; color: #1e3a8a; margin-bottom: 6px;">{factory_name}</div>
        <div style="font-size: 12px; color: #3b82f6; margin-bottom: 12px;">Category: {options.get('category', '')}</div>
        
        <div class="meta-item"><span class="meta-label">Registration No:</span> {options.get('registrationNumber', '')}</div>
        <div class="meta-item"><span class="meta-label">Facility Location:</span> {location}, {city}, {state}</div>
        <div class="meta-item" style="margin-top: 8px;">
          <span class="meta-label">Compliance Score:</span>
          <span class="score-badge">{overall_score}/100 ({compliance_status})</span>
        </div>
        <div class="meta-item" style="margin-top: 4px;">
          <span class="meta-label">Active Alerts:</span> <strong>{options.get('activeAlerts', 0)} alerts</strong> | 
          <span class="meta-label" style="width: auto;">Open Violations:</span> <strong>{options.get('openViolationsCount', 0)} open</strong>
        </div>
      </div>

      <!-- ── Google Maps Navigation Box ── -->
      <div class="maps-box">
        <div style="font-weight: bold; color: #15803d; font-size: 13px;">📍 FACILITY LOCATION & NAVIGATION</div>
        <div style="font-size: 12px; color: #166534; margin-top: 4px;">
          <strong>Target Address:</strong> {location}, {city}, {state}
        </div>
        <a href="{maps_url}" target="_blank" class="maps-btn">
          🗺️ Open Directions on Google Maps &rarr;
        </a>
        <div style="font-size: 10px; color: #15803d; margin-top: 6px; word-break: break-all;">
          Direct Link: <a href="{maps_url}" target="_blank" style="color: #15803d;">{maps_url}</a>
        </div>
      </div>

      <div class="directive-box">
        <div style="font-weight: bold; color: #b45309; margin-bottom: 6px;">INSPECTION SCOPE & MANDATE:</div>
        <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #78350f;">
          <li>Inspect packaged commodities for mandatory Legal Metrology (PCR 2011) declarations.</li>
          <li>Audit net quantity declarations and check for weight/volume discrepancies.</li>
          <li>Verify Maximum Retail Price (MRP) declarations and check for dual pricing or smudging.</li>
          <li>Verify manufacturer, packer, and importer address and contact declarations.</li>
        </ul>
        {notes_html}
      </div>

      <p>Please log inspection findings, high-resolution photographic evidence, and formal verification records back into the SatyaSetu Inspector Portal immediately upon conclusion of the audit.</p>

      <div style="margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 12px; color: #475569;">
        <strong>Authorized Officer Dispatch Command</strong><br>
        SatyaSetu Automated Surveillance & Legal Metrology Enforcement Engine<br>
        <em>Government of India</em>
      </div>
    </div>

    <div class="footer">
      This is an official statutory inspection directive.<br>
      Dispatched to: {recipient_email} • Generated from SatyaSetu Inspector Portal
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
