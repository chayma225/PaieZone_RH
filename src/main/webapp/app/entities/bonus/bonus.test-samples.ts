import { IBonus, NewBonus } from './bonus.model';

/**
 * ✅ Données minimales obligatoires
 * Adaptation du type : 'SENIORITY' -> 'ANCIENNETE'
 */
export const sampleWithRequiredData: IBonus = {
  id: 25835,
  bonusType: 'ANCIENNETE',
  label: 'Prime d’ancienneté',
  amount: 150.00,
  taxable: true,
  month: 5,
  year: 2026,
};

/**
 * ✅ Données partielles
 */
export const sampleWithPartialData: IBonus = {
  id: 16346,
  bonusType: 'TRANSPORT',
  label: 'Indemnité transport',
  amount: 60.00,
  taxable: false,
  month: 5,
  year: 2026,
};

/**
 * ✅ Données complètes
 */
export const sampleWithFullData: IBonus = {
  id: 9385,
  bonusType: 'EXCEPTIONNELLE',
  label: 'Prime de rendement exceptionnelle',
  amount: 500.00,
  taxable: true,
  month: 5,
  year: 2026,
  notes: 'Prime accordée pour le succès du projet PFE',
  employeeId: 1,
  paySlipId: 102
};

/**
 * ✅ Nouveau bonus (sans ID)
 * Adaptation du type : 'MEAL' -> 'REPAS'
 */
export const sampleWithNewData: NewBonus = {
  id: null,
  bonusType: 'REPAS',
  label: 'Tickets Repas',
  amount: 120.00,
  taxable: false,
  month: 6,
  year: 2026,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
