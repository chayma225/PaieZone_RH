import { ITaxBracket, NewTaxBracket } from './tax-bracket.model';

export const sampleWithRequiredData: ITaxBracket = {
  id: 25194,
  year: 30750,
  minIncome: 15172.22,
  rate: 29369.39,
  fixedDeduction: 30441.86,
  sortOrder: 7056,
};

export const sampleWithPartialData: ITaxBracket = {
  id: 30873,
  year: 26935,
  minIncome: 31524.78,
  maxIncome: 8886.64,
  rate: 27947.86,
  fixedDeduction: 230.48,
  sortOrder: 14841,
};

export const sampleWithFullData: ITaxBracket = {
  id: 21030,
  year: 30447,
  minIncome: 6045.12,
  maxIncome: 28283.8,
  rate: 12543.31,
  fixedDeduction: 795.49,
  sortOrder: 25013,
};

export const sampleWithNewData: NewTaxBracket = {
  year: 22456,
  minIncome: 22617.15,
  rate: 32435.03,
  fixedDeduction: 20231.73,
  sortOrder: 13606,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
