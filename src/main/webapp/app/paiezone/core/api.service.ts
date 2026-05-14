import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import type { Employee, Company, Department, PayrollPeriod, LeaveRequest, Advance, RegulatoryParam } from './types';

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

  regulatoryParams(): Observable<RegulatoryParam[]> {
    return this.http.get<any[]>('/api/regulatory-params').pipe(map(list => list.map(d => this.mapRegulatoryParam(d))));
  }

  createRegulatoryParam(dto: Partial<RegulatoryParam>): Observable<RegulatoryParam> {
    return this.http.post<any>('/api/regulatory-params', dto).pipe(map(d => this.mapRegulatoryParam(d)));
  }

  updateRegulatoryParam(id: number, dto: Partial<RegulatoryParam>): Observable<RegulatoryParam> {
    return this.http.put<any>(`/api/regulatory-params/${id}`, { ...dto, id }).pipe(map(d => this.mapRegulatoryParam(d)));
  }

  deleteRegulatoryParam(id: number): Observable<void> {
    return this.http.delete<void>(`/api/regulatory-params/${id}`);
  }

  leaveTypes(): Observable<{ id: number; name: string; maxDays: number }[]> {
    const params = new HttpParams().set('page', 0).set('size', 50);
    return this.http
      .get<any[]>('/api/leave-types', { params })
      .pipe(map(list => list.map(d => ({ id: d.id, name: d.name ?? d.code ?? 'Congé', maxDays: d.maxDaysPerYear ?? 30 }))));
  }

  approveLeave(id: number): Observable<LeaveRequest> {
    return this.http.put<any>(`/api/leave-requests/${id}/approve`, {}).pipe(map(d => this.mapLeave(d)));
  }

  rejectLeave(id: number, comment: string): Observable<LeaveRequest> {
    const params = new HttpParams().set('comment', comment);
    return this.http.put<any>(`/api/leave-requests/${id}/reject`, {}, { params }).pipe(map(d => this.mapLeave(d)));
  }

  /** Endpoint simplifié — le backend résout l'employé et set status/date */
  createLeaveRequest(dto: {
    leaveTypeId: number;
    startDate: string;
    endDate: string;
    numberOfDays: number;
    comment?: string;
    employeeId?: number;
  }): Observable<LeaveRequest> {
    return this.http.post<any>('/api/leave-requests/submit', dto).pipe(map(d => this.mapLeave(d)));
  }

  approveAdvance(id: number): Observable<Advance> {
    return this.http.put<any>(`/api/advances/${id}/approve`, {}).pipe(map(d => this.mapAdvance(d)));
  }

  rejectAdvance(id: number, reason: string): Observable<Advance> {
    const params = new HttpParams().set('reason', reason);
    return this.http.put<any>(`/api/advances/${id}/reject`, {}, { params }).pipe(map(d => this.mapAdvance(d)));
  }

  /** Endpoint simplifié — le backend résout l'employé et set status/date */
  createAdvance(dto: { amount: number; reason: string; deductionMonth?: number; employeeId?: number }): Observable<Advance> {
    return this.http.post<any>('/api/advances/request', dto).pipe(map(d => this.mapAdvance(d)));
  }

  calculatePayroll(id: number): Observable<void> {
    return this.http.post<void>(`/api/payroll-periods/${id}/calculate-all`, {});
  }

  validatePayroll(id: number): Observable<void> {
    return this.http.post<void>(`/api/payroll-periods/${id}/validate`, {});
  }

  lockPayroll(id: number): Observable<void> {
    return this.http.post<void>(`/api/payroll-periods/${id}/lock`, {});
  }

  createPayrollPeriod(month: number, year: number, companyId?: number): Observable<PayrollPeriod> {
    return this.http
      .post<any>('/api/payroll-periods', { month, year, status: 'DRAFT', companyId: companyId ?? null })
      .pipe(map(d => this.mapPeriod(d)));
  }

  private mapRegulatoryParam(d: any): RegulatoryParam {
    return {
      id: d.id,
      paramKey: d.paramKey ?? '',
      paramLabel: d.paramLabel ?? '',
      category: d.category ?? null,
      numericValue: d.numericValue != null ? +d.numericValue : null,
      stringValue: d.stringValue ?? null,
      effectiveFrom: d.effectiveFrom ?? '',
      effectiveTo: d.effectiveTo ?? null,
      legalReference: d.legalReference ?? null,
      description: d.description ?? null,
      active: d.active ?? true,
      updatedAt: d.updatedAt ?? null,
      updatedBy: d.updatedBy ?? null,
    };
  }

  createDepartment(code: string, name: string, companyId: number): Observable<Department> {
    return this.http
      .post<any>('/api/departments', { code, name, active: true, company: { id: companyId } })
      .pipe(map(d => ({ id: d.id, code: d.code ?? '', name: d.name ?? '', head: '', count: 0 }) as Department));
  }

  updateCompany(id: number, dto: Record<string, any>): Observable<Company> {
    return this.http.put<any>(`/api/companies/${id}`, { ...dto, id }).pipe(map(d => this.mapCompany(d)));
  }

  patchEmployee(id: number, patch: Record<string, any>): Observable<any> {
    return this.http.patch<any>(`/api/employees/${id}`, patch);
  }

  inviteUser(login: string, email: string, firstName: string, lastName: string, role: string): Observable<any> {
    return this.http.post<any>('/api/admin/users', {
      login,
      email,
      firstName,
      lastName,
      langKey: 'fr',
      authorities: [role],
      activated: true,
    });
  }

  createChatSession(): Observable<{ id: number }> {
    return this.http.post<{ id: number }>('/api/chatbot/sessions', {});
  }

  sendChatMessage(sessionId: number, message: string): Observable<{ content: string }> {
    return this.http.post<{ content: string }>(`/api/chatbot/sessions/${sessionId}/messages`, { message });
  }

  myEmployee(): Observable<Employee> {
    return this.http.get<any>('/api/employees/me').pipe(map(d => this.mapEmployee(d)));
  }

  createEmployeeSimple(body: Record<string, any>): Observable<Employee> {
    return this.http.post<any>('/api/employees/create-simple', body).pipe(map(d => this.mapEmployee(d)));
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
