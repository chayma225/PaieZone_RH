import dayjs from 'dayjs/esm';

import { IContract, NewContract } from './contract.model';

export const sampleWithRequiredData: IContract = {
  id: 1607,
  reference: 'rédaction atchoum',
  contractType: 'KARAMA',
  status: 'EXPIRED',
  startDate: dayjs('2026-03-30'),
  baseSalary: 1477.05,
  workingHoursWeek: 35,
  workingDaysWeek: 2,
  createdAt: dayjs('2026-03-31T11:05'),
};

export const sampleWithPartialData: IContract = {
  id: 5834,
  reference: 'concernant',
  contractType: 'INTERIMAIRE',
  status: 'EXPIRED',
  startDate: dayjs('2026-03-31'),
  baseSalary: 1967.67,
  workingHoursWeek: 48,
  workingDaysWeek: 4,
  conventionCollective: 'trop vouh à la merci',
  documentUrl: 'diablement extrêmement alors que',
  notes: '../fake-data/blob/hipster.txt',
  createdAt: dayjs('2026-03-31T17:08'),
};

export const sampleWithFullData: IContract = {
  id: 9674,
  reference: "à l'exception de plic où",
  contractType: 'INTERIMAIRE',
  status: 'SUSPENDED',
  startDate: dayjs('2026-03-31'),
  endDate: dayjs('2026-03-31'),
  signedDate: dayjs('2026-03-30'),
  baseSalary: 23037.06,
  workingHoursWeek: 22,
  workingDaysWeek: 2,
  conventionCollective: 'clientèle fonctionnaire toucher',
  trialPeriodMonths: 11,
  renewalCount: 12495,
  documentUrl: 'un peu bof glouglou',
  notes: '../fake-data/blob/hipster.txt',
  createdAt: dayjs('2026-03-30T23:20'),
};

export const sampleWithNewData: NewContract = {
  reference: 'loin de',
  contractType: 'CDD',
  status: 'SUSPENDED',
  startDate: dayjs('2026-03-31'),
  baseSalary: 18665.49,
  workingHoursWeek: 26,
  workingDaysWeek: 3,
  createdAt: dayjs('2026-03-30T19:21'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
