import dayjs from 'dayjs/esm';

import { IPayrollPeriod, NewPayrollPeriod } from './payroll-period.model';

export const sampleWithRequiredData: IPayrollPeriod = {
  id: 28379,
  month: 8,
  year: 15444,
  status: 'VALIDATED',
};

export const sampleWithPartialData: IPayrollPeriod = {
  id: 926,
  month: 2,
  year: 11857,
  status: 'VALIDATED',
  calculatedAt: dayjs('2026-03-31T01:57'),
  validatedAt: dayjs('2026-03-30T21:05'),
  lockedAt: dayjs('2026-03-30T19:53'),
  notes: '../fake-data/blob/hipster.txt',
};

export const sampleWithFullData: IPayrollPeriod = {
  id: 19088,
  month: 1,
  year: 1530,
  status: 'CALCULATED',
  calculatedAt: dayjs('2026-03-31T00:53'),
  validatedAt: dayjs('2026-03-31T03:10'),
  lockedAt: dayjs('2026-03-30T21:03'),
  notes: '../fake-data/blob/hipster.txt',
};

export const sampleWithNewData: NewPayrollPeriod = {
  month: 6,
  year: 28883,
  status: 'EXPORTED',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
