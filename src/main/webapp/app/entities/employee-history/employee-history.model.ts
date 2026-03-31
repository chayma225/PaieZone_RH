import dayjs from 'dayjs/esm';
import { IEmployee } from 'app/entities/employee/employee.model';

export interface IEmployeeHistory {
  id: number;
  fieldName?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  changedAt?: dayjs.Dayjs | null;
  changedBy?: string | null;
  reason?: string | null;
  employee?: Pick<IEmployee, 'id'> | null;
}

export type NewEmployeeHistory = Omit<IEmployeeHistory, 'id'> & { id: null };
