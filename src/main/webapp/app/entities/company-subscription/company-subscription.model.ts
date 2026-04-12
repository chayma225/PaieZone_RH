import dayjs from 'dayjs/esm';

import { CompanySubscriptionStatus } from 'app/entities/enumerations/company-subscription-status.model';
import { PlanType } from 'app/entities/enumerations/plan-type.model';

export interface ICompanySubscription {
  id: number;
  plan?: keyof typeof PlanType | null;
  status?: keyof typeof CompanySubscriptionStatus | null;
  maxEmployees?: number | null;
  priceHT?: number | null;
  billingDay?: number | null;
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  renewalDate?: dayjs.Dayjs | null;
  notes?: string | null;
}

export type NewCompanySubscription = Omit<ICompanySubscription, 'id'> & { id: null };
