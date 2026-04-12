import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { ITimeEntry, NewTimeEntry } from '../time-entry.model';

export type PartialUpdateTimeEntry = Partial<ITimeEntry> & Pick<ITimeEntry, 'id'>;

type RestOf<T extends ITimeEntry | NewTimeEntry> = Omit<T, 'entryDate' | 'checkIn' | 'checkOut' | 'validatedAt'> & {
  entryDate?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  validatedAt?: string | null;
};

export type RestTimeEntry = RestOf<ITimeEntry>;

export type NewRestTimeEntry = RestOf<NewTimeEntry>;

export type PartialUpdateRestTimeEntry = RestOf<PartialUpdateTimeEntry>;

@Injectable()
export class TimeEntriesService {
  readonly timeEntriesParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly timeEntriesResource = httpResource<RestTimeEntry[]>(() => {
    const params = this.timeEntriesParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of timeEntry that have been fetched. It is updated when the timeEntriesResource emits a new value.
   * In case of error while fetching the timeEntries, the signal is set to an empty array.
   */
  readonly timeEntries = computed(() =>
    (this.timeEntriesResource.hasValue() ? this.timeEntriesResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/time-entries');

  protected convertValueFromServer(restTimeEntry: RestTimeEntry): ITimeEntry {
    return {
      ...restTimeEntry,
      entryDate: restTimeEntry.entryDate ? dayjs(restTimeEntry.entryDate) : undefined,
      checkIn: restTimeEntry.checkIn ? dayjs(restTimeEntry.checkIn) : undefined,
      checkOut: restTimeEntry.checkOut ? dayjs(restTimeEntry.checkOut) : undefined,
      validatedAt: restTimeEntry.validatedAt ? dayjs(restTimeEntry.validatedAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class TimeEntryService extends TimeEntriesService {
  protected readonly http = inject(HttpClient);

  create(timeEntry: NewTimeEntry): Observable<ITimeEntry> {
    const copy = this.convertValueFromClient(timeEntry);
    return this.http.post<RestTimeEntry>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(timeEntry: ITimeEntry): Observable<ITimeEntry> {
    const copy = this.convertValueFromClient(timeEntry);
    return this.http
      .put<RestTimeEntry>(`${this.resourceUrl}/${encodeURIComponent(this.getTimeEntryIdentifier(timeEntry))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(timeEntry: PartialUpdateTimeEntry): Observable<ITimeEntry> {
    const copy = this.convertValueFromClient(timeEntry);
    return this.http
      .patch<RestTimeEntry>(`${this.resourceUrl}/${encodeURIComponent(this.getTimeEntryIdentifier(timeEntry))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<ITimeEntry> {
    return this.http
      .get<RestTimeEntry>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<ITimeEntry[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestTimeEntry[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getTimeEntryIdentifier(timeEntry: Pick<ITimeEntry, 'id'>): number {
    return timeEntry.id;
  }

  compareTimeEntry(o1: Pick<ITimeEntry, 'id'> | null, o2: Pick<ITimeEntry, 'id'> | null): boolean {
    return o1 && o2 ? this.getTimeEntryIdentifier(o1) === this.getTimeEntryIdentifier(o2) : o1 === o2;
  }

  addTimeEntryToCollectionIfMissing<Type extends Pick<ITimeEntry, 'id'>>(
    timeEntryCollection: Type[],
    ...timeEntriesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const timeEntries: Type[] = timeEntriesToCheck.filter(isPresent);
    if (timeEntries.length > 0) {
      const timeEntryCollectionIdentifiers = timeEntryCollection.map(timeEntryItem => this.getTimeEntryIdentifier(timeEntryItem));
      const timeEntriesToAdd = timeEntries.filter(timeEntryItem => {
        const timeEntryIdentifier = this.getTimeEntryIdentifier(timeEntryItem);
        if (timeEntryCollectionIdentifiers.includes(timeEntryIdentifier)) {
          return false;
        }
        timeEntryCollectionIdentifiers.push(timeEntryIdentifier);
        return true;
      });
      return [...timeEntriesToAdd, ...timeEntryCollection];
    }
    return timeEntryCollection;
  }

  protected convertValueFromClient<T extends ITimeEntry | NewTimeEntry | PartialUpdateTimeEntry>(timeEntry: T): RestOf<T> {
    return {
      ...timeEntry,
      entryDate: timeEntry.entryDate?.format(DATE_FORMAT) ?? null,
      checkIn: timeEntry.checkIn?.toJSON() ?? null,
      checkOut: timeEntry.checkOut?.toJSON() ?? null,
      validatedAt: timeEntry.validatedAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestTimeEntry): ITimeEntry {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestTimeEntry[]): ITimeEntry[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
