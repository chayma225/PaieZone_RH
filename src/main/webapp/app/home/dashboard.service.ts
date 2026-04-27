import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IDashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  departments: number;
  positions: number;
  pendingLeaves: number;
  approvedLeaves: number;
  payrollDrafts: number;
  payrollValidated: number;
  activeContracts: number;
  expiringContracts: number;
  totalCompanies?: number; // SUPER_ADMIN seulement
  activeSubscriptions?: number; // SUPER_ADMIN seulement
  auditLogsToday?: number; // ADMIN/SUPER_ADMIN seulement
  chatSessions?: number; // tous
  pendingAdvances?: number; // RH_COMPTABLE
  bonusThisMonth?: number; // RH_COMPTABLE
}

export interface IRecentActivity {
  type: string; // 'LEAVE' | 'PAYSLIP' | 'CONTRACT' | 'AUDIT'
  message: string;
  timestamp: string;
  severity: string; // 'info' | 'success' | 'warning' | 'danger'
}

export interface IPayrollSummary {
  month: number;
  year: number;
  totalNet: number;
  totalGross: number;
  totalEmployerCost: number;
  employeeCount: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = 'api/dashboard';

  constructor(private http: HttpClient) {}

  getStats(): Observable<IDashboardStats> {
    return this.http.get<IDashboardStats>(`${this.apiUrl}/stats`);
  }

  getRecentActivity(): Observable<IRecentActivity[]> {
    return this.http.get<IRecentActivity[]>(`${this.apiUrl}/activity`);
  }

  getPayrollSummary(): Observable<IPayrollSummary[]> {
    return this.http.get<IPayrollSummary[]>(`${this.apiUrl}/payroll-summary`);
  }
}
