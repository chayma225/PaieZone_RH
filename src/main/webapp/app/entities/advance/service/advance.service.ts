import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IAdvance, NewAdvance } from '../advance.model';

export type PartialUpdateAdvance = Partial<IAdvance> & Pick<IAdvance, 'id'>;

type RestOf<T extends IAdvance | NewAdvance> = Omit<T, 'requestDate'> & {
  requestDate?: string | null;
};

export type RestAdvance = RestOf<IAdvance>;

export type NewRestAdvance = RestOf<NewAdvance>;

export type PartialUpdateRestAdvance = RestOf<PartialUpdateAdvance>;

export type EntityResponseType = HttpResponse<IAdvance>;
export type EntityArrayResponseType = HttpResponse<IAdvance[]>;

@Injectable({ providedIn: 'root' })
export class AdvanceService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/advances');

  create(advance: NewAdvance): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(advance);
    return this.http
      .post<RestAdvance>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(advance: IAdvance): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(advance);
    return this.http
      .put<RestAdvance>(`${this.resourceUrl}/${this.getAdvanceIdentifier(advance)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(advance: PartialUpdateAdvance): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(advance);
    return this.http
      .patch<RestAdvance>(`${this.resourceUrl}/${this.getAdvanceIdentifier(advance)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestAdvance>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestAdvance[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getAdvanceIdentifier(advance: Pick<IAdvance, 'id'>): number {
    return advance.id;
  }

  compareAdvance(o1: Pick<IAdvance, 'id'> | null, o2: Pick<IAdvance, 'id'> | null): boolean {
    return o1 && o2 ? this.getAdvanceIdentifier(o1) === this.getAdvanceIdentifier(o2) : o1 === o2;
  }

  addAdvanceToCollectionIfMissing<Type extends Pick<IAdvance, 'id'>>(
    advanceCollection: Type[],
    ...advancesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const advances: Type[] = advancesToCheck.filter(isPresent);
    if (advances.length > 0) {
      const advanceCollectionIdentifiers = advanceCollection.map(advanceItem => this.getAdvanceIdentifier(advanceItem));
      const advancesToAdd = advances.filter(advanceItem => {
        const advanceIdentifier = this.getAdvanceIdentifier(advanceItem);
        if (advanceCollectionIdentifiers.includes(advanceIdentifier)) {
          return false;
        }
        advanceCollectionIdentifiers.push(advanceIdentifier);
        return true;
      });
      return [...advancesToAdd, ...advanceCollection];
    }
    return advanceCollection;
  }

  protected convertDateFromClient<T extends IAdvance | NewAdvance | PartialUpdateAdvance>(advance: T): RestOf<T> {
    return {
      ...advance,
      requestDate: advance.requestDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restAdvance: RestAdvance): IAdvance {
    return {
      ...restAdvance,
      requestDate: restAdvance.requestDate ? dayjs(restAdvance.requestDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestAdvance>): HttpResponse<IAdvance> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestAdvance[]>): HttpResponse<IAdvance[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
