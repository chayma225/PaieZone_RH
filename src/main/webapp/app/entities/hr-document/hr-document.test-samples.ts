import dayjs from 'dayjs/esm';

import { IHrDocument, NewHrDocument } from './hr-document.model';

export const sampleWithRequiredData: IHrDocument = {
  id: 26245,
  documentType: 'CONTRACT',
  title: 'moyennant émérite',
  fileUrl: 'tromper',
  uploadedAt: dayjs('2026-04-08T00:11'),
  active: false,
};

export const sampleWithPartialData: IHrDocument = {
  id: 13991,
  documentType: 'ATTESTATION',
  title: 'disparaître tantôt',
  description: 'habituer même si',
  fileUrl: 'antagoniste pourvu que',
  fileSize: 14498,
  uploadedAt: dayjs('2026-04-08T17:29'),
  expiryDate: dayjs('2026-04-08'),
  active: true,
};

export const sampleWithFullData: IHrDocument = {
  id: 7273,
  documentType: 'ATTESTATION',
  title: 'oui',
  description: 'âcre',
  fileUrl: 'horrible conformer comme',
  fileSize: 12639,
  mimeType: 'quoique',
  uploadedAt: dayjs('2026-04-07T20:43'),
  expiryDate: dayjs('2026-04-07'),
  active: true,
};

export const sampleWithNewData: NewHrDocument = {
  documentType: 'PAYSLIP',
  title: 'chef de cuisine',
  fileUrl: 'consentir chez',
  uploadedAt: dayjs('2026-04-08T07:42'),
  active: true,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
