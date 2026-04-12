import dayjs from 'dayjs/esm';

import { ICompany, NewCompany } from './company.model';

export const sampleWithRequiredData: ICompany = {
  id: 6800,
  name: 'regarder crac',
  taxId: 'ding exclure',
  tenantSchema: 'ensuite subsister',
  active: false,
  createdAt: dayjs('2026-04-08T07:46'),
};

export const sampleWithPartialData: ICompany = {
  id: 7041,
  name: 'pourvu que',
  tradeName: 'a demeurer ha',
  taxId: 'pourvu que ouin doré',
  address: 'consoler',
  postalCode: 'magnifique',
  email: 'Audrey.Morin@gmail.com',
  logoUrl: 'tellement souple si',
  tenantSchema: 'absolument',
  active: false,
  createdAt: dayjs('2026-04-08T00:12'),
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
  email: 'Apollinaire_Vidal@yahoo.fr',
  logoUrl: 'alors que',
  tenantSchema: 'user',
  active: true,
  trialEnd: dayjs('2026-04-08'),
  createdAt: dayjs('2026-04-08T15:32'),
};

export const sampleWithNewData: NewCompany = {
  name: "à l'entour de exploser",
  taxId: 'de manière à tic-tac',
  tenantSchema: 'pff',
  active: true,
  createdAt: dayjs('2026-04-08T13:27'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
