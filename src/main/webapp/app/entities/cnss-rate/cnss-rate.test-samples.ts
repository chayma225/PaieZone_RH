import dayjs from 'dayjs/esm';

import { ICnssRate, NewCnssRate } from './cnss-rate.model';

export const sampleWithRequiredData: ICnssRate = {
  id: 18219,
  year: 22498,
  employeeRate: 20479.88,
  employerRate: 13964.53,
  smig: 30307.94,
  effectiveFrom: dayjs('2026-04-08'),
};

export const sampleWithPartialData: ICnssRate = {
  id: 10035,
  year: 12755,
  salaryCeiling: 3759.6,
  employeeRate: 12613.06,
  employerRate: 24954.16,
  smig: 31861.92,
  effectiveFrom: dayjs('2026-04-08'),
};

export const sampleWithFullData: ICnssRate = {
  id: 11475,
  year: 6396,
  salaryCeiling: 30920.87,
  employeeRate: 84.14,
  employerRate: 16061.13,
  cavisEmployee: 11039.6,
  cavisEmployer: 22568.93,
  smig: 18977.4,
  effectiveFrom: dayjs('2026-04-08'),
};

export const sampleWithNewData: NewCnssRate = {
  year: 6430,
  employeeRate: 11906.52,
  employerRate: 27649.44,
  smig: 25321.36,
  effectiveFrom: dayjs('2026-04-08'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
