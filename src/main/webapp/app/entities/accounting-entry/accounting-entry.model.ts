import dayjs from 'dayjs/esm';

import { ICompany } from 'app/entities/company/company.model';
import { AccountingEntryType } from 'app/entities/enumerations/accounting-entry-type.model';
import { IPayrollPeriod } from 'app/entities/payroll-period/payroll-period.model';

export interface IAccountingEntry {
  id: number;
  entryDate?: dayjs.Dayjs | null;
  journalRef?: string | null;
  entryType?: keyof typeof AccountingEntryType | null;
  description?: string | null;
  debitAccount?: string | null;
  creditAccount?: string | null;
  amount?: number | null;
  exportedAt?: dayjs.Dayjs | null;
  exportFormat?: string | null;
  exportRef?: string | null;
  company?: Pick<ICompany, 'id'> | null;
  payrollPeriod?: Pick<IPayrollPeriod, 'id'> | null;
}

export type NewAccountingEntry = Omit<IAccountingEntry, 'id'> & { id: null };
