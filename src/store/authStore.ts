import { create } from 'zustand';
import { AuthState, User, UserRole } from '../types/auth';

const DEMO_USERS: Record<string, User> = {
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
    department: 'Citizen Vigilance Network',
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
