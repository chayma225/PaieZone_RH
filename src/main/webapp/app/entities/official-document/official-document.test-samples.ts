import dayjs from 'dayjs/esm';

import { IOfficialDocument, NewOfficialDocument } from './official-document.model';

export const sampleWithRequiredData: IOfficialDocument = {
  id: 22361,
  docType: 'EMPLOYER_DECLARATION',
  title: 'sitôt que extrêmement',
  year: 31693,
  generatedAt: dayjs('2026-04-08T13:13'),
};

export const sampleWithPartialData: IOfficialDocument = {
  id: 30388,
  docType: 'EMPLOYER_DECLARATION',
  title: 'tant',
  month: 8,
  year: 19519,
  generatedAt: dayjs('2026-04-08T05:01'),
  sentAt: dayjs('2026-04-08T09:17'),
  notes: 'hypocrite abolir',
};

export const sampleWithFullData: IOfficialDocument = {
  id: 1559,
  docType: 'SALARY_ATTESTATION',
  title: 'super relever',
  month: 9,
  year: 3826,
  generatedAt: dayjs('2026-04-08T00:57'),
  fileUrl: 'dehors prolonger toc-toc',
  signedBy: 'si insuffisamment',
  sentAt: dayjs('2026-04-08T00:56'),
  notes: 'insipide',
};

export const sampleWithNewData: NewOfficialDocument = {
  docType: 'WORK_CERTIFICATE',
  title: 'responsable cuicui',
  year: 12362,
  generatedAt: dayjs('2026-04-08T09:03'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
