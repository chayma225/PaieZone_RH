import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { ICnssRate, NewCnssRate } from '../cnss-rate.model';

export type PartialUpdateCnssRate = Partial<ICnssRate> & Pick<ICnssRate, 'id'>;

type RestOf<T extends ICnssRate | NewCnssRate> = Omit<T, 'effectiveFrom'> & {
  effectiveFrom?: string | null;
};

export type RestCnssRate = RestOf<ICnssRate>;

export type NewRestCnssRate = RestOf<NewCnssRate>;

export type PartialUpdateRestCnssRate = RestOf<PartialUpdateCnssRate>;

@Injectable()
export class CnssRatesService {
  readonly cnssRatesParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly cnssRatesResource = httpResource<RestCnssRate[]>(() => {
    const params = this.cnssRatesParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of cnssRate that have been fetched. It is updated when the cnssRatesResource emits a new value.
   * In case of error while fetching the cnssRates, the signal is set to an empty array.
   */
  readonly cnssRates = computed(() =>
    (this.cnssRatesResource.hasValue() ? this.cnssRatesResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/cnss-rates');

  protected convertValueFromServer(restCnssRate: RestCnssRate): ICnssRate {
    return {
      ...restCnssRate,
      effectiveFrom: restCnssRate.effectiveFrom ? dayjs(restCnssRate.effectiveFrom) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class CnssRateService extends CnssRatesService {
  protected readonly http = inject(HttpClient);

  create(cnssRate: NewCnssRate): Observable<ICnssRate> {
    const copy = this.convertValueFromClient(cnssRate);
    return this.http.post<RestCnssRate>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(cnssRate: ICnssRate): Observable<ICnssRate> {
    const copy = this.convertValueFromClient(cnssRate);
    return this.http
      .put<RestCnssRate>(`${this.resourceUrl}/${encodeURIComponent(this.getCnssRateIdentifier(cnssRate))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(cnssRate: PartialUpdateCnssRate): Observable<ICnssRate> {
    const copy = this.convertValueFromClient(cnssRate);
    return this.http
      .patch<RestCnssRate>(`${this.resourceUrl}/${encodeURIComponent(this.getCnssRateIdentifier(cnssRate))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<ICnssRate> {
    return this.http
      .get<RestCnssRate>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<ICnssRate[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestCnssRate[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getCnssRateIdentifier(cnssRate: Pick<ICnssRate, 'id'>): number {
    return cnssRate.id;
  }

  compareCnssRate(o1: Pick<ICnssRate, 'id'> | null, o2: Pick<ICnssRate, 'id'> | null): boolean {
    return o1 && o2 ? this.getCnssRateIdentifier(o1) === this.getCnssRateIdentifier(o2) : o1 === o2;
  }

  addCnssRateToCollectionIfMissing<Type extends Pick<ICnssRate, 'id'>>(
    cnssRateCollection: Type[],
    ...cnssRatesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const cnssRates: Type[] = cnssRatesToCheck.filter(isPresent);
    if (cnssRates.length > 0) {
      const cnssRateCollectionIdentifiers = cnssRateCollection.map(cnssRateItem => this.getCnssRateIdentifier(cnssRateItem));
      const cnssRatesToAdd = cnssRates.filter(cnssRateItem => {
        const cnssRateIdentifier = this.getCnssRateIdentifier(cnssRateItem);
        if (cnssRateCollectionIdentifiers.includes(cnssRateIdentifier)) {
          return false;
        }
        cnssRateCollectionIdentifiers.push(cnssRateIdentifier);
        return true;
      });
      return [...cnssRatesToAdd, ...cnssRateCollection];
    }
    return cnssRateCollection;
  }

  protected convertValueFromClient<T extends ICnssRate | NewCnssRate | PartialUpdateCnssRate>(cnssRate: T): RestOf<T> {
    return {
      ...cnssRate,
      effectiveFrom: cnssRate.effectiveFrom?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertResponseFromServer(res: RestCnssRate): ICnssRate {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestCnssRate[]): ICnssRate[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
