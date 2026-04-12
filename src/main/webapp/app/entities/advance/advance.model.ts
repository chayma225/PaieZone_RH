import dayjs from 'dayjs/esm';

import { IEmployee } from 'app/entities/employee/employee.model';
import { AdvanceStatus } from 'app/entities/enumerations/advance-status.model';
import { IPaySlip } from 'app/entities/pay-slip/pay-slip.model';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';

export interface IAdvance {
  id: number;
  requestDate?: dayjs.Dayjs | null;
  amount?: number | null;
  deductionMonth?: number | null;
  deductionYear?: number | null;
  status?: keyof typeof AdvanceStatus | null;
  approvedBy?: string | null;
  notes?: string | null;
  employee?: Pick<IEmployee, 'id'> | null;
  paySlip?: Pick<IPaySlip, 'id'> | null;
  approvedByUser?: Pick<IUserProfile, 'id'> | null;
}

export type NewAdvance = Omit<IAdvance, 'id'> & { id: null };
