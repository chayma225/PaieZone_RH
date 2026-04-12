import dayjs from 'dayjs/esm';

import { IKnowledgeDocument, NewKnowledgeDocument } from './knowledge-document.model';

export const sampleWithRequiredData: IKnowledgeDocument = {
  id: 6702,
  title: 'favoriser intrépide assurément',
  content: '../fake-data/blob/hipster.txt',
  vectorIndexed: true,
  active: true,
  createdAt: dayjs('2026-04-08T02:55'),
};

export const sampleWithPartialData: IKnowledgeDocument = {
  id: 31318,
  title: 'smack de façon à ce que',
  content: '../fake-data/blob/hipster.txt',
  vectorIndexed: true,
  active: true,
  createdAt: dayjs('2026-04-08T18:14'),
};

export const sampleWithFullData: IKnowledgeDocument = {
  id: 32623,
  title: 'hystérique considérer',
  category: 'revoir parlementaire à demi',
  content: '../fake-data/blob/hipster.txt',
  fileUrl: 'avant de coin-coin charitable',
  vectorIndexed: true,
  indexedAt: dayjs('2026-04-08T04:20'),
  active: false,
  createdAt: dayjs('2026-04-08T02:24'),
};

export const sampleWithNewData: NewKnowledgeDocument = {
  title: 'conseil d’administration afin que',
  content: '../fake-data/blob/hipster.txt',
  vectorIndexed: true,
  active: true,
  createdAt: dayjs('2026-04-08T13:25'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
