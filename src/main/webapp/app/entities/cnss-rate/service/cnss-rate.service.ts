import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ICnssRate, NewCnssRate } from '../cnss-rate.model';

export type PartialUpdateCnssRate = Partial<ICnssRate> & Pick<ICnssRate, 'id'>;

type RestOf<T extends ICnssRate | NewCnssRate> = Omit<T, 'effectiveFrom'> & {
  effectiveFrom?: string | null;
};

export type RestCnssRate = RestOf<ICnssRate>;

export type NewRestCnssRate = RestOf<NewCnssRate>;

export type PartialUpdateRestCnssRate = RestOf<PartialUpdateCnssRate>;

export type EntityResponseType = HttpResponse<ICnssRate>;
export type EntityArrayResponseType = HttpResponse<ICnssRate[]>;

@Injectable({ providedIn: 'root' })
export class CnssRateService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/cnss-rates');

  create(cnssRate: NewCnssRate): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(cnssRate);
    return this.http
      .post<RestCnssRate>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(cnssRate: ICnssRate): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(cnssRate);
    return this.http
      .put<RestCnssRate>(`${this.resourceUrl}/${this.getCnssRateIdentifier(cnssRate)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(cnssRate: PartialUpdateCnssRate): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(cnssRate);
    return this.http
      .patch<RestCnssRate>(`${this.resourceUrl}/${this.getCnssRateIdentifier(cnssRate)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestCnssRate>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestCnssRate[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
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

  protected convertDateFromClient<T extends ICnssRate | NewCnssRate | PartialUpdateCnssRate>(cnssRate: T): RestOf<T> {
    return {
      ...cnssRate,
      effectiveFrom: cnssRate.effectiveFrom?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restCnssRate: RestCnssRate): ICnssRate {
    return {
      ...restCnssRate,
      effectiveFrom: restCnssRate.effectiveFrom ? dayjs(restCnssRate.effectiveFrom) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestCnssRate>): HttpResponse<ICnssRate> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestCnssRate[]>): HttpResponse<ICnssRate[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
