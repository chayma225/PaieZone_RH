import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IRegulatoryParam, NewRegulatoryParam } from '../regulatory-param.model';

export type PartialUpdateRegulatoryParam = Partial<IRegulatoryParam> & Pick<IRegulatoryParam, 'id'>;

type RestOf<T extends IRegulatoryParam | NewRegulatoryParam> = Omit<T, 'effectiveFrom' | 'effectiveTo'> & {
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
};

export type RestRegulatoryParam = RestOf<IRegulatoryParam>;

export type NewRestRegulatoryParam = RestOf<NewRegulatoryParam>;

export type PartialUpdateRestRegulatoryParam = RestOf<PartialUpdateRegulatoryParam>;

@Injectable()
export class RegulatoryParamsService {
  readonly regulatoryParamsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly regulatoryParamsResource = httpResource<RestRegulatoryParam[]>(() => {
    const params = this.regulatoryParamsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of regulatoryParam that have been fetched. It is updated when the regulatoryParamsResource emits a new value.
   * In case of error while fetching the regulatoryParams, the signal is set to an empty array.
   */
  readonly regulatoryParams = computed(() =>
    (this.regulatoryParamsResource.hasValue() ? this.regulatoryParamsResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/regulatory-params');

  protected convertValueFromServer(restRegulatoryParam: RestRegulatoryParam): IRegulatoryParam {
    return {
      ...restRegulatoryParam,
      effectiveFrom: restRegulatoryParam.effectiveFrom ? dayjs(restRegulatoryParam.effectiveFrom) : undefined,
      effectiveTo: restRegulatoryParam.effectiveTo ? dayjs(restRegulatoryParam.effectiveTo) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class RegulatoryParamService extends RegulatoryParamsService {
  protected readonly http = inject(HttpClient);

  create(regulatoryParam: NewRegulatoryParam): Observable<IRegulatoryParam> {
    const copy = this.convertValueFromClient(regulatoryParam);
    return this.http.post<RestRegulatoryParam>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(regulatoryParam: IRegulatoryParam): Observable<IRegulatoryParam> {
    const copy = this.convertValueFromClient(regulatoryParam);
    return this.http
      .put<RestRegulatoryParam>(`${this.resourceUrl}/${encodeURIComponent(this.getRegulatoryParamIdentifier(regulatoryParam))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(regulatoryParam: PartialUpdateRegulatoryParam): Observable<IRegulatoryParam> {
    const copy = this.convertValueFromClient(regulatoryParam);
    return this.http
      .patch<RestRegulatoryParam>(`${this.resourceUrl}/${encodeURIComponent(this.getRegulatoryParamIdentifier(regulatoryParam))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IRegulatoryParam> {
    return this.http
      .get<RestRegulatoryParam>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IRegulatoryParam[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestRegulatoryParam[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
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

  protected convertValueFromClient<T extends IRegulatoryParam | NewRegulatoryParam | PartialUpdateRegulatoryParam>(
    regulatoryParam: T,
  ): RestOf<T> {
    return {
      ...regulatoryParam,
      effectiveFrom: regulatoryParam.effectiveFrom?.format(DATE_FORMAT) ?? null,
      effectiveTo: regulatoryParam.effectiveTo?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertResponseFromServer(res: RestRegulatoryParam): IRegulatoryParam {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestRegulatoryParam[]): IRegulatoryParam[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
