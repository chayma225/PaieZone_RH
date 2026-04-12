import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
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

@Injectable()
export class PayrollPeriodsService {
  readonly payrollPeriodsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly payrollPeriodsResource = httpResource<RestPayrollPeriod[]>(() => {
    const params = this.payrollPeriodsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of payrollPeriod that have been fetched. It is updated when the payrollPeriodsResource emits a new value.
   * In case of error while fetching the payrollPeriods, the signal is set to an empty array.
   */
  readonly payrollPeriods = computed(() =>
    (this.payrollPeriodsResource.hasValue() ? this.payrollPeriodsResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/payroll-periods');

  protected convertValueFromServer(restPayrollPeriod: RestPayrollPeriod): IPayrollPeriod {
    return {
      ...restPayrollPeriod,
      calculatedAt: restPayrollPeriod.calculatedAt ? dayjs(restPayrollPeriod.calculatedAt) : undefined,
      validatedAt: restPayrollPeriod.validatedAt ? dayjs(restPayrollPeriod.validatedAt) : undefined,
      lockedAt: restPayrollPeriod.lockedAt ? dayjs(restPayrollPeriod.lockedAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class PayrollPeriodService extends PayrollPeriodsService {
  protected readonly http = inject(HttpClient);

  create(payrollPeriod: NewPayrollPeriod): Observable<IPayrollPeriod> {
    const copy = this.convertValueFromClient(payrollPeriod);
    return this.http.post<RestPayrollPeriod>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(payrollPeriod: IPayrollPeriod): Observable<IPayrollPeriod> {
    const copy = this.convertValueFromClient(payrollPeriod);
    return this.http
      .put<RestPayrollPeriod>(`${this.resourceUrl}/${encodeURIComponent(this.getPayrollPeriodIdentifier(payrollPeriod))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(payrollPeriod: PartialUpdatePayrollPeriod): Observable<IPayrollPeriod> {
    const copy = this.convertValueFromClient(payrollPeriod);
    return this.http
      .patch<RestPayrollPeriod>(`${this.resourceUrl}/${encodeURIComponent(this.getPayrollPeriodIdentifier(payrollPeriod))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IPayrollPeriod> {
    return this.http
      .get<RestPayrollPeriod>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IPayrollPeriod[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPayrollPeriod[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
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

  protected convertValueFromClient<T extends IPayrollPeriod | NewPayrollPeriod | PartialUpdatePayrollPeriod>(payrollPeriod: T): RestOf<T> {
    return {
      ...payrollPeriod,
      calculatedAt: payrollPeriod.calculatedAt?.toJSON() ?? null,
      validatedAt: payrollPeriod.validatedAt?.toJSON() ?? null,
      lockedAt: payrollPeriod.lockedAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestPayrollPeriod): IPayrollPeriod {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestPayrollPeriod[]): IPayrollPeriod[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
