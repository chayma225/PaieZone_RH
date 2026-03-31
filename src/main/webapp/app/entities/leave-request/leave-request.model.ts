import dayjs from 'dayjs/esm';
import { IEmployee } from 'app/entities/employee/employee.model';
import { ILeaveType } from 'app/entities/leave-type/leave-type.model';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { LeaveStatus } from 'app/entities/enumerations/leave-status.model';

export interface ILeaveRequest {
  id: number;
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  numberOfDays?: number | null;
  status?: keyof typeof LeaveStatus | null;
  requestedAt?: dayjs.Dayjs | null;
  processedAt?: dayjs.Dayjs | null;
  managerComment?: string | null;
  employeeComment?: string | null;
  documentUrl?: string | null;
  employee?: Pick<IEmployee, 'id'> | null;
  leaveType?: Pick<ILeaveType, 'id'> | null;
  approvedBy?: Pick<IUserProfile, 'id'> | null;
}

export type NewLeaveRequest = Omit<ILeaveRequest, 'id'> & { id: null };
