import dayjs from 'dayjs/esm';
import { PlanType } from 'app/entities/enumerations/plan-type.model';
import { SubscriptionStatus } from 'app/entities/enumerations/subscription-status.model';

export interface ICompanySubscription {
  id: number;
  plan?: keyof typeof PlanType | null;
  status?: keyof typeof SubscriptionStatus | null;
  maxEmployees?: number | null;
  priceHT?: number | null;
  billingDay?: number | null;
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  renewalDate?: dayjs.Dayjs | null;
  notes?: string | null;
}

export type NewCompanySubscription = Omit<ICompanySubscription, 'id'> & { id: null };
