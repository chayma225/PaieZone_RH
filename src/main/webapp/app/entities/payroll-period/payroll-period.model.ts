export type Instant = string;

export type PayrollStatus = 'DRAFT' | 'CALCULATED' | 'VALIDATED' | 'LOCKED';

export interface IPayrollPeriod {
  id?: number;
  month?: number | null;
  year?: number | null;
  status?: PayrollStatus | null;
  calculatedAt?: Instant | null;
  validatedAt?: Instant | null;
  lockedAt?: Instant | null;
  closedBy?: string | null;
  companyId?: number | null;
  companyName?: string | null;
  totalEmployees?: number | null;
  calculatedSlips?: number | null;
}

export type NewPayrollPeriod = Omit<IPayrollPeriod, 'id'> & { id: null };

export const MONTH_LABELS: Record<number, string> = {
  1:  'Janvier',   2: 'Février',  3:  'Mars',
  4:  'Avril',     5: 'Mai',      6:  'Juin',
  7:  'Juillet',   8: 'Août',     9:  'Septembre',
  10: 'Octobre',  11: 'Novembre', 12: 'Décembre',
};

export const STATUS_CONFIG: Record<PayrollStatus, {
  label: string; badge: string; icon: string;
}> = {
  DRAFT:      { label: 'Brouillon', badge: 'bg-secondary',      icon: 'fa-pencil'       },
  CALCULATED: { label: 'Calculé',   badge: 'bg-info text-dark', icon: 'fa-calculator'   },
  VALIDATED:  { label: 'Validé',    badge: 'bg-warning text-dark', icon: 'fa-check-circle' },
  LOCKED:     { label: 'Clôturé',   badge: 'bg-success',        icon: 'fa-lock'         },
};
