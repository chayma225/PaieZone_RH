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
  cnssId: string;
  city: string;
  gouvernorat: string;
  address: string;
  postalCode: string;
  email: string;
  phone: string;
  website: string;
  legalForm: string;
  capitalSocial: number | null;
  mainActivity: string;
  employees: number;
  plan: 'STARTER' | 'PME' | 'BUSINESS' | 'ENTERPRISE' | 'CUSTOM';
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';
  priceHT: number;
  maxEmployees: number | null;
  renewal: string;
  schema: string;
  createdAt: string;
  mrr: number;
  logoUrl: string | null;
}

export interface Employee {
  id: number;
  matricule: string;
  first: string;
  last: string;
  active?: boolean;
  ar: string;
  role: string;
  dept: string;
  salary: number;
  contract: 'CDI' | 'CDD' | 'CIVP' | 'KARAMA' | 'INTERIMAIRE' | 'STAGE';
  hireDate: string;
  city: string;
  cnss: string;
  email: string;
  phone: string;
  cat: string;
  gender: 'M' | 'F';
  children: number;
  manager?: string;
  birthDate?: string;
  nationalId?: string;
  maritalStatus?: string;
  chefDeFamille?: boolean;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  head: string;
  count: number;
  active?: boolean;
  description?: string;
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
  action?: { label: string; route?: string; href?: string };
}

export interface JobPosition {
  id: number;
  code: string;
  title: string;
  description: string;
  minSalary: number | null;
  maxSalary: number | null;
  active: boolean;
}

export interface Bonus {
  id: number;
  bonusType: string;
  label: string;
  amount: number;
  taxable: boolean;
  month: number;
  year: number;
  notes: string;
  employeeId: number;
  paySlipId: number | null;
}

export interface Rubrique {
  id: number;
  code: string;
  label: string;
  rubriqueType: 'GAIN' | 'DEDUCTION' | 'EMPLOYER_CHARGE' | 'INFO';
  base: 'FIXED' | 'PERCENT_BRUT' | 'PERCENT_NET' | 'HOURS' | 'FORMULA';
  rate: number | null;
  fixedAmount: number | null;
  taxable: boolean;
  cnssSalary: boolean;
  cnssEmployer?: boolean;
  sortOrder: number;
  active: boolean;
}

export interface PaySlip {
  id: number;
  month: number;
  year: number;
  baseSalary: number;
  grossSalary: number;
  netSalary: number;
  totalGains: number;
  totalDeductions: number;
  cnssSalaryAmount: number;
  cavisAmount: number | null;
  cssAmount: number | null;
  irppAmount: number;
  totalEmployerCost: number;
  bonusTotal: number | null;
  advanceDeduction: number | null;
  status: 'DRAFT' | 'CALCULATED' | 'VALIDATED' | 'LOCKED' | 'EXPORTED';
  employeeId: number;
  payrollPeriodId: number;
}

export interface HrDocument {
  id: number;
  documentType: string;
  title: string;
  description: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string;
  uploadedAt: string;
  expiryDate: string | null;
  active: boolean;
  employeeId: number;
}

export interface Contract {
  id: number;
  reference: string;
  contractType: 'CDI' | 'CDD' | 'CIVP' | 'KARAMA' | 'INTERIMAIRE' | 'STAGE';
  status: 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'EXPIRED';
  startDate: string;
  endDate: string | null;
  signedDate: string | null;
  baseSalary: number;
  jobTitle: string | null;
  workingHoursWeek: number;
  workingDaysWeek: number;
  conventionCollective: string | null;
  trialPeriodMonths: number | null;
  renewalCount: number | null;
  notes: string | null;
  employeeId: number;
}

export interface LeaveBalance {
  id: number;
  year: number;
  entitled: number;
  taken: number;
  pending: number;
  carryOver: number;
  remaining: number;
  leaveTypeName: string;
}

export interface RegulatoryParam {
  id: number;
  paramKey: string;
  paramLabel: string;
  category: string | null;
  numericValue: number | null;
  stringValue: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  legalReference: string | null;
  description: string | null;
  active: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface ActivityItem {
  icon: string;
  userLogin: string;
  message: string;
  dateLabel: string;
  timeHm: string;
  entityType: string;
  entityId: number | null;
}

export interface PayrollChartPoint {
  month: number;
  year: number;
  label: string;
  brut: number;
  charges: number;
}

export interface ContractAlert {
  id: number;
  reference: string;
  contractType: string;
  endDate: string;
  daysLeft: number;
  employeeName: string;
}

export interface AccountPlan {
  id: number;
  accountCode: string;
  accountLabel: string;
  accountType: string | null;
  active: boolean;
}

export interface AccountingEntry {
  id: number;
  entryDate: string;
  journalRef: string;
  entryType: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  exportedAt: string | null;
  periodLabel?: string;
  periodId?: number;
}

export interface LeaveType {
  id: number;
  code: string;
  label: string;
  maxDaysPerYear: number;
  paid: boolean;
  requiresApproval: boolean;
  active: boolean;
  description: string;
}
