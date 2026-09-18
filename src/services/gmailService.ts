/**
 * SatyaDrishti Backend Email Dispatch Client Service
 * 
 * Secure Client for sending emails via FastAPI Python Backend Service.
 * Removes sensitive OAuth Refresh Tokens and Client Secrets from client bundle.
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

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Dispatches Show Cause Notice email securely via FastAPI backend API.
 */
export async function sendSCNNoticeEmail(options: SendSCNEmailOptions): Promise<SendEmailResult> {
  const endpoint = `${BACKEND_BASE_URL}/api/email/send-scn`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Backend email API returned HTTP status ${response.status}`
      );
    }

    const data: SendEmailResult = await response.json();
    return data;
  } catch (err: any) {
    console.error('❌ Backend Email Dispatch Error (SCN):', err);

    const targetRecipient =
      options.recipientEmail ||
      `legal-compliance@${options.manufacturer.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

    return {
      success: false,
      recipient: targetRecipient,
      mode: 'SIMULATED_DEMO',
      error: err.message || 'Failed to reach backend email dispatch service',
    };
  }
}

/**
 * Dispatches Surprise Inspection Notice email securely via FastAPI backend API.
 */
export async function sendSurpriseInspectionNoticeEmail(
  options: SendSurpriseInspectionEmailOptions
): Promise<SendEmailResult> {
  const endpoint = `${BACKEND_BASE_URL}/api/email/send-inspection`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Backend email API returned HTTP status ${response.status}`
      );
    }

    const data: SendEmailResult = await response.json();
    return data;
  } catch (err: any) {
    console.error('❌ Backend Email Dispatch Error (Inspection Directive):', err);

    const targetRecipient = options.officerEmail || 'vivek.sharma.inspect@satyadrishti.gov.in';

    return {
      success: false,
      recipient: targetRecipient,
      mode: 'SIMULATED_DEMO',
      error: err.message || 'Failed to reach backend email dispatch service',
    };
  }
}

