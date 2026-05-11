// src/main/webapp/app/entities/bonus/bonus.model.ts
export interface IBonus {
  id: number;
  bonusType?: string | null;
  label?: string | null;
  amount?: number | null;
  taxable?: boolean | null;
  month?: number | null;
  year?: number | null;
  notes?: string | null;
  employeeId?: number | null;
  paySlipId?: number | null;
}
export type NewBonus = Omit<IBonus, 'id'> & { id: null };

export const BONUS_TYPES = [
  'PERFORMANCE',
  'ANCIENNETE',
  'TRANSPORT',
  'REPAS',
  'LOGEMENT',
  'EXCEPTIONNELLE',
  'AUTRE'
] as const;

export type BonusTypeValue = typeof BONUS_TYPES[number];
