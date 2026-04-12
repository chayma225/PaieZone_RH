import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IAccountingEntry, NewAccountingEntry } from '../accounting-entry.model';

export type PartialUpdateAccountingEntry = Partial<IAccountingEntry> & Pick<IAccountingEntry, 'id'>;

type RestOf<T extends IAccountingEntry | NewAccountingEntry> = Omit<T, 'entryDate' | 'exportedAt'> & {
  entryDate?: string | null;
  exportedAt?: string | null;
};

export type RestAccountingEntry = RestOf<IAccountingEntry>;

export type NewRestAccountingEntry = RestOf<NewAccountingEntry>;

export type PartialUpdateRestAccountingEntry = RestOf<PartialUpdateAccountingEntry>;

@Injectable()
export class AccountingEntriesService {
  readonly accountingEntriesParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly accountingEntriesResource = httpResource<RestAccountingEntry[]>(() => {
    const params = this.accountingEntriesParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of accountingEntry that have been fetched. It is updated when the accountingEntriesResource emits a new value.
   * In case of error while fetching the accountingEntries, the signal is set to an empty array.
   */
  readonly accountingEntries = computed(() =>
    (this.accountingEntriesResource.hasValue() ? this.accountingEntriesResource.value() : []).map(item =>
      this.convertValueFromServer(item),
    ),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/accounting-entries');

  protected convertValueFromServer(restAccountingEntry: RestAccountingEntry): IAccountingEntry {
    return {
      ...restAccountingEntry,
      entryDate: restAccountingEntry.entryDate ? dayjs(restAccountingEntry.entryDate) : undefined,
      exportedAt: restAccountingEntry.exportedAt ? dayjs(restAccountingEntry.exportedAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class AccountingEntryService extends AccountingEntriesService {
  protected readonly http = inject(HttpClient);

  create(accountingEntry: NewAccountingEntry): Observable<IAccountingEntry> {
    const copy = this.convertValueFromClient(accountingEntry);
    return this.http.post<RestAccountingEntry>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(accountingEntry: IAccountingEntry): Observable<IAccountingEntry> {
    const copy = this.convertValueFromClient(accountingEntry);
    return this.http
      .put<RestAccountingEntry>(`${this.resourceUrl}/${encodeURIComponent(this.getAccountingEntryIdentifier(accountingEntry))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(accountingEntry: PartialUpdateAccountingEntry): Observable<IAccountingEntry> {
    const copy = this.convertValueFromClient(accountingEntry);
    return this.http
      .patch<RestAccountingEntry>(`${this.resourceUrl}/${encodeURIComponent(this.getAccountingEntryIdentifier(accountingEntry))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IAccountingEntry> {
    return this.http
      .get<RestAccountingEntry>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IAccountingEntry[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestAccountingEntry[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getAccountingEntryIdentifier(accountingEntry: Pick<IAccountingEntry, 'id'>): number {
    return accountingEntry.id;
  }

  compareAccountingEntry(o1: Pick<IAccountingEntry, 'id'> | null, o2: Pick<IAccountingEntry, 'id'> | null): boolean {
    return o1 && o2 ? this.getAccountingEntryIdentifier(o1) === this.getAccountingEntryIdentifier(o2) : o1 === o2;
  }

  addAccountingEntryToCollectionIfMissing<Type extends Pick<IAccountingEntry, 'id'>>(
    accountingEntryCollection: Type[],
    ...accountingEntriesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const accountingEntries: Type[] = accountingEntriesToCheck.filter(isPresent);
    if (accountingEntries.length > 0) {
      const accountingEntryCollectionIdentifiers = accountingEntryCollection.map(accountingEntryItem =>
        this.getAccountingEntryIdentifier(accountingEntryItem),
      );
      const accountingEntriesToAdd = accountingEntries.filter(accountingEntryItem => {
        const accountingEntryIdentifier = this.getAccountingEntryIdentifier(accountingEntryItem);
        if (accountingEntryCollectionIdentifiers.includes(accountingEntryIdentifier)) {
          return false;
        }
        accountingEntryCollectionIdentifiers.push(accountingEntryIdentifier);
        return true;
      });
      return [...accountingEntriesToAdd, ...accountingEntryCollection];
    }
    return accountingEntryCollection;
  }

  protected convertValueFromClient<T extends IAccountingEntry | NewAccountingEntry | PartialUpdateAccountingEntry>(
    accountingEntry: T,
  ): RestOf<T> {
    return {
      ...accountingEntry,
      entryDate: accountingEntry.entryDate?.format(DATE_FORMAT) ?? null,
      exportedAt: accountingEntry.exportedAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestAccountingEntry): IAccountingEntry {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestAccountingEntry[]): IAccountingEntry[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
