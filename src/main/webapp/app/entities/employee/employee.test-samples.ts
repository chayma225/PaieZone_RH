import dayjs from 'dayjs/esm';

import { IEmployee, NewEmployee } from './employee.model';

export const sampleWithRequiredData: IEmployee = {
  id: 8899,
  matricule: 'antique garantir',
  firstName: 'Jean',
  lastName: 'Riviere',
  birthDate: dayjs('2026-04-08'),
  gender: 'FEMALE',
  maritalStatus: 'MARRIED',
  numberOfChildren: 5,
  chefDeFamille: true,
  nationalId: 'différencier',
  category: 'MANAGER',
  hireDate: dayjs('2026-04-08'),
  active: true,
  createdAt: dayjs('2026-04-08T11:09'),
};

export const sampleWithPartialData: IEmployee = {
  id: 16817,
  matricule: 'insuffisamment',
  firstName: 'Émeric',
  lastName: 'Fournier',
  firstNameAr: 'au-dessus calme',
  lastNameAr: 'avant de',
  birthDate: dayjs('2026-04-08'),
  birthPlace: 'adepte en guise de',
  gender: 'FEMALE',
  maritalStatus: 'WIDOWED',
  numberOfChildren: 9,
  chefDeFamille: false,
  nationalId: 'coudre hôte secours',
  passportNumber: 'au moyen de au cas o',
  address: 'pauvre un peu',
  professionalEmail: 'présidence ah aussitôt que',
  category: 'EXECUTIVE',
  photoUrl: 'joliment',
  hireDate: dayjs('2026-04-08'),
  trialEndDate: dayjs('2026-04-07'),
  active: true,
  createdAt: dayjs('2026-04-08T11:32'),
};

export const sampleWithFullData: IEmployee = {
  id: 19019,
  matricule: 'alentour lors au-des',
  firstName: 'Ambroise',
  lastName: 'Olivier',
  firstNameAr: "timide à l'entour de blablabla",
  lastNameAr: 'habile',
  birthDate: dayjs('2026-04-08'),
  birthPlace: 'de sorte que charitable géométrique',
  gender: 'MALE',
  maritalStatus: 'SINGLE',
  numberOfChildren: 8,
  chefDeFamille: false,
  nationalId: 'ha ha de crainte que',
  passportNumber: 'actionnaire de façon',
  nationality: 'assurément',
  address: 'bzzz propre smack',
  city: 'Colombes',
  personalEmail: 'ronron',
  professionalEmail: 'calme',
  phoneNumber: 'partenaire',
  cnssNumber: 'groin groin coac coa',
  category: 'TECHNICIAN',
  photoUrl: 'réduire gestionnaire',
  hireDate: dayjs('2026-04-07'),
  trialEndDate: dayjs('2026-04-08'),
  active: false,
  notes: '../fake-data/blob/hipster.txt',
  createdAt: dayjs('2026-04-07T21:31'),
  updatedAt: dayjs('2026-04-08T16:08'),
};

export const sampleWithNewData: NewEmployee = {
  matricule: 'trop',
  firstName: 'Tristan',
  lastName: 'Royer',
  birthDate: dayjs('2026-04-07'),
  gender: 'MALE',
  maritalStatus: 'MARRIED',
  numberOfChildren: 9,
  chefDeFamille: false,
  nationalId: "à l'égard de",
  category: 'WORKER',
  hireDate: dayjs('2026-04-07'),
  active: true,
  createdAt: dayjs('2026-04-08T03:06'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
