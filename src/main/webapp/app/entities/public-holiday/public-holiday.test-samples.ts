import dayjs from 'dayjs/esm';

import { IPublicHoliday, NewPublicHoliday } from './public-holiday.model';

export const sampleWithRequiredData: IPublicHoliday = {
  id: 24223,
  name: 'reposer considérable',
  holidayDate: dayjs('2026-04-08'),
  year: 31375,
  isRecurring: false,
  active: false,
};

export const sampleWithPartialData: IPublicHoliday = {
  id: 3464,
  name: 'ferme',
  holidayDate: dayjs('2026-04-08'),
  year: 21256,
  isRecurring: false,
  active: false,
};

export const sampleWithFullData: IPublicHoliday = {
  id: 15046,
  name: 'population du Québec',
  nameAr: 'sincère triathlète',
  holidayDate: dayjs('2026-04-08'),
  year: 3755,
  isRecurring: false,
  active: true,
};

export const sampleWithNewData: NewPublicHoliday = {
  name: 'atchoum boum',
  holidayDate: dayjs('2026-04-08'),
  year: 2842,
  isRecurring: false,
  active: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
