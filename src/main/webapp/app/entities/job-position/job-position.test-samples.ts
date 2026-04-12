import { IJobPosition, NewJobPosition } from './job-position.model';

export const sampleWithRequiredData: IJobPosition = {
  id: 18816,
  code: 'après que jusqu’à ce',
  title: 'avant que placide',
  active: false,
};

export const sampleWithPartialData: IJobPosition = {
  id: 6576,
  code: 'population du Québec',
  title: 'athlète',
  maxSalary: 22556.4,
  active: true,
};

export const sampleWithFullData: IJobPosition = {
  id: 29035,
  code: 'puisque en guise de ',
  title: 'initier après-demain',
  description: 'vis-à-vie de blablabla areu areu',
  minSalary: 3671.53,
  maxSalary: 12405.34,
  active: false,
};

export const sampleWithNewData: NewJobPosition = {
  code: 'à même',
  title: 'cuicui',
  active: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
