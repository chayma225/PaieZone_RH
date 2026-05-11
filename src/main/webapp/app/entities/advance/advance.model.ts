// src/main/webapp/app/entities/advance/advance.model.ts
export interface IAdvance {
  id: number;
  requestDate?: string | null;
  amount?: number | null;
  reason?: string | null;
  deductionMonth?: number | null;
  deductionYear?: number | null;
  status?: AdvanceStatus | null;
  approvedBy?: string | null;
  approvedAt?: any | null;
  notes?: string | null;
  employeeId?: number | null;
  paySlipId?: number | null;
}
export type NewAdvance = Omit<IAdvance, 'id'> & { id: null };

// ✅ Correspond EXACTEMENT à l'enum Java AdvanceStatus
export enum AdvanceStatus {
  REQUESTED = 'REQUESTED',  // ← PAS PENDING
  APPROVED  = 'APPROVED',
  REJECTED  = 'REJECTED',
  DEDUCTED  = 'DEDUCTED',
}

// ✅ Couleurs pour tous les statuts
export const ADVANCE_STATUS_COLORS: Record<string, string> = {
  REQUESTED: 'bg-secondary',
  APPROVED:  'bg-success',
  REJECTED:  'bg-danger',
  DEDUCTED:  'bg-dark',
};

export const ADVANCE_STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'En attente',
  APPROVED:  'Approuvée',
  REJECTED:  'Rejetée',
  DEDUCTED:  'Déduite',
};
