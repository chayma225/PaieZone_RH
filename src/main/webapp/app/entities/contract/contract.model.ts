import dayjs from 'dayjs/esm';
import { IEmployee } from 'app/entities/employee/employee.model';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { ContractType } from 'app/entities/enumerations/contract-type.model';
import { ContractStatus } from 'app/entities/enumerations/contract-status.model';

export interface IContract {
  id: number;
  reference?: string | null;
  contractType?: keyof typeof ContractType | null;
  status?: keyof typeof ContractStatus | null;
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  signedDate?: dayjs.Dayjs | null;
  baseSalary?: number | null;
  workingHoursWeek?: number | null;
  workingDaysWeek?: number | null;
  conventionCollective?: string | null;
  trialPeriodMonths?: number | null;
  renewalCount?: number | null;
  documentUrl?: string | null;
  notes?: string | null;
  createdAt?: dayjs.Dayjs | null;
  employee?: Pick<IEmployee, 'id'> | null;
  createdBy?: Pick<IUserProfile, 'id'> | null;
}

export type NewContract = Omit<IContract, 'id'> & { id: null };
