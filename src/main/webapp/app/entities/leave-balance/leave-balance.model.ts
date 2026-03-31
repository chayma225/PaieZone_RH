import dayjs from 'dayjs/esm';
import { IEmployee } from 'app/entities/employee/employee.model';
import { ILeaveType } from 'app/entities/leave-type/leave-type.model';

export interface ILeaveBalance {
  id: number;
  year?: number | null;
  entitled?: number | null;
  taken?: number | null;
  pending?: number | null;
  carryOver?: number | null;
  remaining?: number | null;
  lastUpdatedAt?: dayjs.Dayjs | null;
  employee?: Pick<IEmployee, 'id'> | null;
  leaveType?: Pick<ILeaveType, 'id'> | null;
}

export type NewLeaveBalance = Omit<ILeaveBalance, 'id'> & { id: null };
