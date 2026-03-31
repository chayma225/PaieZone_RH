import { ICompany } from 'app/entities/company/company.model';
import { IEmployee } from 'app/entities/employee/employee.model';

export interface IDepartment {
  id: number;
  code?: string | null;
  name?: string | null;
  description?: string | null;
  active?: boolean | null;
  company?: Pick<ICompany, 'id'> | null;
  manager?: Pick<IEmployee, 'id'> | null;
}

export type NewDepartment = Omit<IDepartment, 'id'> & { id: null };
