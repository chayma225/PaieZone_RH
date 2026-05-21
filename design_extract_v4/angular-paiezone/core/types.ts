// PaieZone RH — Shared types

export type Role = 'super' | 'admin' | 'rh' | 'emp';

export interface RoleTab {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

export interface RoleConfig {
  label: string;
  sub: string;
  initials: string;
  color: string;
  tabs: RoleTab[];
  default: string;
}

export interface Company {
  id: number;
  name: string;
  tradeName: string;
  taxId: string;
  city: string;
  employees: number;
  plan: 'STARTER' | 'PME' | 'BUSINESS' | 'ENTERPRISE' | 'CUSTOM';
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';
  priceHT: number;
  renewal: string;
  schema: string;
  mrr: number;
}

export interface Employee {
  id: number;
  matricule: string;
  first: string;
  last: string;
  ar: string;
  role: string;
  dept: string;
  salary: number;
  contract: 'CDI' | 'CDD' | 'CIVP' | 'KARAMA';
  hireDate: string;
  city: string;
  cnss: string;
  email: string;
  phone: string;
  cat: string;
  gender: 'M' | 'F';
  children: number;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  head: string;
  count: number;
}

export interface PayrollPeriod {
  id: number;
  month: number;
  year: number;
  label: string;
  status: 'DRAFT' | 'CALCULATED' | 'VALIDATED' | 'LOCKED' | 'EXPORTED';
  employees: number;
  gross: number;
  net: number;
  validatedAt: string | null;
  lockedAt: string | null;
}

export interface LeaveRequest {
  id: string;
  empId: number;
  type: string;
  days: number;
  from: string;
  to: string;
  submitted: string;
  status: 'pending' | 'approved' | 'rejected';
  note: string;
}

export interface Advance {
  id: string;
  empId: number;
  amount: number;
  reason: string;
  submitted: string;
  status: 'pending' | 'approved' | 'rejected';
  repayment: string;
}

export interface AuditEntry {
  id: number;
  user: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  ip: string;
  date: string;
  detail: string;
}

export interface TenantUser {
  id: number;
  empId: number;
  role: 'ADMIN' | 'RH_COMPTABLE' | 'EMPLOYE';
  lastLogin: string;
  active: boolean;
  twofa: boolean;
}

export interface ChatMessage {
  role: 'me' | 'bot';
  text: string;
  cite?: string;
}
