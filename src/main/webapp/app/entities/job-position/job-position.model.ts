import { ICompany } from 'app/entities/company/company.model';
import { IDepartment } from 'app/entities/department/department.model';

export interface IJobPosition {
  id: number;
  code?: string | null;
  title?: string | null;
  description?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  active?: boolean | null;
  company?: Pick<ICompany, 'id'> | null;
  department?: Pick<IDepartment, 'id'> | null;
}

export type NewJobPosition = Omit<IJobPosition, 'id'> & { id: null };
