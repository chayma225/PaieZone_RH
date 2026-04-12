import dayjs from 'dayjs/esm';

import { IChatSession, NewChatSession } from './chat-session.model';

export const sampleWithRequiredData: IChatSession = {
  id: 11932,
  channel: 'WEB',
  status: 'EXPIRED',
  startedAt: dayjs('2026-04-07T20:05'),
};

export const sampleWithPartialData: IChatSession = {
  id: 24190,
  channel: 'WHATSAPP',
  status: 'RESOLVED',
  startedAt: dayjs('2026-04-08T09:07'),
  endedAt: dayjs('2026-04-08T14:47'),
  escalatedAt: dayjs('2026-04-08T14:33'),
  escalatedTo: 'au lieu de fonctionnaire commissionnaire',
  contextData: '../fake-data/blob/hipster.txt',
  satisfactionScore: 2,
};

export const sampleWithFullData: IChatSession = {
  id: 24482,
  channel: 'WEB',
  status: 'RESOLVED',
  startedAt: dayjs('2026-04-07T22:55'),
  endedAt: dayjs('2026-04-08T06:42'),
  escalatedAt: dayjs('2026-04-08T09:55'),
  escalatedTo: 'magnifique',
  contextData: '../fake-data/blob/hipster.txt',
  satisfactionScore: 1,
};

export const sampleWithNewData: NewChatSession = {
  channel: 'MOBILE',
  status: 'RESOLVED',
  startedAt: dayjs('2026-04-07T20:10'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
