import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import type { Employee, Company, Department, PayrollPeriod, LeaveRequest, Advance } from './types';

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  dashboardStats(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>('/api/dashboard/stats');
  }

  employees(size = 200): Observable<Employee[]> {
    const params = new HttpParams().set('page', 0).set('size', size).set('sort', 'id,asc');
    return this.http.get<any[]>('/api/employees', { params }).pipe(map(list => list.map(d => this.mapEmployee(d))));
  }

  companies(size = 100): Observable<Company[]> {
    const params = new HttpParams().set('page', 0).set('size', size);
    return this.http.get<any[]>('/api/companies', { params }).pipe(map(list => list.map(d => this.mapCompany(d))));
  }

  departments(size = 50): Observable<Department[]> {
    const params = new HttpParams().set('page', 0).set('size', size);
    return this.http.get<any[]>('/api/departments', { params }).pipe(
      map(list =>
        list.map(
          d =>
            ({
              id: d.id,
              code: d.code ?? '',
              name: d.name ?? '',
              head: d.manager ? `${d.manager.firstName ?? ''} ${d.manager.lastName ?? ''}`.trim() : '',
              count: 0,
            }) as Department,
        ),
      ),
    );
  }

  leaveRequests(statusFilter?: string): Observable<LeaveRequest[]> {
    let params = new HttpParams().set('page', 0).set('size', 100);
    if (statusFilter) params = params.set('status.equals', statusFilter);
    return this.http.get<any[]>('/api/leave-requests', { params }).pipe(map(list => list.map(d => this.mapLeave(d))));
  }

  advances(statusFilter?: string): Observable<Advance[]> {
    let params = new HttpParams().set('page', 0).set('size', 100);
    if (statusFilter) params = params.set('status.equals', statusFilter);
    return this.http.get<any[]>('/api/advances', { params }).pipe(map(list => list.map(d => this.mapAdvance(d))));
  }

  payrollPeriods(): Observable<PayrollPeriod[]> {
    const params = new HttpParams().set('page', 0).set('size', 24);
    return this.http.get<any[]>('/api/payroll-periods', { params }).pipe(map(list => list.map(d => this.mapPeriod(d))));
  }

  createChatSession(): Observable<{ id: number }> {
    return this.http.post<{ id: number }>('/api/chatbot/sessions', {});
  }

  sendChatMessage(sessionId: number, message: string): Observable<{ content: string }> {
    return this.http.post<{ content: string }>(`/api/chatbot/sessions/${sessionId}/messages`, { message });
  }

  private mapEmployee(d: any): Employee {
    return {
      id: d.id,
      matricule: d.matricule ?? '',
      first: d.firstName ?? '',
      last: d.lastName ?? '',
      ar: [d.firstNameAr, d.lastNameAr].filter(Boolean).join(' '),
      role: d.position?.title ?? '',
      dept: d.department?.name ?? '',
      salary: 0,
      contract: 'CDI',
      hireDate: d.hireDate ?? '',
      city: d.city ?? '',
      cnss: d.cnssNumber ?? '',
      email: d.professionalEmail ?? d.personalEmail ?? '',
      phone: d.phoneNumber ?? '',
      cat: d.category ?? '',
      gender: d.gender === 'FEMALE' ? 'F' : 'M',
      children: d.numberOfChildren ?? 0,
    };
  }

  private mapCompany(d: any): Company {
    const sub = d.companySubscription;
    const subStatus: string = sub?.status ?? '';
    const status: Company['status'] = !d.active
      ? 'SUSPENDED'
      : subStatus === 'TRIAL'
        ? 'TRIAL'
        : subStatus === 'SUSPENDED' || subStatus === 'CANCELLED'
          ? 'SUSPENDED'
          : 'ACTIVE';
    return {
      id: d.id,
      name: d.name ?? '',
      tradeName: d.tradeName ?? d.name ?? '',
      taxId: d.taxId ?? '',
      city: d.city ?? '',
      employees: 0,
      plan: sub?.plan ?? 'STARTER',
      status,
      priceHT: +(sub?.priceHT ?? 0),
      renewal: sub?.renewalDate ?? '',
      schema: d.tenantSchema ?? '',
      mrr: status === 'ACTIVE' ? +(sub?.priceHT ?? 0) : 0,
    };
  }

  private mapLeave(d: any): LeaveRequest {
    const statusMap: Record<string, string> = {
      PENDING: 'pending',
      APPROVED: 'approved',
      REJECTED: 'rejected',
    };
    return {
      id: String(d.id),
      empId: d.employee?.id ?? 0,
      type: d.leaveType?.name ?? 'Congé',
      days: d.numberOfDays ?? 0,
      from: d.startDate ?? '',
      to: d.endDate ?? '',
      submitted: d.requestedAt ?? '',
      status: (statusMap[d.status] ?? 'pending') as any,
      note: d.employeeComment ?? '',
    };
  }

  private mapAdvance(d: any): Advance {
    const statusMap: Record<string, string> = {
      REQUESTED: 'pending',
      APPROVED: 'approved',
      REJECTED: 'rejected',
    };
    return {
      id: String(d.id),
      empId: d.employeeId ?? 0,
      amount: +(d.amount ?? 0),
      reason: d.reason ?? '',
      submitted: d.requestDate ?? '',
      status: (statusMap[d.status] ?? 'pending') as any,
      repayment: d.deductionMonth ? `${d.deductionMonth} mois` : '',
    };
  }

  private mapPeriod(d: any): PayrollPeriod {
    const m = Math.max(0, (d.month ?? 1) - 1);
    return {
      id: d.id,
      month: d.month,
      year: d.year,
      label: `${MONTHS_FR[m]} ${d.year}`,
      status: d.status ?? 'DRAFT',
      employees: 0,
      gross: 0,
      net: 0,
      validatedAt: d.validatedAt ?? null,
      lockedAt: d.lockedAt ?? null,
    };
  }
}
