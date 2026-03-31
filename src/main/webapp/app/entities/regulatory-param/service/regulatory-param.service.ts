import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IRegulatoryParam, NewRegulatoryParam } from '../regulatory-param.model';

export type PartialUpdateRegulatoryParam = Partial<IRegulatoryParam> & Pick<IRegulatoryParam, 'id'>;

type RestOf<T extends IRegulatoryParam | NewRegulatoryParam> = Omit<T, 'effectiveFrom' | 'effectiveTo'> & {
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
};

export type RestRegulatoryParam = RestOf<IRegulatoryParam>;

export type NewRestRegulatoryParam = RestOf<NewRegulatoryParam>;

export type PartialUpdateRestRegulatoryParam = RestOf<PartialUpdateRegulatoryParam>;

export type EntityResponseType = HttpResponse<IRegulatoryParam>;
export type EntityArrayResponseType = HttpResponse<IRegulatoryParam[]>;

@Injectable({ providedIn: 'root' })
export class RegulatoryParamService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/regulatory-params');

  create(regulatoryParam: NewRegulatoryParam): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(regulatoryParam);
    return this.http
      .post<RestRegulatoryParam>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(regulatoryParam: IRegulatoryParam): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(regulatoryParam);
    return this.http
      .put<RestRegulatoryParam>(`${this.resourceUrl}/${this.getRegulatoryParamIdentifier(regulatoryParam)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(regulatoryParam: PartialUpdateRegulatoryParam): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(regulatoryParam);
    return this.http
      .patch<RestRegulatoryParam>(`${this.resourceUrl}/${this.getRegulatoryParamIdentifier(regulatoryParam)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestRegulatoryParam>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestRegulatoryParam[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getRegulatoryParamIdentifier(regulatoryParam: Pick<IRegulatoryParam, 'id'>): number {
    return regulatoryParam.id;
  }

  compareRegulatoryParam(o1: Pick<IRegulatoryParam, 'id'> | null, o2: Pick<IRegulatoryParam, 'id'> | null): boolean {
    return o1 && o2 ? this.getRegulatoryParamIdentifier(o1) === this.getRegulatoryParamIdentifier(o2) : o1 === o2;
  }

  addRegulatoryParamToCollectionIfMissing<Type extends Pick<IRegulatoryParam, 'id'>>(
    regulatoryParamCollection: Type[],
    ...regulatoryParamsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const regulatoryParams: Type[] = regulatoryParamsToCheck.filter(isPresent);
    if (regulatoryParams.length > 0) {
      const regulatoryParamCollectionIdentifiers = regulatoryParamCollection.map(regulatoryParamItem =>
        this.getRegulatoryParamIdentifier(regulatoryParamItem),
      );
      const regulatoryParamsToAdd = regulatoryParams.filter(regulatoryParamItem => {
        const regulatoryParamIdentifier = this.getRegulatoryParamIdentifier(regulatoryParamItem);
        if (regulatoryParamCollectionIdentifiers.includes(regulatoryParamIdentifier)) {
          return false;
        }
        regulatoryParamCollectionIdentifiers.push(regulatoryParamIdentifier);
        return true;
      });
      return [...regulatoryParamsToAdd, ...regulatoryParamCollection];
    }
    return regulatoryParamCollection;
  }

  protected convertDateFromClient<T extends IRegulatoryParam | NewRegulatoryParam | PartialUpdateRegulatoryParam>(
    regulatoryParam: T,
  ): RestOf<T> {
    return {
      ...regulatoryParam,
      effectiveFrom: regulatoryParam.effectiveFrom?.format(DATE_FORMAT) ?? null,
      effectiveTo: regulatoryParam.effectiveTo?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restRegulatoryParam: RestRegulatoryParam): IRegulatoryParam {
    return {
      ...restRegulatoryParam,
      effectiveFrom: restRegulatoryParam.effectiveFrom ? dayjs(restRegulatoryParam.effectiveFrom) : undefined,
      effectiveTo: restRegulatoryParam.effectiveTo ? dayjs(restRegulatoryParam.effectiveTo) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestRegulatoryParam>): HttpResponse<IRegulatoryParam> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestRegulatoryParam[]>): HttpResponse<IRegulatoryParam[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
