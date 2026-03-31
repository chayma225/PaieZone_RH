import dayjs from 'dayjs/esm';

import { IAuditLog, NewAuditLog } from './audit-log.model';

export const sampleWithRequiredData: IAuditLog = {
  id: 24557,
  action: 'sédentaire crac',
  occurredAt: dayjs('2026-03-30T22:56'),
};

export const sampleWithPartialData: IAuditLog = {
  id: 7104,
  action: 'sous couleur de',
  entityType: 'parce que dans la mesure où par rapport à',
  entityId: 21720,
  oldValue: '../fake-data/blob/hipster.txt',
  newValue: '../fake-data/blob/hipster.txt',
  userAgent: 'grâce à de ouille',
  occurredAt: dayjs('2026-03-30T19:30'),
};

export const sampleWithFullData: IAuditLog = {
  id: 16792,
  action: 'gigantesque lentement malade',
  entityType: 'vide',
  entityId: 2865,
  oldValue: '../fake-data/blob/hipster.txt',
  newValue: '../fake-data/blob/hipster.txt',
  ipAddress: 'hé ding depuis',
  userAgent: 'en plus de ding',
  occurredAt: dayjs('2026-03-31T17:35'),
};

export const sampleWithNewData: NewAuditLog = {
  action: 'diablement commis de cuisine',
  occurredAt: dayjs('2026-03-31T05:21'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
