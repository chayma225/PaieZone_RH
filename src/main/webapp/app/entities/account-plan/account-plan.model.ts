import { ICompany } from 'app/entities/company/company.model';

export interface IAccountPlan {
  id: number;
  accountCode?: string | null;
  accountLabel?: string | null;
  accountLabelAr?: string | null;
  accountType?: string | null;
  active?: boolean | null;
  company?: Pick<ICompany, 'id'> | null;
}

export type NewAccountPlan = Omit<IAccountPlan, 'id'> & { id: null };
