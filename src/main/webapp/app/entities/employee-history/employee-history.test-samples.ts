import dayjs from 'dayjs/esm';

import { IEmployeeHistory, NewEmployeeHistory } from './employee-history.model';

export const sampleWithRequiredData: IEmployeeHistory = {
  id: 16221,
  fieldName: 'plouf',
  changedAt: dayjs('2026-04-07T20:21'),
};

export const sampleWithPartialData: IEmployeeHistory = {
  id: 30381,
  fieldName: 'du fait que',
  oldValue: 'jeune différer',
  changedAt: dayjs('2026-04-08T01:43'),
  changedBy: 'cot cot',
  reason: 'plouf super',
};

export const sampleWithFullData: IEmployeeHistory = {
  id: 29543,
  fieldName: 'tant collègue',
  oldValue: 'équipe de recherche biathlète',
  newValue: 'en faveur de splendide',
  changedAt: dayjs('2026-04-08T12:06'),
  changedBy: 'clac très responsable',
  reason: 'sortir',
};

export const sampleWithNewData: NewEmployeeHistory = {
  fieldName: 'loufoque',
  changedAt: dayjs('2026-04-08T04:04'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
