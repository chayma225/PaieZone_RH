import {IEmployee} from "../employee/employee.model";
import {PayrollStatus} from "../enumerations/payroll-status.model";
import {IPayrollPeriod} from "../payroll-period/payroll-period.model";
import {IContract} from "../contract/contract.model";

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
  cssAmount?: number | null;
  taxableIncome?: number | null;
  irppAmount?: number | null;
  netSalary?: number | null;
  employerCnss?: number | null;
  employerCavis?: number | null;
  tfpAmount?: number | null;
  totalEmployerCost?: number | null;
  bonusTotal?: number | null;
  advanceDeduction?: number | null;
  unpaidLeaveDeduction?: number | null;
  overtimeAmount?: number | null;
  workedDays?: number | null;
  paidLeaveDays?: number | null;
  unpaidDays?: number | null;
  overtimeHours?: number | null;
  status?: keyof typeof PayrollStatus | null;
  pdfUrl?: string | null;
  generatedAt?: string | null;
  sentToEmployeeAt?: string | null;
  bankTransferRef?: string | null;
  employeeId?: number | null;
  payrollPeriodId?: number | null;
  contractId?: number | null;
  employee?: Pick<IEmployee, 'id'> | null;
  payrollPeriod?: Pick<IPayrollPeriod, 'id'> | null;
  contract?: Pick<IContract, 'id'> | null;
}

export type NewPaySlip = Omit<IPaySlip, 'id'> & { id: null };
