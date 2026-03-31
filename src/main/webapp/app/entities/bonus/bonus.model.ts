import { IEmployee } from 'app/entities/employee/employee.model';
import { IPaySlip } from 'app/entities/pay-slip/pay-slip.model';
import { BonusType } from 'app/entities/enumerations/bonus-type.model';

export interface IBonus {
  id: number;
  bonusType?: keyof typeof BonusType | null;
  label?: string | null;
  amount?: number | null;
  taxable?: boolean | null;
  month?: number | null;
  year?: number | null;
  notes?: string | null;
  employee?: Pick<IEmployee, 'id'> | null;
  paySlip?: Pick<IPaySlip, 'id'> | null;
}

export type NewBonus = Omit<IBonus, 'id'> & { id: null };
