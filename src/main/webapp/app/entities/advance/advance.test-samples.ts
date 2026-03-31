import dayjs from 'dayjs/esm';

import { IAdvance, NewAdvance } from './advance.model';

export const sampleWithRequiredData: IAdvance = {
  id: 20848,
  requestDate: dayjs('2026-03-30'),
  amount: 20077.55,
  status: 'DEDUCTED',
};

export const sampleWithPartialData: IAdvance = {
  id: 20499,
  requestDate: dayjs('2026-03-31'),
  amount: 25201.03,
  deductionMonth: 4,
  deductionYear: 24561,
  status: 'DEDUCTED',
  approvedBy: "d'entre pour que sage",
};

export const sampleWithFullData: IAdvance = {
  id: 19661,
  requestDate: dayjs('2026-03-31'),
  amount: 11398.12,
  deductionMonth: 1,
  deductionYear: 4750,
  status: 'DEDUCTED',
  approvedBy: 'électorat sincère',
  notes: 'pourvu que paf',
};

export const sampleWithNewData: NewAdvance = {
  requestDate: dayjs('2026-03-31'),
  amount: 25800.43,
  status: 'REQUESTED',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
