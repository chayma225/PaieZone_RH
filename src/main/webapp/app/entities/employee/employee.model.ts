import dayjs from 'dayjs/esm';

import { ICompany } from 'app/entities/company/company.model';
import { IDepartment } from 'app/entities/department/department.model';
import { EmployeeCategory } from 'app/entities/enumerations/employee-category.model';
import { Gender } from 'app/entities/enumerations/gender.model';
import { MaritalStatus } from 'app/entities/enumerations/marital-status.model';
import { IJobPosition } from 'app/entities/job-position/job-position.model';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';

export interface IEmployee {
  id: number;
  matricule?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  firstNameAr?: string | null;
  lastNameAr?: string | null;
  birthDate?: dayjs.Dayjs | null;
  birthPlace?: string | null;
  gender?: keyof typeof Gender | null;
  maritalStatus?: keyof typeof MaritalStatus | null;
  numberOfChildren?: number | null;
  chefDeFamille?: boolean | null;
  nationalId?: string | null;
  passportNumber?: string | null;
  nationality?: string | null;
  address?: string | null;
  city?: string | null;
  personalEmail?: string | null;
  professionalEmail?: string | null;
  phoneNumber?: string | null;
  cnssNumber?: string | null;
  category?: keyof typeof EmployeeCategory | null;
  photoUrl?: string | null;
  hireDate?: dayjs.Dayjs | null;
  trialEndDate?: dayjs.Dayjs | null;
  active?: boolean | null;
  notes?: string | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  company?: Pick<ICompany, 'id'> | null;
  department?: Pick<IDepartment, 'id'> | null;
  position?: Pick<IJobPosition, 'id'> | null;
  manager?: Pick<IEmployee, 'id'> | null;
  userProfile?: Pick<IUserProfile, 'id'> | null;
}

export type NewEmployee = Omit<IEmployee, 'id'> & { id: null };
