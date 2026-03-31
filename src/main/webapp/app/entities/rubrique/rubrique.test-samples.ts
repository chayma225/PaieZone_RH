import { IRubrique, NewRubrique } from './rubrique.model';

export const sampleWithRequiredData: IRubrique = {
  id: 18924,
  code: 'rapide',
  label: 'aussitôt que mature',
  rubriqueType: 'GAIN',
  base: 'PERCENT_BRUT',
  taxable: false,
  cnssSalary: false,
  cnssEmployer: true,
  sortOrder: 30803,
  active: false,
};

export const sampleWithPartialData: IRubrique = {
  id: 12955,
  code: 'délégation brûler',
  label: 'coin-coin sauf à protéger',
  rubriqueType: 'DEDUCTION',
  base: 'PERCENT_NET',
  rate: 27484.66,
  fixedAmount: 17706.86,
  taxable: true,
  cnssSalary: true,
  cnssEmployer: true,
  sortOrder: 9152,
  active: false,
};

export const sampleWithFullData: IRubrique = {
  id: 9089,
  code: 'personnel',
  label: "à l'instar de altruiste croâ",
  labelAr: 'ci',
  rubriqueType: 'DEDUCTION',
  base: 'PERCENT_BRUT',
  rate: 9595.84,
  fixedAmount: 17007.26,
  formula: 'sous couleur de',
  taxable: false,
  cnssSalary: false,
  cnssEmployer: false,
  sortOrder: 14421,
  active: true,
};

export const sampleWithNewData: NewRubrique = {
  code: 'extatique près de',
  label: 'même si chef de cuisine',
  rubriqueType: 'INFO',
  base: 'HOURS',
  taxable: true,
  cnssSalary: false,
  cnssEmployer: false,
  sortOrder: 7594,
  active: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
