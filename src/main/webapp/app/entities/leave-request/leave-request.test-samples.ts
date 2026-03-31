import dayjs from 'dayjs/esm';

import { ILeaveRequest, NewLeaveRequest } from './leave-request.model';

export const sampleWithRequiredData: ILeaveRequest = {
  id: 2872,
  startDate: dayjs('2026-03-31'),
  endDate: dayjs('2026-03-30'),
  numberOfDays: 30844,
  status: 'CANCELLED',
  requestedAt: dayjs('2026-03-31T05:54'),
};

export const sampleWithPartialData: ILeaveRequest = {
  id: 32442,
  startDate: dayjs('2026-03-31'),
  endDate: dayjs('2026-03-31'),
  numberOfDays: 21254,
  status: 'REJECTED',
  requestedAt: dayjs('2026-03-30T18:29'),
  processedAt: dayjs('2026-03-31T01:42'),
};

export const sampleWithFullData: ILeaveRequest = {
  id: 29174,
  startDate: dayjs('2026-03-31'),
  endDate: dayjs('2026-03-30'),
  numberOfDays: 1722,
  status: 'PENDING',
  requestedAt: dayjs('2026-03-31T11:46'),
  processedAt: dayjs('2026-03-30T23:12'),
  managerComment: 'pff dans la mesure où suffisamment',
  employeeComment: 'meuh glouglou boum',
  documentUrl: 'camarade téméraire',
};

export const sampleWithNewData: NewLeaveRequest = {
  startDate: dayjs('2026-03-31'),
  endDate: dayjs('2026-03-31'),
  numberOfDays: 14532,
  status: 'CANCELLED',
  requestedAt: dayjs('2026-03-31T00:30'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
