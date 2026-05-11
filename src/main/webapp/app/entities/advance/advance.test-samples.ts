import dayjs from 'dayjs/esm';
import { IAdvance, NewAdvance, AdvanceStatus } from './advance.model';

/**
 * ✅ Données minimales obligatoires
 * Note : J'ai corrigé requestDate pour qu'il soit compatible avec le type attendu.
 */
export const sampleWithRequiredData: IAdvance = {
  id: 20848,
  requestDate: '2026-04-07',
  amount: 20077.55,
  status: AdvanceStatus.DEDUCTED, // ✅ Utilisation de l'Enum au lieu de la string
};

/**
 * ✅ Données partielles
 */
export const sampleWithPartialData: IAdvance = {
  id: 20499,
  requestDate: '2026-04-08',
  amount: 25201.03,
  deductionMonth: 4,
  deductionYear: 2026,
  status: AdvanceStatus.DEDUCTED,
  approvedBy: 'Admin RH',
};

/**
 * ✅ Données complètes
 */
export const sampleWithFullData: IAdvance = {
  id: 19661,
  requestDate: '2026-04-08',
  amount: 11398.12,
  reason: 'Besoin personnel urgent',
  deductionMonth: 5,
  deductionYear: 2026,
  status: AdvanceStatus.DEDUCTED,
  approvedBy: 'Responsable Paie',
  approvedAt: dayjs('2026-04-08T10:00:00'),
  notes: 'Avance validée après vérification du solde.',
  employeeId: 1,
  paySlipId: 100,
};

/**
 * ✅ Nouvelle avance (sans ID)
 */
export const sampleWithNewData: NewAdvance = {
  id: null,
  requestDate: '2026-04-08',
  amount: 25800.43,
  status: AdvanceStatus.REQUESTED,
};

// Gel des objets pour les tests
Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
