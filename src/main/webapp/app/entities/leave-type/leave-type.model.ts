import { ICompany } from 'app/entities/company/company.model';
import { LeaveTypeName } from 'app/entities/enumerations/leave-type-name.model';

export interface ILeaveType {
  id: number;
  name?: keyof typeof LeaveTypeName | null;
  label?: string | null;
  maxDaysPerYear?: number | null;
  carryOverDays?: number | null;
  paid?: boolean | null;
  requiresMedical?: boolean | null;
  active?: boolean | null;
  company?: Pick<ICompany, 'id'> | null;
}

export type NewLeaveType = Omit<ILeaveType, 'id'> & { id: null };
