import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IPublicHoliday, NewPublicHoliday } from '../public-holiday.model';

export type PartialUpdatePublicHoliday = Partial<IPublicHoliday> & Pick<IPublicHoliday, 'id'>;

type RestOf<T extends IPublicHoliday | NewPublicHoliday> = Omit<T, 'holidayDate'> & {
  holidayDate?: string | null;
};

export type RestPublicHoliday = RestOf<IPublicHoliday>;

export type NewRestPublicHoliday = RestOf<NewPublicHoliday>;

export type PartialUpdateRestPublicHoliday = RestOf<PartialUpdatePublicHoliday>;

@Injectable()
export class PublicHolidaysService {
  readonly publicHolidaysParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly publicHolidaysResource = httpResource<RestPublicHoliday[]>(() => {
    const params = this.publicHolidaysParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of publicHoliday that have been fetched. It is updated when the publicHolidaysResource emits a new value.
   * In case of error while fetching the publicHolidays, the signal is set to an empty array.
   */
  readonly publicHolidays = computed(() =>
    (this.publicHolidaysResource.hasValue() ? this.publicHolidaysResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/public-holidays');

  protected convertValueFromServer(restPublicHoliday: RestPublicHoliday): IPublicHoliday {
    return {
      ...restPublicHoliday,
      holidayDate: restPublicHoliday.holidayDate ? dayjs(restPublicHoliday.holidayDate) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class PublicHolidayService extends PublicHolidaysService {
  protected readonly http = inject(HttpClient);

  create(publicHoliday: NewPublicHoliday): Observable<IPublicHoliday> {
    const copy = this.convertValueFromClient(publicHoliday);
    return this.http.post<RestPublicHoliday>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(publicHoliday: IPublicHoliday): Observable<IPublicHoliday> {
    const copy = this.convertValueFromClient(publicHoliday);
    return this.http
      .put<RestPublicHoliday>(`${this.resourceUrl}/${encodeURIComponent(this.getPublicHolidayIdentifier(publicHoliday))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(publicHoliday: PartialUpdatePublicHoliday): Observable<IPublicHoliday> {
    const copy = this.convertValueFromClient(publicHoliday);
    return this.http
      .patch<RestPublicHoliday>(`${this.resourceUrl}/${encodeURIComponent(this.getPublicHolidayIdentifier(publicHoliday))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IPublicHoliday> {
    return this.http
      .get<RestPublicHoliday>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IPublicHoliday[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPublicHoliday[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getPublicHolidayIdentifier(publicHoliday: Pick<IPublicHoliday, 'id'>): number {
    return publicHoliday.id;
  }

  comparePublicHoliday(o1: Pick<IPublicHoliday, 'id'> | null, o2: Pick<IPublicHoliday, 'id'> | null): boolean {
    return o1 && o2 ? this.getPublicHolidayIdentifier(o1) === this.getPublicHolidayIdentifier(o2) : o1 === o2;
  }

  addPublicHolidayToCollectionIfMissing<Type extends Pick<IPublicHoliday, 'id'>>(
    publicHolidayCollection: Type[],
    ...publicHolidaysToCheck: (Type | null | undefined)[]
  ): Type[] {
    const publicHolidays: Type[] = publicHolidaysToCheck.filter(isPresent);
    if (publicHolidays.length > 0) {
      const publicHolidayCollectionIdentifiers = publicHolidayCollection.map(publicHolidayItem =>
        this.getPublicHolidayIdentifier(publicHolidayItem),
      );
      const publicHolidaysToAdd = publicHolidays.filter(publicHolidayItem => {
        const publicHolidayIdentifier = this.getPublicHolidayIdentifier(publicHolidayItem);
        if (publicHolidayCollectionIdentifiers.includes(publicHolidayIdentifier)) {
          return false;
        }
        publicHolidayCollectionIdentifiers.push(publicHolidayIdentifier);
        return true;
      });
      return [...publicHolidaysToAdd, ...publicHolidayCollection];
    }
    return publicHolidayCollection;
  }

  protected convertValueFromClient<T extends IPublicHoliday | NewPublicHoliday | PartialUpdatePublicHoliday>(publicHoliday: T): RestOf<T> {
    return {
      ...publicHoliday,
      holidayDate: publicHoliday.holidayDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertResponseFromServer(res: RestPublicHoliday): IPublicHoliday {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestPublicHoliday[]): IPublicHoliday[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
