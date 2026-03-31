import dayjs from 'dayjs/esm';

import { IChatMessage, NewChatMessage } from './chat-message.model';

export const sampleWithRequiredData: IChatMessage = {
  id: 1166,
  role: 'USER',
  content: '../fake-data/blob/hipster.txt',
  sentAt: dayjs('2026-03-31T00:44'),
};

export const sampleWithPartialData: IChatMessage = {
  id: 12635,
  role: 'SYSTEM',
  content: '../fake-data/blob/hipster.txt',
  intent: 'SMALL_TALK',
  tokenUsed: 30421,
  sentAt: dayjs('2026-03-31T10:57'),
  errorOccurred: false,
};

export const sampleWithFullData: IChatMessage = {
  id: 20495,
  role: 'SYSTEM',
  content: '../fake-data/blob/hipster.txt',
  intent: 'LEAVE_BALANCE',
  actionTaken: 'gens meuh miaou',
  tokenUsed: 16675,
  sentAt: dayjs('2026-03-31T09:16'),
  errorOccurred: true,
};

export const sampleWithNewData: NewChatMessage = {
  role: 'USER',
  content: '../fake-data/blob/hipster.txt',
  sentAt: dayjs('2026-03-30T20:57'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
