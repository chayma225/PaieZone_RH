import { ICompany } from 'app/entities/company/company.model';
import { RubriqueBase } from 'app/entities/enumerations/rubrique-base.model';
import { RubriqueType } from 'app/entities/enumerations/rubrique-type.model';

export interface IRubrique {
  id: number;
  code?: string | null;
  label?: string | null;
  labelAr?: string | null;
  rubriqueType?: keyof typeof RubriqueType | null;
  base?: keyof typeof RubriqueBase | null;
  rate?: number | null;
  fixedAmount?: number | null;
  formula?: string | null;
  taxable?: boolean | null;
  cnssSalary?: boolean | null;
  cnssEmployer?: boolean | null;
  sortOrder?: number | null;
  active?: boolean | null;
  company?: Pick<ICompany, 'id'> | null;
}

export type NewRubrique = Omit<IRubrique, 'id'> & { id: null };
