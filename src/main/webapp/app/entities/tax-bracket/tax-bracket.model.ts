import { ICompany } from 'app/entities/company/company.model';

export interface ITaxBracket {
  id: number;
  year?: number | null;
  minIncome?: number | null;
  maxIncome?: number | null;
  rate?: number | null;
  fixedDeduction?: number | null;
  sortOrder?: number | null;
  company?: Pick<ICompany, 'id'> | null;
}

export type NewTaxBracket = Omit<ITaxBracket, 'id'> & { id: null };
