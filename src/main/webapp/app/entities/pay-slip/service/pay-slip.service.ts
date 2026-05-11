// src/main/webapp/app/entities/pay-slip/service/pay-slip.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPaySlip, NewPaySlip } from '../pay-slip.model';

export type EntityResponseType = HttpResponse<IPaySlip>;
export type EntityArrayResponseType = HttpResponse<IPaySlip[]>;

@Injectable({ providedIn: 'root' })
export class PaySlipService {
  protected http = inject(HttpClient);
  protected appConfig = inject(ApplicationConfigService);
  protected resourceUrl = this.appConfig.getEndpointFor('api/pay-slips');

  create(paySlip: NewPaySlip): Observable<EntityResponseType> {
    return this.http.post<IPaySlip>(this.resourceUrl, paySlip, { observe: 'response' });
  }

  update(paySlip: IPaySlip): Observable<EntityResponseType> {
    return this.http.put<IPaySlip>(`${this.resourceUrl}/${paySlip.id}`, paySlip, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IPaySlip>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    return this.http.get<IPaySlip[]>(this.resourceUrl, {
      params: createRequestOption(req),
      observe: 'response'
    });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  // Méthodes métier Phase 1
  recalculate(paySlipId: number): Observable<EntityResponseType> {
    return this.http.post<IPaySlip>(`api/payslips/${paySlipId}/recalculate`, {}, { observe: 'response' });
  }

  calculateOne(periodId: number, employeeId: number): Observable<EntityResponseType> {
    return this.http.post<IPaySlip>(`api/payroll-periods/${periodId}/calculate/${employeeId}`, {}, { observe: 'response' });
  }

  comparePaySlip(o1: Pick<IPaySlip, 'id'> | null, o2: Pick<IPaySlip, 'id'> | null): boolean {
    return o1?.id === o2?.id;
  }

  addPaySlipToCollectionIfMissing<T extends Pick<IPaySlip, 'id'>>(
    collection: T[],
    ...toCheck: (T | null | undefined)[]
  ): T[] {
    const items = toCheck.filter((item): item is T => item != null);
    if (items.length === 0) return collection;
    const ids = new Set(collection.map(i => i.id));
    const toAdd = items.filter(i => !ids.has(i.id));
    return [...toAdd, ...collection];
  }
}
