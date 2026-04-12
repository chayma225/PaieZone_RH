import dayjs from 'dayjs/esm';

import { ICompanySubscription, NewCompanySubscription } from './company-subscription.model';

export const sampleWithRequiredData: ICompanySubscription = {
  id: 10529,
  plan: 'ENTERPRISE',
  status: 'SUSPENDED',
  maxEmployees: 19716,
  priceHT: 15517.12,
  billingDay: 15027,
  startDate: dayjs('2026-04-08'),
};

export const sampleWithPartialData: ICompanySubscription = {
  id: 775,
  plan: 'STARTER',
  status: 'SUSPENDED',
  maxEmployees: 23752,
  priceHT: 15437.17,
  billingDay: 16612,
  startDate: dayjs('2026-04-07'),
  endDate: dayjs('2026-04-07'),
  notes: 'balayer revivre secours',
};

export const sampleWithFullData: ICompanySubscription = {
  id: 20120,
  plan: 'BUSINESS',
  status: 'CANCELLED',
  maxEmployees: 27188,
  priceHT: 28628.52,
  billingDay: 12018,
  startDate: dayjs('2026-04-08'),
  endDate: dayjs('2026-04-08'),
  renewalDate: dayjs('2026-04-08'),
  notes: 'selon',
};

export const sampleWithNewData: NewCompanySubscription = {
  plan: 'PME',
  status: 'ACTIVE',
  maxEmployees: 26740,
  priceHT: 11690.6,
  billingDay: 17233,
  startDate: dayjs('2026-04-08'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
