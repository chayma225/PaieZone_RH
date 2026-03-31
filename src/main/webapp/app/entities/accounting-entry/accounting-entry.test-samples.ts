import dayjs from 'dayjs/esm';

import { IAccountingEntry, NewAccountingEntry } from './accounting-entry.model';

export const sampleWithRequiredData: IAccountingEntry = {
  id: 29728,
  entryDate: dayjs('2026-03-31'),
  journalRef: 'touriste',
  entryType: 'SALARY_EXPENSE',
  description: 'maintenant',
  debitAccount: 'vorace vlan',
  creditAccount: 'vraiment',
  amount: 9088.62,
};

export const sampleWithPartialData: IAccountingEntry = {
  id: 2288,
  entryDate: dayjs('2026-03-31'),
  journalRef: 'population du Québec',
  entryType: 'BANK_TRANSFER',
  description: 'exprès juriste complètement',
  debitAccount: 'analyser par suite d',
  creditAccount: 'alors bzzz',
  amount: 25376.95,
  exportedAt: dayjs('2026-03-31T12:34'),
  exportRef: 'maintenant pratiquer',
};

export const sampleWithFullData: IAccountingEntry = {
  id: 2900,
  entryDate: dayjs('2026-03-31'),
  journalRef: 'négliger comme',
  entryType: 'CNSS_EXPENSE',
  description: 'juriste dynamique',
  debitAccount: 'd’autant que membre ',
  creditAccount: 'tourner afin que',
  amount: 19965.83,
  exportedAt: dayjs('2026-03-31T11:54'),
  exportFormat: 'personnel',
  exportRef: 'en dehors de',
};

export const sampleWithNewData: NewAccountingEntry = {
  entryDate: dayjs('2026-03-31'),
  journalRef: 'd’autant que',
  entryType: 'BANK_TRANSFER',
  description: 'loufoque magnifique au cas où',
  debitAccount: 'magnifique',
  creditAccount: 'smack coac coac',
  amount: 1961.58,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
