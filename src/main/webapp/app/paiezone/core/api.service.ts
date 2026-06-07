import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import type {
  Employee,
  Company,
  ActivitySector,
  SectoralConvention,
  ConventionRule,
  ConventionImportSuggestion,
  Department,
  PayrollPeriod,
  LeaveRequest,
  Advance,
  AuditEntry,
  RegulatoryParam,
  JobPosition,
  Bonus,
  Rubrique,
  PaySlip,
  HrDocument,
  Contract,
  LeaveBalance,
  ActivityItem,
  PayrollChartPoint,
  ContractAlert,
  AccountPlan,
  AccountingEntry,
  LeaveType,
  PublicHoliday,
} from './types';

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  dashboardStats(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>('/api/dashboard/stats');
  }

  servicesHealth(): Observable<{ name: string; up: boolean; warn?: boolean; latency: string; latencyMs: number }[]> {
    return this.http.get<{ name: string; up: boolean; warn?: boolean; latency: string; latencyMs: number }[]>(
      '/api/dashboard/services-health',
    );
  }

  activityFeed(): Observable<ActivityItem[]> {
    return this.http.get<any[]>('/api/dashboard/activity').pipe(
      map(list =>
        list.map(
          d =>
            ({
              icon: d.icon ?? 'History',
              userLogin: d.userLogin ?? '',
              message: d.message ?? '',
              dateLabel: d.dateLabel ?? '',
              timeHm: d.timeHm ?? '',
              entityType: (d.entityType ?? '').toUpperCase(),
              entityId: d.entityId ? Number(d.entityId) : null,
            }) as ActivityItem,
        ),
      ),
    );
  }

  payrollChart(): Observable<PayrollChartPoint[]> {
    return this.http.get<PayrollChartPoint[]>('/api/dashboard/payroll-chart');
  }

  contractAlerts(): Observable<ContractAlert[]> {
    return this.http.get<any[]>('/api/dashboard/contract-alerts').pipe(
      map(list =>
        list.map(
          a =>
            ({
              id: a.id,
              type: a.type ?? 'CONTRACT_END',
              contractType: a.contractType ?? '',
              date: a.date ?? a.endDate ?? '', // compatibilité ancien/nouveau backend
              daysLeft: a.daysLeft ?? 0,
              employeeName: a.employeeName ?? '',
              employeeId: a.employeeId ?? null,
            }) as ContractAlert,
        ),
      ),
    );
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
              active: d.active ?? true,
              description: d.description ?? '',
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
    return this.http
      .get<any[]>('/api/leave-types')
      .pipe(map(list => list.map(d => ({ id: d.id, name: d.label ?? d.name ?? 'Congé', maxDays: d.maxDaysPerYear ?? 30 }))));
  }

  leaveTypesFull(): Observable<LeaveType[]> {
    return this.http.get<any[]>('/api/leave-types').pipe(map(list => list.map(d => this.mapLeaveType(d))));
  }

  createLeaveType(dto: Omit<LeaveType, 'id'>): Observable<LeaveType> {
    return this.http
      .post<any>('/api/leave-types', {
        label: dto.label,
        code: dto.code,
        maxDaysPerYear: dto.maxDaysPerYear,
        paid: dto.paid,
        requiresApproval: dto.requiresApproval,
        active: dto.active,
        description: dto.description || null,
      })
      .pipe(map(d => this.mapLeaveType(d)));
  }

  updateLeaveType(id: number, dto: Omit<LeaveType, 'id'>): Observable<LeaveType> {
    return this.http
      .put<any>(`/api/leave-types/${id}`, {
        id,
        label: dto.label,
        code: dto.code,
        maxDaysPerYear: dto.maxDaysPerYear,
        paid: dto.paid,
        requiresApproval: dto.requiresApproval,
        active: dto.active,
        description: dto.description || null,
      })
      .pipe(map(d => this.mapLeaveType(d)));
  }

  deleteLeaveType(id: number): Observable<void> {
    return this.http.delete<void>(`/api/leave-types/${id}`);
  }

  private mapLeaveType(d: any): LeaveType {
    return {
      id: d.id,
      code: d.code ?? '',
      label: d.label ?? d.name ?? '',
      maxDaysPerYear: d.maxDaysPerYear ?? 30,
      paid: d.paid ?? true,
      requiresApproval: d.requiresApproval ?? true,
      active: d.active ?? true,
      description: d.description ?? '',
    };
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
    status?: string;
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

  recalculatePayroll(id: number): Observable<void> {
    return this.http.post<void>(`/api/payroll-periods/${id}/recalculate-all`, {});
  }

  // ── Conventions sectorielles ──────────────────────────────────
  activitySectors(): Observable<ActivitySector[]> {
    return this.http.get<ActivitySector[]>('/api/activity-sectors');
  }

  createActivitySector(dto: Omit<ActivitySector, 'id'>): Observable<ActivitySector> {
    return this.http.post<ActivitySector>('/api/activity-sectors', dto);
  }

  updateActivitySector(id: number, dto: Partial<ActivitySector>): Observable<ActivitySector> {
    return this.http.put<ActivitySector>(`/api/activity-sectors/${id}`, { ...dto, id });
  }

  deleteActivitySector(id: number): Observable<void> {
    return this.http.delete<void>(`/api/activity-sectors/${id}`);
  }

  sectoralConventions(sectorId?: number): Observable<SectoralConvention[]> {
    if (sectorId) return this.http.get<SectoralConvention[]>(`/api/sectoral-conventions/by-sector/${sectorId}`);
    return this.http.get<SectoralConvention[]>('/api/sectoral-conventions');
  }

  createSectoralConvention(dto: { sectorId: number; year: number; label: string; effectiveFrom?: string }): Observable<SectoralConvention> {
    return this.http.post<SectoralConvention>('/api/sectoral-conventions', dto);
  }

  updateSectoralConvention(id: number, dto: Partial<{ label: string; year: number; active: boolean }>): Observable<SectoralConvention> {
    return this.http.put<SectoralConvention>(`/api/sectoral-conventions/${id}`, dto);
  }

  deleteSectoralConvention(id: number): Observable<void> {
    return this.http.delete<void>(`/api/sectoral-conventions/${id}`);
  }

  parseConventionDocument(payload: FormData): Observable<ConventionImportSuggestion> {
    return this.http.post<ConventionImportSuggestion>('/api/conventions/parse-ia', payload);
  }

  conventionRules(conventionId: number): Observable<ConventionRule[]> {
    return this.http.get<ConventionRule[]>(`/api/convention-rules/by-convention/${conventionId}`);
  }

  createConventionRule(dto: { conventionId: number; ruleType: string; label: string; value: string }): Observable<ConventionRule> {
    return this.http.post<ConventionRule>('/api/convention-rules', dto);
  }

  updateConventionRule(id: number, dto: Partial<{ label: string; value: string; active: boolean }>): Observable<ConventionRule> {
    return this.http.put<ConventionRule>(`/api/convention-rules/${id}`, dto);
  }

  deleteConventionRule(id: number): Observable<void> {
    return this.http.delete<void>(`/api/convention-rules/${id}`);
  }

  updateCompanySector(companyId: number, sectorId: number | null): Observable<any> {
    return this.http.patch<any>(`/api/companies/${companyId}`, { activitySectorId: sectorId });
  }

  publicHolidays(year?: number): Observable<PublicHoliday[]> {
    let params = new HttpParams().set('page', 0).set('size', 500).set('sort', 'year,asc').append('sort', 'holidayDate,asc');
    if (year) params = params.set('year.equals', year);
    return this.http.get<any[]>('/api/public-holidays', { params }).pipe(map(list => list.map(d => this.mapPublicHoliday(d))));
  }

  createPublicHoliday(dto: Omit<PublicHoliday, 'id'>): Observable<PublicHoliday> {
    return this.http.post<any>('/api/public-holidays', dto).pipe(map(d => this.mapPublicHoliday(d)));
  }

  updatePublicHoliday(id: number, dto: Omit<PublicHoliday, 'id'>): Observable<PublicHoliday> {
    return this.http.put<any>(`/api/public-holidays/${id}`, { ...dto, id }).pipe(map(d => this.mapPublicHoliday(d)));
  }

  deletePublicHoliday(id: number): Observable<void> {
    return this.http.delete<void>(`/api/public-holidays/${id}`);
  }

  private mapPublicHoliday(d: any): PublicHoliday {
    return {
      id: d.id,
      name: d.name ?? '',
      nameAr: d.nameAr ?? null,
      holidayDate: d.holidayDate ?? '',
      year: d.year ?? new Date().getFullYear(),
      isRecurring: d.isRecurring ?? true,
      active: d.active ?? true,
    };
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

  createDepartment(code: string, name: string, companyId: number, description = ''): Observable<Department> {
    return this.http
      .post<any>('/api/departments', { code, name, description: description || null, active: true, company: { id: companyId } })
      .pipe(
        map(
          d =>
            ({
              id: d.id,
              code: d.code ?? '',
              name: d.name ?? '',
              head: '',
              count: 0,
              active: true,
              description: d.description ?? '',
            }) as Department,
        ),
      );
  }

  updateDepartment(id: number, code: string, name: string, description: string, companyId: number): Observable<Department> {
    return this.http
      .put<any>(`/api/departments/${id}`, { id, code, name, description: description || null, active: true, company: { id: companyId } })
      .pipe(
        map(
          d =>
            ({
              id: d.id,
              code: d.code ?? '',
              name: d.name ?? '',
              head: '',
              count: 0,
              active: d.active ?? true,
              description: d.description ?? '',
            }) as Department,
        ),
      );
  }

  patchDepartment(id: number, patch: Record<string, any>): Observable<any> {
    return this.http.patch<any>(`/api/departments/${id}`, { ...patch, id });
  }

  updateJobPosition(id: number, dto: Partial<JobPosition>): Observable<JobPosition> {
    return this.http.put<any>(`/api/job-positions/${id}`, { ...dto, id }).pipe(map(d => this.mapJobPosition(d)));
  }

  patchJobPosition(id: number, patch: Record<string, any>): Observable<any> {
    return this.http.patch<any>(`/api/job-positions/${id}`, { ...patch, id });
  }

  deactivateJhiUser(
    login: string,
    email: string,
    firstName: string,
    lastName: string,
    authorities: string[],
    id?: number,
  ): Observable<any> {
    return this.http.put<any>('/api/admin/users', { id, login, email, firstName, lastName, activated: false, langKey: 'fr', authorities });
  }

  activateJhiUser(login: string, email: string, firstName: string, lastName: string, authorities: string[], id?: number): Observable<any> {
    return this.http.put<any>('/api/admin/users', { id, login, email, firstName, lastName, activated: true, langKey: 'fr', authorities });
  }

  createCompany(dto: Record<string, any>): Observable<Company> {
    return this.http.post<any>('/api/companies', dto).pipe(map(d => this.mapCompany(d)));
  }

  updateCompany(id: number, dto: Record<string, any>): Observable<Company> {
    return this.http.put<any>(`/api/companies/${id}`, { ...dto, id }).pipe(map(d => this.mapCompany(d)));
  }

  patchCompany(id: number, patch: Record<string, any>): Observable<Company> {
    return this.http.patch<any>(`/api/companies/${id}`, { ...patch, id }).pipe(map(d => this.mapCompany(d)));
  }

  changePlan(companyId: number, plan: string): Observable<Company> {
    return this.http.post<any>(`/api/companies/${companyId}/change-plan`, { plan }).pipe(map(d => this.mapCompany(d)));
  }

  suspendCompany(companyId: number): Observable<Company> {
    return this.http.patch<any>(`/api/companies/${companyId}/suspend`, {}).pipe(map(d => this.mapCompany(d)));
  }

  reactivateCompany(companyId: number): Observable<Company> {
    return this.http.patch<any>(`/api/companies/${companyId}/reactivate`, {}).pipe(map(d => this.mapCompany(d)));
  }

  cancelSubscription(companyId: number): Observable<Company> {
    return this.http.patch<any>(`/api/companies/${companyId}/cancel`, {}).pipe(map(d => this.mapCompany(d)));
  }

  patchEmployee(id: number, patch: Record<string, any>): Observable<any> {
    return this.http.patch<any>(`/api/employees/${id}`, { ...patch, id });
  }

  updateEmployeeFields(id: number, body: Record<string, any>): Observable<any> {
    return this.http.patch<any>(`/api/employees/${id}/update`, body);
  }

  admin2faStatus(login: string): Observable<{ twoFactorEnabled: boolean }> {
    return this.http.get<any>(`/api/admin/2fa/status/${login}`);
  }

  admin2faEnable(login: string): Observable<any> {
    return this.http.post<any>(`/api/admin/2fa/enable/${login}`, {});
  }

  admin2faDisable(login: string): Observable<any> {
    return this.http.delete<any>(`/api/admin/2fa/disable/${login}`);
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

  adminUsers(): Observable<any[]> {
    const params = new HttpParams().set('page', 0).set('size', 200);
    return this.http.get<any[]>('/api/admin/users', { params });
  }

  updateUserAuthorities(
    login: string,
    email: string,
    firstName: string,
    lastName: string,
    authorities: string[],
    id?: number,
  ): Observable<any> {
    return this.http.put<any>('/api/admin/users', {
      id,
      login,
      email,
      firstName,
      lastName,
      activated: true,
      langKey: 'fr',
      authorities,
    });
  }

  myCompanyUsers(): Observable<any[]> {
    return this.http.get<any[]>('/api/companies/my-users');
  }

  createChatSession(): Observable<{ id: number }> {
    return this.http.post<{ id: number }>('/api/chatbot/sessions', {});
  }

  sendChatMessage(sessionId: number, message: string): Observable<{ content: string }> {
    return this.http.post<{ content: string }>(`/api/chatbot/sessions/${sessionId}/messages`, { message });
  }

  getMyLatestBulletin(): Observable<{ id?: number; month?: number; year?: number; error?: string }> {
    return this.http.get<any>('/api/chatbot/my-bulletin');
  }

  downloadBulletinBlob(id: number): Observable<Blob> {
    return this.http.get(`/api/export/bulletin/${id}`, { responseType: 'blob' });
  }

  jobPositions(companyId?: number): Observable<JobPosition[]> {
    let params = new HttpParams().set('page', 0).set('size', 200);
    if (companyId) params = params.set('companyId', companyId);
    return this.http.get<any[]>('/api/job-positions', { params }).pipe(map(list => list.map(d => this.mapJobPosition(d))));
  }

  createJobPosition(dto: { code: string; title: string; description?: string; active: boolean }): Observable<JobPosition> {
    return this.http.post<any>('/api/job-positions', dto).pipe(map(d => this.mapJobPosition(d)));
  }

  deleteJobPosition(id: number): Observable<void> {
    return this.http.delete<void>(`/api/job-positions/${id}`);
  }

  bonuses(filter?: { employeeId?: number; month?: number; year?: number }): Observable<Bonus[]> {
    let params = new HttpParams().set('page', 0).set('size', 500);
    if (filter?.employeeId) params = params.set('employeeId.equals', filter.employeeId);
    if (filter?.month) params = params.set('month.equals', filter.month);
    if (filter?.year) params = params.set('year.equals', filter.year);
    return this.http.get<any[]>('/api/bonuses', { params }).pipe(map(list => list.map(d => this.mapBonus(d))));
  }

  createBonus(dto: Omit<Bonus, 'id' | 'paySlipId'>): Observable<Bonus> {
    return this.http.post<any>('/api/bonuses', dto).pipe(map(d => this.mapBonus(d)));
  }

  updateBonus(id: number, dto: Omit<Bonus, 'id' | 'paySlipId'>): Observable<Bonus> {
    return this.http.put<any>(`/api/bonuses/${id}`, { ...dto, id }).pipe(map(d => this.mapBonus(d)));
  }

  deleteBonus(id: number): Observable<void> {
    return this.http.delete<void>(`/api/bonuses/${id}`);
  }

  rubriques(): Observable<Rubrique[]> {
    const params = new HttpParams().set('page', 0).set('size', 200);
    return this.http.get<any[]>('/api/rubriques', { params }).pipe(map(list => list.map(d => this.mapRubrique(d))));
  }

  createRubrique(dto: Omit<Rubrique, 'id'>): Observable<Rubrique> {
    return this.http.post<any>('/api/rubriques', dto).pipe(map(d => this.mapRubrique(d)));
  }

  updateRubrique(id: number, dto: Partial<Rubrique>): Observable<Rubrique> {
    return this.http.put<any>(`/api/rubriques/${id}`, { ...dto, id }).pipe(map(d => this.mapRubrique(d)));
  }

  deleteRubrique(id: number): Observable<void> {
    return this.http.delete<void>(`/api/rubriques/${id}`);
  }

  paySlips(periodId: number): Observable<PaySlip[]> {
    const params = new HttpParams().set('payrollPeriodId.equals', periodId).set('page', 0).set('size', 500);
    return this.http.get<any[]>('/api/pay-slips', { params }).pipe(map(list => list.map(d => this.mapPaySlip(d))));
  }

  myPaySlips(): Observable<PaySlip[]> {
    const params = new HttpParams().set('page', 0).set('size', 24);
    return this.http.get<any[]>('/api/pay-slips/my', { params }).pipe(map(list => list.map(d => this.mapPaySlip(d))));
  }

  myLeaveBalances(): Observable<LeaveBalance[]> {
    return this.http.get<any[]>('/api/leave-balances/my').pipe(map(list => list.map(d => this.mapLeaveBalance(d))));
  }

  myLeaveRequests(): Observable<any[]> {
    return this.http.get<any[]>('/api/leave-requests/my').pipe(map(list => list.map(d => this.mapLeave(d))));
  }

  paySlipsByEmployee(employeeId: number): Observable<PaySlip[]> {
    const params = new HttpParams().set('employeeId.equals', employeeId).set('page', 0).set('size', 24);
    return this.http.get<any[]>('/api/pay-slips', { params }).pipe(map(list => list.map(d => this.mapPaySlip(d))));
  }

  hrDocuments(employeeId: number): Observable<HrDocument[]> {
    const params = new HttpParams().set('employeeId.equals', employeeId).set('page', 0).set('size', 100);
    return this.http.get<any[]>('/api/hr-documents', { params }).pipe(map(list => list.map(d => this.mapHrDocument(d))));
  }

  createHrDocument(dto: {
    documentType: string;
    title: string;
    description?: string;
    fileUrl?: string;
    active: boolean;
    employee: { id: number };
  }): Observable<HrDocument> {
    return this.http.post<any>('/api/hr-documents', dto).pipe(map(d => this.mapHrDocument(d)));
  }

  deleteHrDocument(id: number): Observable<void> {
    return this.http.delete<void>(`/api/hr-documents/${id}`);
  }

  downloadBulletin(paySlipId: number): Observable<Blob> {
    return this.http.get(`/api/export/bulletin/${paySlipId}`, { responseType: 'blob' });
  }

  downloadBulkBulletin(periodId: number): Observable<Blob> {
    return this.http.get(`/api/export/bulletin-bulk/${periodId}`, { responseType: 'blob' });
  }

  downloadAttestationTravail(employeeId: number): Observable<Blob> {
    return this.http.get(`/api/export/attestation/${employeeId}`, { responseType: 'blob' });
  }

  downloadJournalPaie(periodId: number): Observable<Blob> {
    return this.http.get(`/api/export/journal/${periodId}`, { responseType: 'blob' });
  }

  downloadCnssRecap(periodId: number): Observable<Blob> {
    return this.http.get(`/api/export/cnss-recap/${periodId}`, { responseType: 'blob' });
  }

  downloadDeclarationTrimestrielle(periodId: number): Observable<Blob> {
    return this.http.get(`/api/export/declaration-trimestrielle/${periodId}`, { responseType: 'blob' });
  }

  downloadCertificatRI(employeeId: number, year: number): Observable<Blob> {
    return this.http.get(`/api/export/certificat-ri/${employeeId}?year=${year}`, { responseType: 'blob' });
  }

  downloadCnssEmployeur(periodId: number): Observable<Blob> {
    return this.http.get(`/api/export/cnss-employeur/${periodId}`, { responseType: 'blob' });
  }

  downloadCavisDeclaration(periodId: number): Observable<Blob> {
    return this.http.get(`/api/export/cavis-recap/${periodId}`, { responseType: 'blob' });
  }

  downloadIrppDeclaration(year: number): Observable<Blob> {
    return this.http.get(`/api/export/irpp-annuel?year=${year}`, { responseType: 'blob' });
  }

  // ── Plan comptable ─────────────────────────────────────────────────────────
  accountPlans(): Observable<AccountPlan[]> {
    return this.http.get<any[]>('/api/account-plans').pipe(
      map(list =>
        list.map(
          d =>
            ({
              id: d.id,
              accountCode: d.accountCode ?? '',
              accountLabel: d.accountLabel ?? '',
              accountType: d.accountType ?? null,
              active: d.active ?? true,
            }) as AccountPlan,
        ),
      ),
    );
  }

  createAccountPlan(dto: Omit<AccountPlan, 'id'> & { companyId: number }): Observable<AccountPlan> {
    const body = {
      accountCode: dto.accountCode,
      accountLabel: dto.accountLabel,
      accountType: dto.accountType,
      active: dto.active,
      company: { id: dto.companyId },
    };
    return this.http.post<any>('/api/account-plans', body).pipe(
      map(d => ({
        id: d.id,
        accountCode: d.accountCode,
        accountLabel: d.accountLabel,
        accountType: d.accountType ?? null,
        active: d.active,
      })),
    );
  }

  updateAccountPlan(id: number, dto: Omit<AccountPlan, 'id'> & { companyId: number }): Observable<AccountPlan> {
    const body = {
      id,
      accountCode: dto.accountCode,
      accountLabel: dto.accountLabel,
      accountType: dto.accountType,
      active: dto.active,
      company: { id: dto.companyId },
    };
    return this.http.put<any>(`/api/account-plans/${id}`, body).pipe(
      map(d => ({
        id: d.id,
        accountCode: d.accountCode,
        accountLabel: d.accountLabel,
        accountType: d.accountType ?? null,
        active: d.active,
      })),
    );
  }

  deleteAccountPlan(id: number): Observable<void> {
    return this.http.delete<void>(`/api/account-plans/${id}`);
  }

  // ── Écritures comptables ───────────────────────────────────────────────────
  accountingEntries(size = 500): Observable<AccountingEntry[]> {
    const params = new HttpParams().set('page', 0).set('size', size).set('sort', 'entryDate,desc');
    return this.http.get<any[]>('/api/accounting-entries', { params }).pipe(
      map(list =>
        list.map(
          d =>
            ({
              id: d.id,
              entryDate: d.entryDate ?? '',
              journalRef: d.journalRef ?? '',
              entryType: d.entryType ?? '',
              description: d.description ?? '',
              debitAccount: d.debitAccount ?? '',
              creditAccount: d.creditAccount ?? '',
              amount: d.amount != null ? +d.amount : 0,
              exportedAt: d.exportedAt ?? null,
              periodLabel: d.payrollPeriod ? `${MONTHS_FR[(d.payrollPeriod.month ?? 1) - 1]} ${d.payrollPeriod.year}` : undefined,
              periodId: d.payrollPeriod?.id ?? undefined,
            }) as AccountingEntry,
        ),
      ),
    );
  }

  auditLogs(size = 500): Observable<AuditEntry[]> {
    const params = new HttpParams().set('page', 0).set('size', size).set('sort', 'occurredAt,desc');
    return this.http.get<any[]>('/api/audit-logs', { params }).pipe(
      map(list =>
        list.map(
          d =>
            ({
              id: d.id,
              user: d.user?.jhiUserId ?? 'system',
              role: d.user?.role ?? '',
              action: d.action ?? '',
              entity: d.entityType ?? '',
              entityId: String(d.entityId ?? ''),
              ip: d.ipAddress ?? '',
              date: d.occurredAt ? new Date(d.occurredAt).toLocaleString('fr-FR') : '',
              detail: d.newValue ?? '',
            }) as AuditEntry,
        ),
      ),
    );
  }

  myEmployee(): Observable<Employee> {
    return this.http.get<any>('/api/employees/me').pipe(map(d => this.mapEmployee(d)));
  }

  createEmployeeSimple(body: Record<string, any>): Observable<Employee> {
    return this.http.post<any>('/api/employees/create-simple', body).pipe(map(d => this.mapEmployee(d)));
  }

  importEmployeesExcel(file: File): Observable<{
    imported: number;
    skipped: number;
    errors: number;
    importedNames: string[];
    skippedLines: string[];
    errorLines: string[];
    message: string;
  }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<any>('/api/employees/import-excel', fd);
  }

  contracts(employeeId?: number, size = 500): Observable<Contract[]> {
    let params = new HttpParams().set('page', 0).set('size', size);
    if (employeeId != null) params = params.set('employeeId.equals', employeeId);
    return this.http.get<any[]>('/api/contracts', { params }).pipe(map(list => list.map(d => this.mapContract(d))));
  }

  createContract(dto: {
    reference: string;
    contractType: string;
    status: string;
    startDate: string;
    endDate?: string | null;
    baseSalary: number;
    workingHoursWeek: number;
    workingDaysWeek: number;
    createdAt: string;
    employee: { id: number };
  }): Observable<Contract> {
    return this.http.post<any>('/api/contracts', dto).pipe(map(d => this.mapContract(d)));
  }

  private mapContract(d: any): Contract {
    return {
      id: d.id,
      reference: d.reference ?? '',
      contractType: d.contractType ?? 'CDI',
      status: d.status ?? 'DRAFT',
      startDate: d.startDate ?? '',
      endDate: d.endDate ?? null,
      signedDate: d.signedDate ?? null,
      baseSalary: +(d.baseSalary ?? 0),
      jobTitle: d.jobTitle ?? null,
      workingHoursWeek: d.workingHoursWeek ?? 40,
      workingDaysWeek: d.workingDaysWeek ?? 5,
      conventionCollective: d.conventionCollective ?? null,
      trialPeriodMonths: d.trialPeriodMonths ?? null,
      renewalCount: d.renewalCount ?? null,
      notes: d.notes ?? null,
      employeeId: d.employee?.id ?? 0,
    };
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`/api/employees/${id}`);
  }

  updateContract(id: number, dto: Record<string, any>): Observable<Contract> {
    return this.http.put<any>(`/api/contracts/${id}`, { ...dto, id }).pipe(map(d => this.mapContract(d)));
  }

  private mapEmployee(d: any): Employee {
    return {
      id: d.id,
      matricule: d.matricule ?? '',
      first: d.firstName ?? '',
      last: d.lastName ?? '',
      active: d.active ?? true,
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
      manager: d.manager ? `${d.manager.firstName ?? ''} ${d.manager.lastName ?? ''}`.trim() : undefined,
      birthDate: d.birthDate ?? undefined,
      nationalId: d.nationalId ?? undefined,
      maritalStatus: d.maritalStatus ?? undefined,
      chefDeFamille: d.chefDeFamille ?? false,
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
      name: d.name || '',
      tradeName: d.tradeName || '',
      taxId: d.taxId ?? '',
      cnssId: d.cnssId ?? '',
      city: d.city ?? '',
      gouvernorat: d.gouvernorat ?? '',
      address: d.address ?? '',
      postalCode: d.postalCode ?? '',
      email: d.email ?? '',
      phone: d.phone ?? '',
      website: d.website ?? '',
      legalForm: d.legalForm ?? '',
      capitalSocial: d.capitalSocial != null ? +d.capitalSocial : null,
      mainActivity: d.mainActivity ?? '',
      employees: d.employeeCount != null ? +d.employeeCount : 0,
      plan: sub?.plan ?? 'STARTER',
      status,
      priceHT: +(sub?.priceHT ?? 0),
      maxEmployees: sub?.maxEmployees != null ? +sub.maxEmployees : null,
      renewal: sub?.renewalDate ?? '',
      schema: d.tenantSchema ?? '',
      createdAt: d.createdAt ?? '',
      mrr: status === 'ACTIVE' ? +(sub?.priceHT ?? 0) : 0,
      logoUrl: d.logoUrl ?? null,
      adminLogin: d.adminLogin ?? undefined,
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
      type: d.leaveType?.label ?? d.leaveType?.name ?? 'Congé',
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
      DEDUCTED: 'approved',
    };
    const empId = d.employeeId ?? d.employee?.id ?? 0;
    return {
      id: String(d.id),
      empId,
      amount: +(d.amount ?? 0),
      reason: d.reason ?? d.notes ?? '',
      submitted: d.requestDate ?? '',
      status: (statusMap[d.status] ?? 'pending') as any,
      repayment: d.deductionMonth ? `${d.deductionMonth} mois` : '',
    };
  }

  private mapJobPosition(d: any): JobPosition {
    return {
      id: d.id,
      code: d.code ?? '',
      title: d.title ?? '',
      description: d.description ?? '',
      minSalary: d.minSalary != null ? +d.minSalary : null,
      maxSalary: d.maxSalary != null ? +d.maxSalary : null,
      active: d.active ?? true,
    };
  }

  private mapBonus(d: any): Bonus {
    return {
      id: d.id,
      bonusType: d.bonusType ?? 'OTHER',
      label: d.label ?? '',
      amount: +(d.amount ?? 0),
      taxable: d.taxable ?? false,
      month: d.month ?? 1,
      year: d.year ?? new Date().getFullYear(),
      notes: d.notes ?? '',
      employeeId: d.employeeId ?? 0,
      paySlipId: d.paySlipId ?? null,
    };
  }

  private mapRubrique(d: any): Rubrique {
    return {
      id: d.id,
      code: d.code ?? '',
      label: d.label ?? '',
      rubriqueType: d.rubriqueType ?? 'GAIN',
      base: d.base ?? 'FIXED',
      rate: d.rate != null ? +d.rate : null,
      fixedAmount: d.fixedAmount != null ? +d.fixedAmount : null,
      taxable: d.taxable ?? false,
      cnssSalary: d.cnssSalary ?? false,
      sortOrder: d.sortOrder ?? 0,
      active: d.active ?? true,
    };
  }

  private mapPaySlip(d: any): PaySlip {
    return {
      id: d.id,
      month: d.month ?? 1,
      year: d.year ?? new Date().getFullYear(),
      baseSalary: +(d.baseSalary ?? 0),
      grossSalary: +(d.grossSalary ?? 0),
      netSalary: +(d.netSalary ?? 0),
      totalGains: +(d.totalGains ?? 0),
      totalDeductions: +(d.totalDeductions ?? 0),
      cnssSalaryAmount: +(d.cnssSalaryAmount ?? 0),
      cavisAmount: d.cavisAmount != null ? +d.cavisAmount : null,
      cssAmount: d.cssAmount != null ? +d.cssAmount : null,
      irppAmount: +(d.irppAmount ?? 0),
      totalEmployerCost: +(d.totalEmployerCost ?? 0),
      bonusTotal: d.bonusTotal != null ? +d.bonusTotal : null,
      advanceDeduction: d.advanceDeduction != null ? +d.advanceDeduction : null,
      status: d.status ?? 'DRAFT',
      employeeId: d.employeeId ?? 0,
      payrollPeriodId: d.payrollPeriodId ?? 0,
    };
  }

  private mapLeaveBalance(d: any): LeaveBalance {
    return {
      id: d.id,
      year: d.year ?? new Date().getFullYear(),
      entitled: +(d.entitled ?? 0),
      taken: +(d.taken ?? 0),
      pending: +(d.pending ?? 0),
      carryOver: +(d.carryOver ?? 0),
      remaining: +(d.remaining ?? 0),
      leaveTypeName: d.leaveType?.name ?? d.leaveType?.label ?? d.leaveType?.code ?? 'Congé',
    };
  }

  private mapHrDocument(d: any): HrDocument {
    return {
      id: d.id,
      documentType: d.documentType ?? 'OTHER',
      title: d.title ?? '',
      description: d.description ?? '',
      fileUrl: d.fileUrl ?? '',
      fileSize: d.fileSize ?? null,
      mimeType: d.mimeType ?? '',
      uploadedAt: d.uploadedAt ?? '',
      expiryDate: d.expiryDate ?? null,
      active: d.active ?? true,
      employeeId: d.employee?.id ?? 0,
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
      employees: d.employeeCount != null ? +d.employeeCount : 0,
      gross: d.totalGross != null ? +d.totalGross : 0,
      net: d.totalNet != null ? +d.totalNet : 0,
      validatedAt: d.validatedAt ?? null,
      lockedAt: d.lockedAt ?? null,
    };
  }
}
