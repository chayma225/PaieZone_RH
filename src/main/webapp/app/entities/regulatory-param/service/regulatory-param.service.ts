
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import dayjs from 'dayjs/esm';
import { DATE_FORMAT } from 'app/config/input.constants';
import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IRegulatoryParam, NewRegulatoryParam, PartialUpdateRegulatoryParam } from '../regulatory-param.model';

type RestOf<T extends IRegulatoryParam | NewRegulatoryParam> = Omit<T, 'effectiveFrom' | 'effectiveTo' | 'updatedAt'> & {
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  updatedAt?: string | null;
};

export type RestRegulatoryParam    = RestOf<IRegulatoryParam>;
export type NewRestRegulatoryParam = RestOf<NewRegulatoryParam>;
export type EntityResponseType      = HttpResponse<IRegulatoryParam>;
export type EntityArrayResponseType = HttpResponse<IRegulatoryParam[]>;

@Injectable({ providedIn: 'root' })
export class RegulatoryParamService {
  protected readonly http      = inject(HttpClient);
  protected readonly appConfig = inject(ApplicationConfigService);
  protected resourceUrl        = this.appConfig.getEndpointFor('api/regulatory-params');

  // ── CRUD ──────────────────────────────────────────────────────────

  create(p: NewRegulatoryParam): Observable<EntityResponseType> {
    return this.http
      .post<RestRegulatoryParam>(this.resourceUrl, this.convertDateFromClient(p), { observe: 'response' })
      .pipe(map(r => this.convertResponseFromServer(r)));
  }

  update(p: IRegulatoryParam): Observable<EntityResponseType> {
    return this.http
      .put<RestRegulatoryParam>(`${this.resourceUrl}/${p.id}`, this.convertDateFromClient(p), { observe: 'response' })
      .pipe(map(r => this.convertResponseFromServer(r)));
  }

  partialUpdate(p: PartialUpdateRegulatoryParam): Observable<EntityResponseType> {
    return this.http
      .patch<RestRegulatoryParam>(`${this.resourceUrl}/${p.id}`, this.convertDateFromClient(p), { observe: 'response' })
      .pipe(map(r => this.convertResponseFromServer(r)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestRegulatoryParam>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(r => this.convertResponseFromServer(r)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestRegulatoryParam[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(r => this.convertResponseArrayFromServer(r)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  // ── Helpers JHipster standard ─────────────────────────────────────

  getRegulatoryParamIdentifier(p: Pick<IRegulatoryParam, 'id'>): number {
    return p.id;
  }

  compareRegulatoryParam(
    o1: Pick<IRegulatoryParam, 'id'> | null,
    o2: Pick<IRegulatoryParam, 'id'> | null,
  ): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  addRegulatoryParamToCollectionIfMissing<T extends Pick<IRegulatoryParam, 'id'>>(
    collection: T[],
    ...toCheck: (T | null | undefined)[]
  ): T[] {
    const items = toCheck.filter(isPresent) as T[];
    if (items.length === 0) return collection;
    const ids = new Set(collection.map(i => this.getRegulatoryParamIdentifier(i)));
    const toAdd = items.filter(i => !ids.has(this.getRegulatoryParamIdentifier(i)));
    return [...toAdd, ...collection];
  }

  // ── Conversions dates ─────────────────────────────────────────────

  // ✅ APRÈS
  protected convertDateFromClient<T extends IRegulatoryParam | NewRegulatoryParam | PartialUpdateRegulatoryParam>(
    p: T,
  ): RestOf<T> {
    const toDateString = (val: any): string | null => {
      if (!val) return null;
      if (typeof val === 'string') return val;          // déjà une string "YYYY-MM-DD"
      if (typeof val?.format === 'function') return val.format(DATE_FORMAT); // objet dayjs
      return null;
    };

    const toIsoString = (val: any): string | null => {
      if (!val) return null;
      if (typeof val === 'string') return val;
      if (typeof val?.toJSON === 'function') return val.toJSON();
      return null;
    };

    return {
      ...p,
      effectiveFrom: toDateString(p.effectiveFrom),
      effectiveTo:   toDateString(p.effectiveTo),
      updatedAt:     toIsoString(p.updatedAt),
    };
  }

  protected convertDateFromServer(r: RestRegulatoryParam): IRegulatoryParam {
    return {
      ...r,
      effectiveFrom: r.effectiveFrom ? dayjs(r.effectiveFrom) : undefined,
      effectiveTo:   r.effectiveTo   ? dayjs(r.effectiveTo)   : undefined,
      updatedAt:     r.updatedAt     ? dayjs(r.updatedAt)     : undefined,
    };
  }

  protected convertResponseFromServer(r: HttpResponse<RestRegulatoryParam>): HttpResponse<IRegulatoryParam> {
    return r.clone({ body: r.body ? this.convertDateFromServer(r.body) : null });
  }

  protected convertResponseArrayFromServer(r: HttpResponse<RestRegulatoryParam[]>): HttpResponse<IRegulatoryParam[]> {
    return r.clone({ body: r.body ? r.body.map(i => this.convertDateFromServer(i)) : null });
  }
}

