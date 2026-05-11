import dayjs from 'dayjs/esm';
import { IPayrollPeriod, NewPayrollPeriod, PayrollStatus } from './payroll-period.model';

/**
 * ✅ Données minimales obligatoires
 * On utilise PayrollStatus.VALIDATED au lieu de la chaîne 'VALIDATED'
 */
export const sampleWithRequiredData: IPayrollPeriod = {
  id: 28379,
  month: 8,
  year: 2026,
  status: PayrollStatus.VALIDATED,
};

/**
 * ✅ Données partielles
 */
export const sampleWithPartialData: IPayrollPeriod = {
  id: 926,
  month: 2,
  year: 2026,
  status: PayrollStatus.VALIDATED,
  calculatedAt: dayjs('2026-04-08T02:16'),
  validatedAt: dayjs('2026-04-07T21:25'),
  lockedAt: dayjs('2026-04-07T20:13'),
  notes: 'Notes pour la période de Février',
};

/**
 * ✅ Données complètes
 */
export const sampleWithFullData: IPayrollPeriod = {
  id: 19088,
  month: 1,
  year: 2026,
  status: PayrollStatus.CALCULATED,
  calculatedAt: dayjs('2026-04-08T01:13'),
  validatedAt: dayjs('2026-04-08T03:30'),
  lockedAt: dayjs('2026-04-07T21:23'),
  closedBy: 'admin_pfe',
  notes: 'Période de test pour le module de paie',
  createdBy: 'system',
  companyId: 1,
};

/**
 * ✅ Nouvelle période (sans ID)
 */
export const sampleWithNewData: NewPayrollPeriod = {
  id: null,
  month: 6,
  year: 2026,
  status: PayrollStatus.DRAFT,
};

// Gel des objets pour garantir l'immutabilité des tests
Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
