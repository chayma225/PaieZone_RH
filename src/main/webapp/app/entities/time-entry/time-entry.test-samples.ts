import dayjs from 'dayjs/esm';

import { ITimeEntry, NewTimeEntry } from './time-entry.model';

export const sampleWithRequiredData: ITimeEntry = {
  id: 7308,
  entryDate: dayjs('2026-03-31'),
  source: 'CHATBOT',
  status: 'CORRECTED',
};

export const sampleWithPartialData: ITimeEntry = {
  id: 23234,
  entryDate: dayjs('2026-03-31'),
  checkOut: dayjs('2026-03-31T09:30'),
  workedHours: 3399.09,
  source: 'BADGE',
  status: 'PENDING',
  validatedBy: 'dans',
  validatedAt: dayjs('2026-03-31T04:43'),
};

export const sampleWithFullData: ITimeEntry = {
  id: 31808,
  entryDate: dayjs('2026-03-31'),
  checkIn: dayjs('2026-03-31T03:17'),
  checkOut: dayjs('2026-03-31T07:47'),
  workedHours: 29292.35,
  overtimeHours: 27061.59,
  lateMinutes: 21873,
  source: 'BADGE',
  status: 'ANOMALY',
  anomalyNote: 'envers au-dessus mature',
  validatedBy: 'bien que déchiffrer',
  validatedAt: dayjs('2026-03-31T08:07'),
};

export const sampleWithNewData: NewTimeEntry = {
  entryDate: dayjs('2026-03-31'),
  source: 'MANUAL',
  status: 'CORRECTED',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
