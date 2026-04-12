import dayjs from 'dayjs/esm';

import { ICompany } from 'app/entities/company/company.model';
import { PayrollStatus } from 'app/entities/enumerations/payroll-status.model';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';

export interface IPayrollPeriod {
  id: number;
  month?: number | null;
  year?: number | null;
  status?: keyof typeof PayrollStatus | null;
  calculatedAt?: dayjs.Dayjs | null;
  validatedAt?: dayjs.Dayjs | null;
  lockedAt?: dayjs.Dayjs | null;
  notes?: string | null;
  company?: Pick<ICompany, 'id'> | null;
  createdBy?: Pick<IUserProfile, 'id'> | null;
}

export type NewPayrollPeriod = Omit<IPayrollPeriod, 'id'> & { id: null };
