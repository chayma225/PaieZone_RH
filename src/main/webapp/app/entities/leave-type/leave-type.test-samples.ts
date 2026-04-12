import { ILeaveType, NewLeaveType } from './leave-type.model';

export const sampleWithRequiredData: ILeaveType = {
  id: 30745,
  name: 'MARRIAGE',
  label: 'pourvu que dring',
  maxDaysPerYear: 5433,
  carryOverDays: 4690,
  paid: true,
  requiresMedical: true,
  active: true,
};

export const sampleWithPartialData: ILeaveType = {
  id: 18626,
  name: 'BEREAVEMENT',
  label: 'paf soutenir',
  maxDaysPerYear: 2468,
  carryOverDays: 10221,
  paid: false,
  requiresMedical: false,
  active: true,
};

export const sampleWithFullData: ILeaveType = {
  id: 24419,
  name: 'SICK',
  label: 'vu que pin-pon',
  maxDaysPerYear: 16334,
  carryOverDays: 4602,
  paid: false,
  requiresMedical: true,
  active: false,
};

export const sampleWithNewData: NewLeaveType = {
  name: 'MARRIAGE',
  label: 'de façon que aigre',
  maxDaysPerYear: 20417,
  carryOverDays: 19778,
  paid: false,
  requiresMedical: false,
  active: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
