import { IPaySlipLine, NewPaySlipLine } from './pay-slip-line.model';

export const sampleWithRequiredData: IPaySlipLine = {
  id: 27845,
  sortOrder: 26351,
  rubriqueCode: 'terriblement triste',
  rubriqueLabel: 'ouch',
  rubriqueType: 'EMPLOYER_CHARGE',
  amount: 28010.73,
  taxable: true,
};

export const sampleWithPartialData: IPaySlipLine = {
  id: 5400,
  sortOrder: 17142,
  rubriqueCode: 'ici raide équipe',
  rubriqueLabel: 'casser à partir de',
  rubriqueType: 'DEDUCTION',
  rate: 14852.01,
  amount: 13879.48,
  taxable: false,
};

export const sampleWithFullData: IPaySlipLine = {
  id: 23989,
  sortOrder: 4286,
  rubriqueCode: 'adorable sous couleu',
  rubriqueLabel: 'atchoum de sorte que',
  rubriqueType: 'EMPLOYER_CHARGE',
  base: 3510.47,
  rate: 21110.35,
  amount: 16510.71,
  taxable: false,
};

export const sampleWithNewData: NewPaySlipLine = {
  sortOrder: 27383,
  rubriqueCode: 'vanter dès',
  rubriqueLabel: 'extatique',
  rubriqueType: 'EMPLOYER_CHARGE',
  amount: 10938.26,
  taxable: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
