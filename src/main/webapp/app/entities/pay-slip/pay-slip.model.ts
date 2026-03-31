import dayjs from 'dayjs/esm';
import { IEmployee } from 'app/entities/employee/employee.model';
import { IPayrollPeriod } from 'app/entities/payroll-period/payroll-period.model';
import { IContract } from 'app/entities/contract/contract.model';
import { PayrollStatus } from 'app/entities/enumerations/payroll-status.model';

export interface IPaySlip {
  id: number;
  month?: number | null;
  year?: number | null;
  baseSalary?: number | null;
  totalGains?: number | null;
  totalDeductions?: number | null;
  grossSalary?: number | null;
  cnssSalaryAmount?: number | null;
  cavisAmount?: number | null;
  taxableIncome?: number | null;
  irppAmount?: number | null;
  netSalary?: number | null;
  employerCnss?: number | null;
  employerCavis?: number | null;
  totalEmployerCost?: number | null;
  workedDays?: number | null;
  paidLeaveDays?: number | null;
  unpaidDays?: number | null;
  overtimeHours?: number | null;
  status?: keyof typeof PayrollStatus | null;
  pdfUrl?: string | null;
  generatedAt?: dayjs.Dayjs | null;
  sentToEmployeeAt?: dayjs.Dayjs | null;
  bankTransferRef?: string | null;
  employee?: Pick<IEmployee, 'id'> | null;
  payrollPeriod?: Pick<IPayrollPeriod, 'id'> | null;
  contract?: Pick<IContract, 'id'> | null;
}

export type NewPaySlip = Omit<IPaySlip, 'id'> & { id: null };
