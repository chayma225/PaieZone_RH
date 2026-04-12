import { IAccountPlan, NewAccountPlan } from './account-plan.model';

export const sampleWithRequiredData: IAccountPlan = {
  id: 17177,
  accountCode: 'meuh',
  accountLabel: 'ouf',
  active: false,
};

export const sampleWithPartialData: IAccountPlan = {
  id: 5432,
  accountCode: 'sous couleur de',
  accountLabel: 'placide',
  accountType: 'ouille juriste',
  active: false,
};

export const sampleWithFullData: IAccountPlan = {
  id: 30607,
  accountCode: 'pour',
  accountLabel: 'débile effondrer',
  accountLabelAr: 'peu personnel professionnel',
  accountType: 'pour',
  active: true,
};

export const sampleWithNewData: NewAccountPlan = {
  accountCode: 'fonder lorsque',
  accountLabel: 'à défaut de drelin timide',
  active: true,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
