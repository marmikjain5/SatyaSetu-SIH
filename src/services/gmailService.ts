/**
 * SatyaDrishti Gmail API Dispatch Service
 * Handles OAuth2 Refresh Token exchange and raw RFC 2822 MIME email dispatch via Google Cloud Console Gmail API.
 */

export interface SendSCNEmailOptions {
  noticeReference: string;
  caseNumber: string;
  manufacturer: string;
  productName: string;
  brand: string;
  platform: string;
  actName: string;
  section: string;
  description: string;
  extractedValue: string;
  expectedStandard: string;
  penaltyEstimate: number;
  assignedOfficer: string;
  recipientEmail?: string;
}

export interface SendSurpriseInspectionEmailOptions {
  factoryId: string;
  factoryName: string;
  registrationNumber: string;
  fssaiLicense: string;
  location: string;
  city: string;
  state: string;
  category: string;
  overallScore: number;
  complianceStatus: string;
  activeAlerts: number;
  openViolationsCount: number;
  assignedOfficer: string;
  officerEmail?: string;
  priority?: string;
  directiveNotes?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  recipient: string;
  mode: 'LIVE_GMAIL_API' | 'SIMULATED_DEMO';
  error?: string;
}

/**
 * Encodes a string into base64url format required by Gmail API raw message payload.
 */
function base64UrlEncode(str: string): string {
  try {
    const encoded = btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (err) {
    console.error('Failed to base64url encode string:', err);
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}

/**
 * Refreshes OAuth2 access token using Google Cloud OAuth Client ID, Secret, and Refresh Token.
 */
async function getOAuth2AccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<string> {
  const tokenUrl = 'https://oauth2.googleapis.com/token';

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error_description || errorData.error || `OAuth token exchange failed with HTTP ${response.status}`
    );
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error('OAuth2 response did not include access_token');
  }

  return data.access_token;
}

/**
 * Constructs an HTML formatted Show Cause Notice email body.
 */
function buildSCNHtmlEmail(options: SendSCNEmailOptions, senderEmail: string, recipientEmail: string): string {
  const formattedPenalty = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(options.penaltyEstimate);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; }
    .header { background-color: #0f172a; color: #ffffff; text-align: center; padding: 20px; }
    .header h1 { margin: 0; font-size: 16px; letter-spacing: 1px; }
    .header p { margin: 5px 0 0 0; font-size: 11px; color: #94a3b8; }
    .body { padding: 24px; font-size: 13px; line-height: 1.6; }
    .meta-box { background: #f1f5f9; padding: 12px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #2563eb; }
    .contravention-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; margin: 15px 0; }
    .contravention-title { color: #b91c1c; font-weight: bold; margin-bottom: 5px; }
    .footer { background: #f8fafc; text-align: center; padding: 15px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .badge { display: inline-block; background: #dc2626; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; }
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
        <strong>NOTICE REFERENCE:</strong> ${options.noticeReference}<br>
        <strong>CASE FILE NUMBER:</strong> ${options.caseNumber}<br>
        <strong>DATE OF ISSUANCE:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
      </div>

      <p><strong>TO:</strong><br>
      The Managing Director / Authorized Compliance Officer<br>
      <strong>${options.manufacturer}</strong><br>
      Product / Brand: ${options.productName} (${options.brand})<br>
      E-Commerce Marketplace: ${options.platform}</p>

      <p><strong>SUBJECT: SHOW CAUSE NOTICE UNDER SECTION 36 OF LEGAL METROLOGY ACT, 2009 & CONSUMER PROTECTION ACT, 2019</strong></p>

      <p>1. WHEREAS, automated optical surveillance and algorithmic compliance audit conducted by the National SatyaDrishti Intelligence Platform has uncovered prima facie statutory non-compliance in respect of the pre-packaged commodity marketed by your entity.</p>

      <div class="contravention-box">
        <div class="contravention-title">SPECIFIC CONTRAVENTION RECORD</div>
        <strong>Contravention:</strong> ${options.description}<br>
        <strong>Statutory Clause:</strong> ${options.section} (${options.actName})<br>
        <strong>Optical Evidence Record:</strong> ${options.extractedValue}<br>
        <strong>Prescribed Standard:</strong> ${options.expectedStandard}
      </div>

      <p>2. NOW THEREFORE, you are hereby called upon to <strong>SHOW CAUSE</strong> in writing within <strong>fifteen (15) days</strong> of receipt of this notice as to why penal proceedings involving compoundable penalty up to <strong>${formattedPenalty}</strong> and legal prosecution should not be initiated against your company and designated directors.</p>

      <div style="margin-top: 25px; border-top: 1px solid #cbd5e1; padding-top: 15px;">
        <strong>Digitally Signed & Dispatched By:</strong><br>
        ${options.assignedOfficer}<br>
        <em>Authorized Regulatory Officer, Central Consumer Protection Authority</em>
      </div>
    </div>

    <div class="footer">
      This is an official statutory communication generated by SatyaDrishti Legal Enforcement Engine.<br>
      Sent from: ${senderEmail} • Delivered to: ${recipientEmail}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Dispatches Show Cause Notice email via Gmail API REST v1 endpoint.
 */
export async function sendSCNNoticeEmail(options: SendSCNEmailOptions): Promise<SendEmailResult> {
  const isEnabled = import.meta.env.VITE_ENABLE_GMAIL_DISPATCH !== 'false';
  const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_GMAIL_CLIENT_SECRET;
  const refreshToken = import.meta.env.VITE_GMAIL_REFRESH_TOKEN;
  const senderEmail = import.meta.env.VITE_GMAIL_SENDER_EMAIL || 'regulatory-notice@satyadrishti.gov.in';

  // Recipient resolution: use override if specified, otherwise options.recipientEmail or fallback corporate email
  const targetRecipient =
    import.meta.env.VITE_GMAIL_RECIPIENT_OVERRIDE ||
    options.recipientEmail ||
    `legal-compliance@${options.manufacturer.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

  const hasCredentials =
    clientId &&
    clientId !== 'your-google-client-id.apps.googleusercontent.com' &&
    refreshToken &&
    refreshToken !== 'your-google-refresh-token';

  // Fallback / Demo Mode when real Google Cloud credentials aren't provided in .env yet
  if (!isEnabled || !hasCredentials) {
    console.info(
      '📧 [Gmail API Simulated Dispatch] Credentials missing in .env. Email simulated successfully to:',
      targetRecipient
    );
    return {
      success: true,
      recipient: targetRecipient,
      mode: 'SIMULATED_DEMO',
      messageId: `sim-msg-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }

  try {
    // 1. Obtain Fresh OAuth2 Access Token
    const accessToken = await getOAuth2AccessToken(clientId!, clientSecret!, refreshToken!);

    // 2. Build MIME Email Message
    const subject = `[STATUTORY SCN] ${options.noticeReference} - Show Cause Notice (${options.manufacturer})`;
    const htmlContent = buildSCNHtmlEmail(options, senderEmail, targetRecipient);

    const subjectEncoded = btoa(
      encodeURIComponent(subject).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );

    const mimeMessageLines = [
      `To: ${targetRecipient}`,
      `From: ${senderEmail}`,
      `Subject: =?utf-8?B?${subjectEncoded}?=`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      htmlContent,
    ];

    const rawMime = base64UrlEncode(mimeMessageLines.join('\r\n'));

    // 3. Send Message via Gmail REST API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: rawMime,
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(
        errorPayload.error?.message || `Gmail API returned HTTP status ${response.status}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.id,
      recipient: targetRecipient,
      mode: 'LIVE_GMAIL_API',
    };
  } catch (err: any) {
    console.error('❌ Gmail API Dispatch Error:', err);
    return {
      success: false,
      recipient: targetRecipient,
      mode: 'LIVE_GMAIL_API',
      error: err.message || 'Failed to dispatch email via Gmail API',
    };
  }
}

/**
 * Constructs HTML formatted Surprise Inspection Order email body.
 */
function buildSurpriseInspectionHtmlEmail(
  options: SendSurpriseInspectionEmailOptions,
  senderEmail: string,
  recipientEmail: string
): string {
  const directiveRef = `INSP-DIR-${Math.floor(100000 + Math.random() * 900000)}`;
  const timestampStr = new Date().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background-color: #0f172a; color: #ffffff; text-align: center; padding: 24px; border-bottom: 4px solid #dc2626; }
    .header h1 { margin: 0; font-size: 18px; letter-spacing: 1.5px; font-weight: 800; text-transform: uppercase; }
    .header p { margin: 6px 0 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .body { padding: 28px; font-size: 13px; line-height: 1.6; }
    .urgent-banner { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 12px 16px; border-radius: 6px; font-weight: bold; font-size: 13px; margin-bottom: 20px; display: flex; items-center; justify-content: space-between; }
    .meta-grid { background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; margin: 16px 0; display: grid; gap: 8px; }
    .meta-item { font-size: 12px; }
    .meta-label { font-weight: bold; color: #475569; width: 140px; display: inline-block; }
    .factory-card { background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; border-radius: 6px; margin: 20px 0; }
    .score-badge { display: inline-block; background: ${options.overallScore < 60 ? '#dc2626' : options.overallScore < 80 ? '#d97706' : '#16a34a'}; color: white; padding: 3px 10px; border-radius: 12px; font-weight: bold; font-size: 12px; }
    .directive-box { background: #fffbebfb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; margin: 20px 0; }
    .footer { background: #f8fafc; text-align: center; padding: 16px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
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
      <strong>${options.assignedOfficer}</strong><br>
      Regulatory Compliance & Enforcement Division</p>

      <div class="meta-grid">
        <div class="meta-item"><span class="meta-label">DIRECTIVE REF:</span> <strong>${directiveRef}</strong></div>
        <div class="meta-item"><span class="meta-label">DISPATCH TIMESTAMP:</span> <span>${timestampStr}</span></div>
        <div class="meta-item"><span class="meta-label">PRIORITY STATUS:</span> <span style="color: #dc2626; font-weight: bold;">${options.priority || 'IMMEDIATE / HIGH PRIORITY'}</span></div>
      </div>

      <p>In accordance with statutory powers vested under the Legal Metrology Act, 2009 and FSSAI Hygiene Guidelines, you are hereby ordered to conduct an <strong>immediate, unannounced surprise physical inspection</strong> of the following manufacturing facility:</p>

      <div class="factory-card">
        <div style="font-size: 16px; font-weight: bold; color: #1e3a8a; margin-bottom: 6px;">${options.factoryName}</div>
        <div style="font-size: 12px; color: #3b82f6; margin-bottom: 12px;">Category: ${options.category}</div>
        
        <div class="meta-item"><span class="meta-label">Registration No:</span> ${options.registrationNumber}</div>
        <div class="meta-item"><span class="meta-label">FSSAI License:</span> ${options.fssaiLicense}</div>
        <div class="meta-item"><span class="meta-label">Facility Location:</span> ${options.location}, ${options.city}, ${options.state}</div>
        <div class="meta-item" style="margin-top: 8px;">
          <span class="meta-label">Hygiene Health Score:</span>
          <span class="score-badge">${options.overallScore}/100 (${options.complianceStatus.toUpperCase()})</span>
        </div>
        <div class="meta-item" style="margin-top: 4px;">
          <span class="meta-label">Active Alerts:</span> <strong>${options.activeAlerts} alerts</strong> | 
          <span class="meta-label" style="width: auto;">Open Violations:</span> <strong>${options.openViolationsCount} open</strong>
        </div>
      </div>

      <div class="directive-box">
        <div style="font-weight: bold; color: #b45309; margin-bottom: 6px;">INSPECTION SCOPE & MANDATE:</div>
        <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #78350f;">
          <li>Inspect production zone cleanroom environments and worker PPE compliance.</li>
          <li>Verify temperature and moisture telemetry parameters across raw material bays.</li>
          <li>Audit equipment sanitation logs and pest control barriers.</li>
          <li>Inspect product packaging compliance and net quantity accuracy.</li>
        </ul>
        ${options.directiveNotes ? `<p style="margin-top: 10px; font-size: 12px; font-style: italic; color: #92400e;"><strong>Special Notes:</strong> ${options.directiveNotes}</p>` : ''}
      </div>

      <p>Please log inspection findings, high-resolution photographic evidence, and formal zone scores back into the SatyaSetu Inspector Portal immediately upon conclusion of the audit.</p>

      <div style="margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 12px; color: #475569;">
        <strong>Authorized Officer Dispatch Command</strong><br>
        SatyaSetu Automated Surveillance & Hygiene Enforcement Engine<br>
        <em>Government of India</em>
      </div>
    </div>

    <div class="footer">
      This is an official statutory inspection directive.<br>
      Dispatched to: ${recipientEmail} • Generated from SatyaSetu Inspector Portal
    </div>
  </div>
</body>
</html>`;
}

/**
 * Dispatches Surprise Inspection Notice email via Gmail API REST v1 endpoint.
 */
export async function sendSurpriseInspectionNoticeEmail(
  options: SendSurpriseInspectionEmailOptions
): Promise<SendEmailResult> {
  const isEnabled = import.meta.env.VITE_ENABLE_GMAIL_DISPATCH !== 'false';
  const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_GMAIL_CLIENT_SECRET;
  const refreshToken = import.meta.env.VITE_GMAIL_REFRESH_TOKEN;
  const senderEmail = import.meta.env.VITE_GMAIL_SENDER_EMAIL || 'inspection-alert@satyadrishti.gov.in';

  // Recipient resolution: officerEmail -> VITE_GMAIL_RECIPIENT_OVERRIDE -> fallback
  const targetRecipient =
    import.meta.env.VITE_GMAIL_RECIPIENT_OVERRIDE ||
    options.officerEmail ||
    'vivek.sharma.inspect@satyadrishti.gov.in';

  const hasCredentials =
    clientId &&
    clientId !== 'your-google-client-id.apps.googleusercontent.com' &&
    refreshToken &&
    refreshToken !== 'your-google-refresh-token';

  // Fallback / Demo Mode when real Google Cloud credentials aren't provided in .env yet
  if (!isEnabled || !hasCredentials) {
    console.info(
      '📧 [Gmail API Simulated Dispatch] Credentials missing in .env. Inspection order email simulated to:',
      targetRecipient
    );
    return {
      success: true,
      recipient: targetRecipient,
      mode: 'SIMULATED_DEMO',
      messageId: `sim-insp-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }

  try {
    // 1. Obtain Fresh OAuth2 Access Token
    const accessToken = await getOAuth2AccessToken(clientId!, clientSecret!, refreshToken!);

    // 2. Build MIME Email Message
    const subject = `[URGENT INSPECTION ORDER] Surprise Audit Directive: ${options.factoryName}`;
    const htmlContent = buildSurpriseInspectionHtmlEmail(options, senderEmail, targetRecipient);

    const subjectEncoded = btoa(
      encodeURIComponent(subject).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );

    const mimeMessageLines = [
      `To: ${targetRecipient}`,
      `From: ${senderEmail}`,
      `Subject: =?utf-8?B?${subjectEncoded}?=`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      htmlContent,
    ];

    const rawMime = base64UrlEncode(mimeMessageLines.join('\r\n'));

    // 3. Send Message via Gmail REST API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: rawMime,
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      throw new Error(
        errorPayload.error?.message || `Gmail API returned HTTP status ${response.status}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.id,
      recipient: targetRecipient,
      mode: 'LIVE_GMAIL_API',
    };
  } catch (err: any) {
    console.error('❌ Gmail API Inspection Dispatch Error:', err);
    return {
      success: false,
      recipient: targetRecipient,
      mode: 'LIVE_GMAIL_API',
      error: err.message || 'Failed to dispatch inspection email via Gmail API',
    };
  }
}

