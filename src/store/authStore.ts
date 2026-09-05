import { create } from 'zustand';
import { AuthState, User, UserRole } from '../types/auth';

export interface PortalConfig {
  id: 'consumer' | 'inspector' | 'manufacturer' | 'admin';
  name: string;
  portalTitle: string;
  badgeLabel: string;
  badgeVariant: 'success' | 'warning' | 'secondary' | 'primary';
  tagline: string;
  description: string;
  demoEmail: string;
  demoPassword: string;
  role: UserRole;
  allowedFeatures: string[];
  accessNotice: string;
}

export const DEMO_PORTAL_CONFIGS: Record<string, PortalConfig> = {
  consumer: {
    id: 'consumer',
    name: 'Consumer Grievance Portal',
    portalTitle: 'Citizen Vigilance & Redressal Gateway',
    badgeLabel: 'Citizen Consumer',
    badgeVariant: 'success',
    tagline: 'Lodge complaints against deceptive packaging, dual MRP & deceptive units under CPA 2019',
    description: 'Dedicated single-window portal for consumers to register grievances, upload product packaging photos/invoices, and track CCPA inquiry progress.',
    demoEmail: 'consumer@demo.gov.in',
    demoPassword: 'consumer123',
    role: 'consumer',
    allowedFeatures: [
      'Lodge Deceptive Packaging Grievance',
      'Upload OCR Evidence & Store Invoices',
      'Track Enforcement Investigation Progress',
      'Real-Time Redressal Notifications',
    ],
    accessNotice: 'Scoped strictly to consumer grievance lodging and tracking. Internal regulatory enforcement modules are restricted.',
  },
  inspector: {
    id: 'inspector',
    name: 'Regulatory Inspector Portal',
    portalTitle: 'Legal Metrology Enforcement Gateway',
    badgeLabel: 'Zonal Inspector',
    badgeVariant: 'warning',
    tagline: 'Field packaging verification, optical OCR scanner & on-ground inspection ledgers',
    description: 'Enforcement dashboard for designated Legal Metrology inspectors to conduct on-site package audits, scan bar codes, and file inspection reports.',
    demoEmail: 'inspector@demo.gov.in',
    demoPassword: 'inspect123',
    role: 'inspector',
    allowedFeatures: [
      'Optical OCR Packaging Label Scanner',
      'Violation Ledger & Evidence Repository',
      'Zonal Manufacturer Risk Auditing',
      'Factory Hygiene Camera Surveillance',
    ],
    accessNotice: 'Authorized for field enforcement, packaging evidence audits, and statutory inspection reports.',
  },
  manufacturer: {
    id: 'manufacturer',
    name: 'Manufacturer & Brand Portal',
    portalTitle: 'Statutory FMCG Compliance Cell',
    badgeLabel: 'Brand Officer',
    badgeVariant: 'secondary',
    tagline: 'Brand compliance management, Show Cause Notice replies & packaging declarations',
    description: 'Enterprise gateway for FMCG brands and manufacturers to audit catalog compliance, review received notices, and verify production facility hygiene.',
    demoEmail: 'manufacturer@demo.gov.in',
    demoPassword: 'manuf123',
    role: 'manufacturer',
    allowedFeatures: [
      'Product Packaging Declaration Verification',
      'Statutory Notice Receipt & Response',
      'Factory Hygiene & Production Facility Scores',
      'Consumer Grievance Response Tracking',
    ],
    accessNotice: 'Authorized for brand representatives to inspect compliance health and submit statutory replies.',
  },
  admin: {
    id: 'admin',
    name: 'Central Admin Portal',
    portalTitle: 'CCPA Directorate National Command',
    badgeLabel: 'Directorate Admin',
    badgeVariant: 'primary',
    tagline: 'Apex surveillance, AI legal review agent, statutory SCN issuance & policy rules',
    description: 'Apex administrative console for the Central Consumer Protection Authority (CCPA) to oversee national market intelligence, dispatch legal notices, and configure rule sets.',
    demoEmail: 'admin@demo.gov.in',
    demoPassword: 'admin123',
    role: 'admin',
    allowedFeatures: [
      'Full System Administration & Rule Config',
      'AI Legal Review & Notice Generation',
      'National Compliance Analytics & Risk Heatmap',
      'Cross-Zone Inspector Allocation',
    ],
    accessNotice: 'Unrestricted administrative authority across all regulatory, intelligence, and enforcement modules.',
  },
};

export const DEMO_USERS: Record<string, User> = {
  'admin@demo.gov.in': {
    id: 'USR-GOV-001',
    name: 'Dr. Rajeshwar Sharma, IAS',
    email: 'admin@demo.gov.in',
    role: 'admin',
    department: 'Central Consumer Protection Authority (CCPA)',
    designation: 'Director General of Regulatory Intelligence',
    badgeNumber: 'CCPA-DIR-8819',
    lastLogin: 'Today, 10:42 AM',
  },
  'inspector@demo.gov.in': {
    id: 'USR-GOV-042',
    name: 'Sunita Meena',
    email: 'inspector@demo.gov.in',
    role: 'inspector',
    department: 'Legal Metrology Enforcement Division',
    designation: 'Senior Legal Metrology Inspector (Zonal)',
    badgeNumber: 'LM-NZ-2041',
    lastLogin: 'Today, 11:15 AM',
  },
  'consumer@demo.gov.in': {
    id: 'USR-CON-902',
    name: 'Ananya Verma',
    email: 'consumer@demo.gov.in',
    role: 'consumer',
    department: 'National Consumer Vigilance Network',
    designation: 'Verified Consumer Advocate',
    badgeNumber: 'NAT-CV-5912',
    lastLogin: 'Yesterday, 04:30 PM',
  },
  'manufacturer@demo.gov.in': {
    id: 'USR-MFG-501',
    name: 'Vikramaditya Singhania',
    email: 'manufacturer@demo.gov.in',
    role: 'manufacturer',
    department: 'Apex FMCG Enterprises / Statutory Affairs',
    designation: 'Chief Compliance & Quality Officer',
    badgeNumber: 'FSSAI-MFG-9402',
    lastLogin: 'Today, 09:15 AM',
  },
};

const STORAGE_KEY = 'satyadrishti_auth_session';

export const useAuthStore = create<AuthState>((set) => {
  // Try to load persisted user
  let initialUser: User | null = null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      initialUser = JSON.parse(saved);
    }
  } catch {
    initialUser = null;
  }

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,

    login: (email: string, requestedRole?: UserRole) => {
      const normalizedEmail = email.trim().toLowerCase();
      let matchedUser = DEMO_USERS[normalizedEmail];

      if (!matchedUser) {
        // Fallback or auto-generate for custom input
        const role = requestedRole || (
          normalizedEmail.includes('admin')
            ? 'admin'
            : normalizedEmail.includes('inspect')
            ? 'inspector'
            : normalizedEmail.includes('manuf') || normalizedEmail.includes('mfg')
            ? 'manufacturer'
            : 'consumer'
        );
        matchedUser = {
          id: `USR-${Date.now().toString().slice(-4)}`,
          name: normalizedEmail.split('@')[0].replace('.', ' ').toUpperCase(),
          email: normalizedEmail,
          role,
          department: role === 'admin'
            ? 'CCPA Directorate'
            : role === 'inspector'
            ? 'Legal Metrology Division'
            : role === 'manufacturer'
            ? 'Manufacturer Compliance Cell'
            : 'Consumer Vigilance Portal',
          designation: role === 'admin'
            ? 'Compliance Admin'
            : role === 'inspector'
            ? 'Field Inspector'
            : role === 'manufacturer'
            ? 'Brand Compliance Officer'
            : 'Registered Citizen',
          badgeNumber: `SAT-${Math.floor(1000 + Math.random() * 9000)}`,
          lastLogin: 'Just now',
        };
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(matchedUser));
      set({ user: matchedUser, isAuthenticated: true });
      return true;
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEY);
      set({ user: null, isAuthenticated: false });
    },

    setUser: (user) => {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        set({ user, isAuthenticated: true });
      } else {
        localStorage.removeItem(STORAGE_KEY);
        set({ user: null, isAuthenticated: false });
      }
    },
  };
});
