import dayjs from 'dayjs/esm';
import { IDepartment } from 'app/entities/department/department.model';
import { IJobPosition } from 'app/entities/job-position/job-position.model';

// ← Fix : Étendre le Pick pour inclure les champs nécessaires
export interface IEmployeeHistory {
  id: number;
  fieldName?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  changedAt?: dayjs.Dayjs | null;
  changedBy?: string | null;
  reason?: string | null;
  employee?: {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    matricule?: string | null;
    department?: Pick<IDepartment, 'id' | 'name'> | null;
    position?: Pick<IJobPosition, 'id' | 'title'> | null;
  } | null;
}

export type NewEmployeeHistory = Omit<IEmployeeHistory, 'id'> & { id: null };
