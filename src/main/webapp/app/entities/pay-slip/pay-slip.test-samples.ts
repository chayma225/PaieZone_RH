import dayjs from 'dayjs/esm';

import { IPaySlip, NewPaySlip } from './pay-slip.model';

export const sampleWithRequiredData: IPaySlip = {
  id: 15559,
  month: 8,
  year: 56,
  baseSalary: 15168.4,
  totalGains: 29785.04,
  totalDeductions: 22547.63,
  grossSalary: 27532.31,
  cnssSalaryAmount: 9087.35,
  taxableIncome: 15902.99,
  irppAmount: 6725.68,
  netSalary: 15814.93,
  employerCnss: 1956.46,
  totalEmployerCost: 2854.57,
  status: 'DRAFT',
};

export const sampleWithPartialData: IPaySlip = {
  id: 20086,
  month: 10,
  year: 22033,
  baseSalary: 24228.32,
  totalGains: 3325.67,
  totalDeductions: 3898.37,
  grossSalary: 26202.8,
  cnssSalaryAmount: 22348.01,
  taxableIncome: 9052.65,
  irppAmount: 24833.9,
  netSalary: 13754.18,
  employerCnss: 9123.49,
  employerCavis: 30942.93,
  totalEmployerCost: 2867.15,
  workedDays: 11913,
  paidLeaveDays: 26756,
  status: 'VALIDATED',
  sentToEmployeeAt: dayjs('2026-03-31T17:53'),
  bankTransferRef: 'bien que communauté étudiante administration',
};

export const sampleWithFullData: IPaySlip = {
  id: 14661,
  month: 6,
  year: 20199,
  baseSalary: 12731.43,
  totalGains: 26333.38,
  totalDeductions: 17845.47,
  grossSalary: 17797.47,
  cnssSalaryAmount: 10057.22,
  cavisAmount: 18677.4,
  taxableIncome: 27707.16,
  irppAmount: 30536.01,
  netSalary: 12224.06,
  employerCnss: 4921.68,
  employerCavis: 25683.31,
  totalEmployerCost: 2467.61,
  workedDays: 28976,
  paidLeaveDays: 24985,
  unpaidDays: 2595,
  overtimeHours: 6604.08,
  status: 'EXPORTED',
  pdfUrl: 'tsoin-tsoin',
  generatedAt: dayjs('2026-03-31T12:03'),
  sentToEmployeeAt: dayjs('2026-03-31T12:45'),
  bankTransferRef: 'embrasser psitt',
};

export const sampleWithNewData: NewPaySlip = {
  month: 6,
  year: 31350,
  baseSalary: 20055.24,
  totalGains: 13885.37,
  totalDeductions: 12950.35,
  grossSalary: 29801.77,
  cnssSalaryAmount: 22715.64,
  taxableIncome: 5493.75,
  irppAmount: 19962.36,
  netSalary: 8797.03,
  employerCnss: 2897.55,
  totalEmployerCost: 10931.32,
  status: 'LOCKED',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
