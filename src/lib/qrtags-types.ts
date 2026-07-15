// Agency types
export type AgencyType = 'travel' | 'hotel' | 'bus' | 'school' | 'medical' | 'company' | 'event';

export interface AgencyTypeConfig {
  type: AgencyType;
  label: string;
  emoji: string;
  description: string;
  badgeColor: string;
  icon: string; // lucide icon name
  features: string[];
  useCases: string[];
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  address: string | null;
  agencyType: AgencyType;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  customMessage: string | null;
  plan: 'free' | 'pro' | 'enterprise';
  isActive: boolean;
  createdAt: string;
  _count?: {
    baggageSets: number;
    scanLogs: number;
  };
}

export interface AgencyCustomField {
  id: string;
  agencyType: AgencyType;
  fieldName: string;
  fieldType: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'email' | 'phone';
  label: string;
  placeholder: string | null;
  required: boolean;
  options: string[] | null; // for select fields
  sortOrder: number;
}

export interface BaggageSet {
  id: string;
  name: string;
  agencyId: string;
  quantity: number;
  prefix: string;
  createdAt: string;
  agency?: Agency;
  _count?: {
    baggages: number;
  };
}

export interface Baggage {
  id: string;
  reference: string;
  setId: string;
  ownerName: string | null;
  ownerPhone: string | null;
  itemDescription: string | null;
  itemColor: string | null;
  itemBrand: string | null;
  identificationMark: string | null;
  customData: Record<string, string> | null;
  isActive: boolean;
  activatedAt: string | null;
  createdAt: string;
  set?: BaggageSet;
}

export interface ScanLog {
  id: string;
  baggageId: string;
  agencyId: string;
  finderName: string | null;
  finderPhone: string | null;
  finderMessage: string | null;
  location: string | null;
  status: 'scanned' | 'reported_found' | 'claimed';
  scannedAt: string;
  baggage?: Baggage;
  agency?: Agency;
}

export interface DashboardStats {
  totalAgencies: number;
  activeAgencies: number;
  totalBaggageSets: number;
  totalQRCodes: number;
  totalScans: number;
  scansToday: number;
  agenciesByType: Record<string, number>;
  recentScans: ScanLog[];
}

// View types for SPA navigation
export type AppView = 'landing' | 'dashboard' | 'scanner' | 'pricing';
export type DashboardTab = 'overview' | 'agencies' | 'generate' | 'scans' | 'settings';