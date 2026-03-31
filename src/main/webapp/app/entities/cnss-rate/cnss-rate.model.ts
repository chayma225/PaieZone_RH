import dayjs from 'dayjs/esm';
import { ICompany } from 'app/entities/company/company.model';

export interface ICnssRate {
  id: number;
  year?: number | null;
  salaryCeiling?: number | null;
  employeeRate?: number | null;
  employerRate?: number | null;
  cavisEmployee?: number | null;
  cavisEmployer?: number | null;
  smig?: number | null;
  effectiveFrom?: dayjs.Dayjs | null;
  company?: Pick<ICompany, 'id'> | null;
}

export type NewCnssRate = Omit<ICnssRate, 'id'> & { id: null };
