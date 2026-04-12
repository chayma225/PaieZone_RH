import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IAdvance, NewAdvance } from '../advance.model';

export type PartialUpdateAdvance = Partial<IAdvance> & Pick<IAdvance, 'id'>;

type RestOf<T extends IAdvance | NewAdvance> = Omit<T, 'requestDate'> & {
  requestDate?: string | null;
};

export type RestAdvance = RestOf<IAdvance>;

export type NewRestAdvance = RestOf<NewAdvance>;

export type PartialUpdateRestAdvance = RestOf<PartialUpdateAdvance>;

@Injectable()
export class AdvancesService {
  readonly advancesParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly advancesResource = httpResource<RestAdvance[]>(() => {
    const params = this.advancesParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of advance that have been fetched. It is updated when the advancesResource emits a new value.
   * In case of error while fetching the advances, the signal is set to an empty array.
   */
  readonly advances = computed(() =>
    (this.advancesResource.hasValue() ? this.advancesResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/advances');

  protected convertValueFromServer(restAdvance: RestAdvance): IAdvance {
    return {
      ...restAdvance,
      requestDate: restAdvance.requestDate ? dayjs(restAdvance.requestDate) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class AdvanceService extends AdvancesService {
  protected readonly http = inject(HttpClient);

  create(advance: NewAdvance): Observable<IAdvance> {
    const copy = this.convertValueFromClient(advance);
    return this.http.post<RestAdvance>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(advance: IAdvance): Observable<IAdvance> {
    const copy = this.convertValueFromClient(advance);
    return this.http
      .put<RestAdvance>(`${this.resourceUrl}/${encodeURIComponent(this.getAdvanceIdentifier(advance))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(advance: PartialUpdateAdvance): Observable<IAdvance> {
    const copy = this.convertValueFromClient(advance);
    return this.http
      .patch<RestAdvance>(`${this.resourceUrl}/${encodeURIComponent(this.getAdvanceIdentifier(advance))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IAdvance> {
    return this.http
      .get<RestAdvance>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IAdvance[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestAdvance[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
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

  protected convertValueFromClient<T extends IAdvance | NewAdvance | PartialUpdateAdvance>(advance: T): RestOf<T> {
    return {
      ...advance,
      requestDate: advance.requestDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertResponseFromServer(res: RestAdvance): IAdvance {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestAdvance[]): IAdvance[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
