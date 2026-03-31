import dayjs from 'dayjs/esm';
import { ICompanySubscription } from 'app/entities/company-subscription/company-subscription.model';

export interface ICompany {
  id: number;
  name?: string | null;
  tradeName?: string | null;
  taxId?: string | null;
  cnssId?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  tenantSchema?: string | null;
  active?: boolean | null;
  trialEnd?: dayjs.Dayjs | null;
  createdAt?: dayjs.Dayjs | null;
  subscription?: Pick<ICompanySubscription, 'id'> | null;
}

export type NewCompany = Omit<ICompany, 'id'> & { id: null };
