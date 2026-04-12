import { RubriqueType } from 'app/entities/enumerations/rubrique-type.model';
import { IPaySlip } from 'app/entities/pay-slip/pay-slip.model';
import { IRubrique } from 'app/entities/rubrique/rubrique.model';

export interface IPaySlipLine {
  id: number;
  sortOrder?: number | null;
  rubriqueCode?: string | null;
  rubriqueLabel?: string | null;
  rubriqueType?: keyof typeof RubriqueType | null;
  base?: number | null;
  rate?: number | null;
  amount?: number | null;
  taxable?: boolean | null;
  paySlip?: Pick<IPaySlip, 'id'> | null;
  rubrique?: Pick<IRubrique, 'id'> | null;
}

export type NewPaySlipLine = Omit<IPaySlipLine, 'id'> & { id: null };
