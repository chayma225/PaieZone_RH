import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IAccountingEntry, NewAccountingEntry } from '../accounting-entry.model';

export type PartialUpdateAccountingEntry = Partial<IAccountingEntry> & Pick<IAccountingEntry, 'id'>;

type RestOf<T extends IAccountingEntry | NewAccountingEntry> = Omit<T, 'entryDate' | 'exportedAt'> & {
  entryDate?: string | null;
  exportedAt?: string | null;
};

export type RestAccountingEntry = RestOf<IAccountingEntry>;

export type NewRestAccountingEntry = RestOf<NewAccountingEntry>;

export type PartialUpdateRestAccountingEntry = RestOf<PartialUpdateAccountingEntry>;

export type EntityResponseType = HttpResponse<IAccountingEntry>;
export type EntityArrayResponseType = HttpResponse<IAccountingEntry[]>;

@Injectable({ providedIn: 'root' })
export class AccountingEntryService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/accounting-entries');

  create(accountingEntry: NewAccountingEntry): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(accountingEntry);
    return this.http
      .post<RestAccountingEntry>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(accountingEntry: IAccountingEntry): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(accountingEntry);
    return this.http
      .put<RestAccountingEntry>(`${this.resourceUrl}/${this.getAccountingEntryIdentifier(accountingEntry)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(accountingEntry: PartialUpdateAccountingEntry): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(accountingEntry);
    return this.http
      .patch<RestAccountingEntry>(`${this.resourceUrl}/${this.getAccountingEntryIdentifier(accountingEntry)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestAccountingEntry>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestAccountingEntry[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
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

  protected convertDateFromClient<T extends IAccountingEntry | NewAccountingEntry | PartialUpdateAccountingEntry>(
    accountingEntry: T,
  ): RestOf<T> {
    return {
      ...accountingEntry,
      entryDate: accountingEntry.entryDate?.format(DATE_FORMAT) ?? null,
      exportedAt: accountingEntry.exportedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restAccountingEntry: RestAccountingEntry): IAccountingEntry {
    return {
      ...restAccountingEntry,
      entryDate: restAccountingEntry.entryDate ? dayjs(restAccountingEntry.entryDate) : undefined,
      exportedAt: restAccountingEntry.exportedAt ? dayjs(restAccountingEntry.exportedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestAccountingEntry>): HttpResponse<IAccountingEntry> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestAccountingEntry[]>): HttpResponse<IAccountingEntry[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
