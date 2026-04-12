import { IDepartment, NewDepartment } from './department.model';

export const sampleWithRequiredData: IDepartment = {
  id: 32001,
  code: 'pschitt',
  name: 'gigantesque membre du personnel diplomate',
  active: false,
};

export const sampleWithPartialData: IDepartment = {
  id: 26867,
  code: 'cocorico',
  name: 'devant jusqu’à ce que membre de l’équipe',
  active: true,
};

export const sampleWithFullData: IDepartment = {
  id: 13276,
  code: 'déboucher',
  name: 'exposer du côté de',
  description: 'avant que',
  active: true,
};

export const sampleWithNewData: NewDepartment = {
  code: 'minuscule du fait qu',
  name: 'police conseil municipal',
  active: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
