import { IBonus, NewBonus } from './bonus.model';

export const sampleWithRequiredData: IBonus = {
  id: 25835,
  bonusType: 'SENIORITY',
  label: 'de par',
  amount: 26422.1,
  taxable: true,
  month: 1,
  year: 15807,
};

export const sampleWithPartialData: IBonus = {
  id: 16346,
  bonusType: 'TRANSPORT',
  label: 'souple',
  amount: 19630.41,
  taxable: true,
  month: 1,
  year: 12118,
};

export const sampleWithFullData: IBonus = {
  id: 9385,
  bonusType: 'OTHER',
  label: 'alors que considérable taper',
  amount: 2846.09,
  taxable: true,
  month: 1,
  year: 1615,
  notes: 'ensuite commis de cuisine glouglou',
};

export const sampleWithNewData: NewBonus = {
  bonusType: 'MEAL',
  label: 'collègue défier décider',
  amount: 29047.36,
  taxable: true,
  month: 10,
  year: 7463,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
