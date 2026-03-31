import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPublicHoliday, NewPublicHoliday } from '../public-holiday.model';

export type PartialUpdatePublicHoliday = Partial<IPublicHoliday> & Pick<IPublicHoliday, 'id'>;

type RestOf<T extends IPublicHoliday | NewPublicHoliday> = Omit<T, 'holidayDate'> & {
  holidayDate?: string | null;
};

export type RestPublicHoliday = RestOf<IPublicHoliday>;

export type NewRestPublicHoliday = RestOf<NewPublicHoliday>;

export type PartialUpdateRestPublicHoliday = RestOf<PartialUpdatePublicHoliday>;

export type EntityResponseType = HttpResponse<IPublicHoliday>;
export type EntityArrayResponseType = HttpResponse<IPublicHoliday[]>;

@Injectable({ providedIn: 'root' })
export class PublicHolidayService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/public-holidays');

  create(publicHoliday: NewPublicHoliday): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(publicHoliday);
    return this.http
      .post<RestPublicHoliday>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(publicHoliday: IPublicHoliday): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(publicHoliday);
    return this.http
      .put<RestPublicHoliday>(`${this.resourceUrl}/${this.getPublicHolidayIdentifier(publicHoliday)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(publicHoliday: PartialUpdatePublicHoliday): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(publicHoliday);
    return this.http
      .patch<RestPublicHoliday>(`${this.resourceUrl}/${this.getPublicHolidayIdentifier(publicHoliday)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestPublicHoliday>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPublicHoliday[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
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

  protected convertDateFromClient<T extends IPublicHoliday | NewPublicHoliday | PartialUpdatePublicHoliday>(publicHoliday: T): RestOf<T> {
    return {
      ...publicHoliday,
      holidayDate: publicHoliday.holidayDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restPublicHoliday: RestPublicHoliday): IPublicHoliday {
    return {
      ...restPublicHoliday,
      holidayDate: restPublicHoliday.holidayDate ? dayjs(restPublicHoliday.holidayDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestPublicHoliday>): HttpResponse<IPublicHoliday> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestPublicHoliday[]>): HttpResponse<IPublicHoliday[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
