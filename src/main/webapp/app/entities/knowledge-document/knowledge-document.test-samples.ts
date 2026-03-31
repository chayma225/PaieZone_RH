import dayjs from 'dayjs/esm';

import { IKnowledgeDocument, NewKnowledgeDocument } from './knowledge-document.model';

export const sampleWithRequiredData: IKnowledgeDocument = {
  id: 6702,
  title: 'favoriser intrépide assurément',
  content: '../fake-data/blob/hipster.txt',
  vectorIndexed: true,
  active: true,
  createdAt: dayjs('2026-03-31T02:36'),
};

export const sampleWithPartialData: IKnowledgeDocument = {
  id: 31318,
  title: 'smack de façon à ce que',
  content: '../fake-data/blob/hipster.txt',
  vectorIndexed: true,
  active: true,
  createdAt: dayjs('2026-03-31T17:55'),
};

export const sampleWithFullData: IKnowledgeDocument = {
  id: 32623,
  title: 'hystérique considérer',
  category: 'revoir parlementaire à demi',
  content: '../fake-data/blob/hipster.txt',
  fileUrl: 'avant de coin-coin charitable',
  vectorIndexed: true,
  indexedAt: dayjs('2026-03-31T04:01'),
  active: false,
  createdAt: dayjs('2026-03-31T02:05'),
};

export const sampleWithNewData: NewKnowledgeDocument = {
  title: 'conseil d’administration afin que',
  content: '../fake-data/blob/hipster.txt',
  vectorIndexed: true,
  active: true,
  createdAt: dayjs('2026-03-31T13:05'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
