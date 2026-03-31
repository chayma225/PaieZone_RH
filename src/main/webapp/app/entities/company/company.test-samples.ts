import dayjs from 'dayjs/esm';

import { ICompany, NewCompany } from './company.model';

export const sampleWithRequiredData: ICompany = {
  id: 6800,
  name: 'regarder crac',
  taxId: 'ding exclure',
  tenantSchema: 'ensuite subsister',
  active: false,
  createdAt: dayjs('2026-03-31T07:26'),
};

export const sampleWithPartialData: ICompany = {
  id: 7041,
  name: 'pourvu que',
  tradeName: 'a demeurer ha',
  taxId: 'pourvu que ouin doré',
  address: 'consoler',
  postalCode: 'magnifique',
  email: 'Bouchard88@gmail.com',
  logoUrl: 'solitaire',
  tenantSchema: 'neutre',
  active: false,
  createdAt: dayjs('2026-03-31T13:57'),
};

export const sampleWithFullData: ICompany = {
  id: 14111,
  name: 'brusque',
  tradeName: 'à cause de',
  taxId: 'parce que commis dur',
  cnssId: 'pourvu que délégatio',
  address: 'à moins de',
  city: 'Angers',
  postalCode: 'rédaction ',
  phone: '+33 111670191',
  email: 'Philomene77@hotmail.fr',
  logoUrl: 'là au point que hors de',
  tenantSchema: 'complètement',
  active: true,
  trialEnd: dayjs('2026-03-30'),
  createdAt: dayjs('2026-03-31T07:19'),
};

export const sampleWithNewData: NewCompany = {
  name: "à l'entour de exploser",
  taxId: 'de manière à tic-tac',
  tenantSchema: 'pff',
  active: true,
  createdAt: dayjs('2026-03-31T13:08'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
