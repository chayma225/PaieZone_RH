import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPayrollPeriod, NewPayrollPeriod } from '../payroll-period.model';

export type PartialUpdatePayrollPeriod = Partial<IPayrollPeriod> & Pick<IPayrollPeriod, 'id'>;

type RestOf<T extends IPayrollPeriod | NewPayrollPeriod> = Omit<T, 'calculatedAt' | 'validatedAt' | 'lockedAt'> & {
  calculatedAt?: string | null;
  validatedAt?: string | null;
  lockedAt?: string | null;
};

export type RestPayrollPeriod = RestOf<IPayrollPeriod>;

export type NewRestPayrollPeriod = RestOf<NewPayrollPeriod>;

export type PartialUpdateRestPayrollPeriod = RestOf<PartialUpdatePayrollPeriod>;

export type EntityResponseType = HttpResponse<IPayrollPeriod>;
export type EntityArrayResponseType = HttpResponse<IPayrollPeriod[]>;

@Injectable({ providedIn: 'root' })
export class PayrollPeriodService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/payroll-periods');

  create(payrollPeriod: NewPayrollPeriod): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payrollPeriod);
    return this.http
      .post<RestPayrollPeriod>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payrollPeriod: IPayrollPeriod): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payrollPeriod);
    return this.http
      .put<RestPayrollPeriod>(`${this.resourceUrl}/${this.getPayrollPeriodIdentifier(payrollPeriod)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(payrollPeriod: PartialUpdatePayrollPeriod): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(payrollPeriod);
    return this.http
      .patch<RestPayrollPeriod>(`${this.resourceUrl}/${this.getPayrollPeriodIdentifier(payrollPeriod)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestPayrollPeriod>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPayrollPeriod[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getPayrollPeriodIdentifier(payrollPeriod: Pick<IPayrollPeriod, 'id'>): number {
    return payrollPeriod.id;
  }

  comparePayrollPeriod(o1: Pick<IPayrollPeriod, 'id'> | null, o2: Pick<IPayrollPeriod, 'id'> | null): boolean {
    return o1 && o2 ? this.getPayrollPeriodIdentifier(o1) === this.getPayrollPeriodIdentifier(o2) : o1 === o2;
  }

  addPayrollPeriodToCollectionIfMissing<Type extends Pick<IPayrollPeriod, 'id'>>(
    payrollPeriodCollection: Type[],
    ...payrollPeriodsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const payrollPeriods: Type[] = payrollPeriodsToCheck.filter(isPresent);
    if (payrollPeriods.length > 0) {
      const payrollPeriodCollectionIdentifiers = payrollPeriodCollection.map(payrollPeriodItem =>
        this.getPayrollPeriodIdentifier(payrollPeriodItem),
      );
      const payrollPeriodsToAdd = payrollPeriods.filter(payrollPeriodItem => {
        const payrollPeriodIdentifier = this.getPayrollPeriodIdentifier(payrollPeriodItem);
        if (payrollPeriodCollectionIdentifiers.includes(payrollPeriodIdentifier)) {
          return false;
        }
        payrollPeriodCollectionIdentifiers.push(payrollPeriodIdentifier);
        return true;
      });
      return [...payrollPeriodsToAdd, ...payrollPeriodCollection];
    }
    return payrollPeriodCollection;
  }

  protected convertDateFromClient<T extends IPayrollPeriod | NewPayrollPeriod | PartialUpdatePayrollPeriod>(payrollPeriod: T): RestOf<T> {
    return {
      ...payrollPeriod,
      calculatedAt: payrollPeriod.calculatedAt?.toJSON() ?? null,
      validatedAt: payrollPeriod.validatedAt?.toJSON() ?? null,
      lockedAt: payrollPeriod.lockedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restPayrollPeriod: RestPayrollPeriod): IPayrollPeriod {
    return {
      ...restPayrollPeriod,
      calculatedAt: restPayrollPeriod.calculatedAt ? dayjs(restPayrollPeriod.calculatedAt) : undefined,
      validatedAt: restPayrollPeriod.validatedAt ? dayjs(restPayrollPeriod.validatedAt) : undefined,
      lockedAt: restPayrollPeriod.lockedAt ? dayjs(restPayrollPeriod.lockedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestPayrollPeriod>): HttpResponse<IPayrollPeriod> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestPayrollPeriod[]>): HttpResponse<IPayrollPeriod[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
