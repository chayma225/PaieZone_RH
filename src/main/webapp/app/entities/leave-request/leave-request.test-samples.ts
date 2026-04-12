import dayjs from 'dayjs/esm';

import { ILeaveRequest, NewLeaveRequest } from './leave-request.model';

export const sampleWithRequiredData: ILeaveRequest = {
  id: 2872,
  startDate: dayjs('2026-04-08'),
  endDate: dayjs('2026-04-07'),
  numberOfDays: 30844,
  status: 'CANCELLED',
  requestedAt: dayjs('2026-04-08T06:13'),
};

export const sampleWithPartialData: ILeaveRequest = {
  id: 32442,
  startDate: dayjs('2026-04-08'),
  endDate: dayjs('2026-04-08'),
  numberOfDays: 21254,
  status: 'REJECTED',
  requestedAt: dayjs('2026-04-07T18:49'),
  processedAt: dayjs('2026-04-08T02:01'),
};

export const sampleWithFullData: ILeaveRequest = {
  id: 29174,
  startDate: dayjs('2026-04-08'),
  endDate: dayjs('2026-04-07'),
  numberOfDays: 1722,
  status: 'PENDING',
  requestedAt: dayjs('2026-04-08T12:06'),
  processedAt: dayjs('2026-04-07T23:32'),
  managerComment: 'pff dans la mesure où suffisamment',
  employeeComment: 'meuh glouglou boum',
  documentUrl: 'camarade téméraire',
};

export const sampleWithNewData: NewLeaveRequest = {
  startDate: dayjs('2026-04-08'),
  endDate: dayjs('2026-04-08'),
  numberOfDays: 14532,
  status: 'CANCELLED',
  requestedAt: dayjs('2026-04-08T00:50'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
