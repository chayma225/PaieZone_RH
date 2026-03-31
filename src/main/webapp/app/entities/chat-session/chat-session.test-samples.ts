import dayjs from 'dayjs/esm';

import { IChatSession, NewChatSession } from './chat-session.model';

export const sampleWithRequiredData: IChatSession = {
  id: 11932,
  channel: 'WEB',
  status: 'EXPIRED',
  startedAt: dayjs('2026-03-30T19:46'),
};

export const sampleWithPartialData: IChatSession = {
  id: 24190,
  channel: 'WHATSAPP',
  status: 'RESOLVED',
  startedAt: dayjs('2026-03-31T08:47'),
  endedAt: dayjs('2026-03-31T14:28'),
  escalatedAt: dayjs('2026-03-31T14:14'),
  escalatedTo: 'au lieu de fonctionnaire commissionnaire',
  contextData: '../fake-data/blob/hipster.txt',
  satisfactionScore: 2,
};

export const sampleWithFullData: IChatSession = {
  id: 24482,
  channel: 'WEB',
  status: 'RESOLVED',
  startedAt: dayjs('2026-03-30T22:35'),
  endedAt: dayjs('2026-03-31T06:22'),
  escalatedAt: dayjs('2026-03-31T09:35'),
  escalatedTo: 'magnifique',
  contextData: '../fake-data/blob/hipster.txt',
  satisfactionScore: 1,
};

export const sampleWithNewData: NewChatSession = {
  channel: 'MOBILE',
  status: 'RESOLVED',
  startedAt: dayjs('2026-03-30T19:51'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
