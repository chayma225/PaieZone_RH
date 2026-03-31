import dayjs from 'dayjs/esm';

import { IEmployee, NewEmployee } from './employee.model';

export const sampleWithRequiredData: IEmployee = {
  id: 8899,
  matricule: 'antique garantir',
  firstName: 'Émérencie',
  lastName: 'Lopez',
  birthDate: dayjs('2026-03-31'),
  gender: 'FEMALE',
  maritalStatus: 'WIDOWED',
  numberOfChildren: 3,
  chefDeFamille: false,
  nationalId: "heurter d'avec",
  category: 'DIRECTOR',
  hireDate: dayjs('2026-03-31'),
  active: true,
  createdAt: dayjs('2026-03-30T20:29'),
};

export const sampleWithPartialData: IEmployee = {
  id: 16817,
  matricule: 'insuffisamment',
  firstName: 'Olivier',
  lastName: 'Vasseur',
  firstNameAr: 'altruiste en face de joliment',
  lastNameAr: 'chef de cuisine',
  birthDate: dayjs('2026-03-30'),
  birthPlace: 'autrefois rose d’autant que',
  gender: 'MALE',
  maritalStatus: 'WIDOWED',
  numberOfChildren: 2,
  chefDeFamille: true,
  nationalId: 'cocorico lorsque',
  passportNumber: 'quoique ouille',
  address: 'insolite personnel professionnel manger',
  professionalEmail: 'au prix de en dedans de',
  category: 'SUPERVISOR',
  photoUrl: 'adorable',
  hireDate: dayjs('2026-03-31'),
  trialEndDate: dayjs('2026-03-31'),
  active: true,
  createdAt: dayjs('2026-03-31T14:35'),
};

export const sampleWithFullData: IEmployee = {
  id: 19019,
  matricule: 'alentour lors au-des',
  firstName: 'Fantin',
  lastName: 'Brunet',
  firstNameAr: 'sage clac',
  lastNameAr: 'conseil municipal cuicui fidèle',
  birthDate: dayjs('2026-03-30'),
  birthPlace: "à l'instar de bientôt quand",
  gender: 'MALE',
  maritalStatus: 'WIDOWED',
  numberOfChildren: 8,
  chefDeFamille: false,
  nationalId: 'davantage oups',
  passportNumber: 'déborder tchou tchou',
  nationality: 'parler',
  address: 'touriste',
  city: 'Nancy',
  personalEmail: 'au-dessus de disputer énergique',
  professionalEmail: 'atchoum aboutir coin-coin',
  phoneNumber: 'affirmer désagréable',
  cnssNumber: 'hésiter',
  category: 'DIRECTOR',
  photoUrl: 'dessus',
  hireDate: dayjs('2026-03-31'),
  trialEndDate: dayjs('2026-03-31'),
  active: false,
  notes: '../fake-data/blob/hipster.txt',
  createdAt: dayjs('2026-03-31T07:31'),
  updatedAt: dayjs('2026-03-31T15:50'),
};

export const sampleWithNewData: NewEmployee = {
  matricule: 'trop',
  firstName: 'Mérovée',
  lastName: 'Roussel',
  birthDate: dayjs('2026-03-30'),
  gender: 'MALE',
  maritalStatus: 'WIDOWED',
  numberOfChildren: 2,
  chefDeFamille: true,
  nationalId: 'ouch',
  category: 'SUPERVISOR',
  hireDate: dayjs('2026-03-30'),
  active: true,
  createdAt: dayjs('2026-03-30T20:42'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
