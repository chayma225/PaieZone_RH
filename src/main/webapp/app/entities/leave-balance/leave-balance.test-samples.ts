import dayjs from 'dayjs/esm';

import { ILeaveBalance, NewLeaveBalance } from './leave-balance.model';

export const sampleWithRequiredData: ILeaveBalance = {
  id: 8011,
  year: 9684,
  entitled: 5147.82,
  taken: 2731.25,
  pending: 23147.1,
  carryOver: 7255.91,
  remaining: 24913.6,
  lastUpdatedAt: dayjs('2026-03-31T14:42'),
};

export const sampleWithPartialData: ILeaveBalance = {
  id: 13648,
  year: 23064,
  entitled: 28284.89,
  taken: 6118.99,
  pending: 361.53,
  carryOver: 19856.56,
  remaining: 195.46,
  lastUpdatedAt: dayjs('2026-03-31T07:25'),
};

export const sampleWithFullData: ILeaveBalance = {
  id: 666,
  year: 28726,
  entitled: 19474.14,
  taken: 19543.84,
  pending: 5010.68,
  carryOver: 18584.24,
  remaining: 25007.87,
  lastUpdatedAt: dayjs('2026-03-30T22:06'),
};

export const sampleWithNewData: NewLeaveBalance = {
  year: 3425,
  entitled: 17666.56,
  taken: 8937.24,
  pending: 32243.86,
  carryOver: 3598.34,
  remaining: 26926.53,
  lastUpdatedAt: dayjs('2026-03-31T04:03'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
