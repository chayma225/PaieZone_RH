import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPayrollPeriod } from '../payroll-period.model';

// ── Aligné exactement avec BulkCalculationResultDTO.java ──────────
export interface BulkCalculationResult {
  totalEmployees:   number;
  calculated:       number;
  errors:           number;
  totalNetPayroll:  number;   // ← correspond au getter Java getTotalNetPayroll()
  totalGrossPayroll: number;  // ← correspond au getter Java getTotalGrossPayroll()
  errorDetails:     string[]; // ← correspond au getter Java getErrorDetails()
}

@Injectable({ providedIn: 'root' })
export class PayrollPeriodService {

  private http   = inject(HttpClient);
  private config = inject(ApplicationConfigService);
  private url    = this.config.getEndpointFor('api/payroll-periods');

  find(id: number): Observable<HttpResponse<IPayrollPeriod>> {
    return this.http.get<IPayrollPeriod>(
      `${this.url}/${id}`, { observe: 'response' });
}

query(req?: any): Observable<HttpResponse<IPayrollPeriod[]>> {
  return this.http.get<IPayrollPeriod[]>(this.url, {
    params: createRequestOption(req),
    observe: 'response',
  });
}

create(period: IPayrollPeriod): Observable<HttpResponse<IPayrollPeriod>> {
  return this.http.post<IPayrollPeriod>(this.url, period, { observe: 'response' });
}

update(period: IPayrollPeriod): Observable<HttpResponse<IPayrollPeriod>> {
  return this.http.put<IPayrollPeriod>(
    `${this.url}/${period.id}`, period, { observe: 'response' });
}

delete(id: number): Observable<HttpResponse<void>> {
  return this.http.delete<void>(`${this.url}/${id}`, { observe: 'response' });
}

/** POST /api/payroll-periods/{id}/calculate-all */
calculateAll(id: number): Observable<HttpResponse<BulkCalculationResult>> {
  return this.http.post<BulkCalculationResult>(
    `${this.url}/${id}/calculate-all`, {}, { observe: 'response' });
}

/** POST /api/payroll-periods/{id}/validate */
validatePeriod(id: number): Observable<HttpResponse<void>> {
  return this.http.post<void>(
    `${this.url}/${id}/validate`, {}, { observe: 'response' });
}

/** POST /api/payroll-periods/{id}/lock */
lockPeriod(id: number): Observable<HttpResponse<void>> {
  return this.http.post<void>(
    `${this.url}/${id}/lock`, {}, { observe: 'response' });
}

// Compatibilité avec les composants existants
comparePayrollPeriod(
  o1: Pick<IPayrollPeriod, 'id'> | null,
  o2: Pick<IPayrollPeriod, 'id'> | null
): boolean {
  return o1 && o2 ? o1.id === o2.id : o1 === o2;
}

addPayrollPeriodToCollectionIfMissing<T extends Pick<IPayrollPeriod, 'id'>>(
  collection: T[], ...toCheck: (T | null | undefined)[]
): T[] {
  const items = toCheck.filter((i): i is T => i != null);
  if (!items.length) return collection;
  const ids = new Set(collection.map(i => i.id));
  return [...items.filter(i => !ids.has(i.id)), ...collection];
}
}
