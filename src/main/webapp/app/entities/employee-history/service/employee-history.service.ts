import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IEmployeeHistory, NewEmployeeHistory } from '../employee-history.model';

export type PartialUpdateEmployeeHistory = Partial<IEmployeeHistory> & Pick<IEmployeeHistory, 'id'>;

type RestOf<T extends IEmployeeHistory | NewEmployeeHistory> = Omit<T, 'changedAt'> & {
  changedAt?: string | null;
};

export type RestEmployeeHistory = RestOf<IEmployeeHistory>;

export type NewRestEmployeeHistory = RestOf<NewEmployeeHistory>;

export type PartialUpdateRestEmployeeHistory = RestOf<PartialUpdateEmployeeHistory>;

@Injectable()
export class EmployeeHistoriesService {
  readonly employeeHistoriesParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly employeeHistoriesResource = httpResource<RestEmployeeHistory[]>(() => {
    const params = this.employeeHistoriesParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of employeeHistory that have been fetched. It is updated when the employeeHistoriesResource emits a new value.
   * In case of error while fetching the employeeHistories, the signal is set to an empty array.
   */
  readonly employeeHistories = computed(() =>
    (this.employeeHistoriesResource.hasValue() ? this.employeeHistoriesResource.value() : []).map(item =>
      this.convertValueFromServer(item),
    ),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/employee-histories');

  protected convertValueFromServer(restEmployeeHistory: RestEmployeeHistory): IEmployeeHistory {
    return {
      ...restEmployeeHistory,
      changedAt: restEmployeeHistory.changedAt ? dayjs(restEmployeeHistory.changedAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class EmployeeHistoryService extends EmployeeHistoriesService {
  protected readonly http = inject(HttpClient);

  create(employeeHistory: NewEmployeeHistory): Observable<IEmployeeHistory> {
    const copy = this.convertValueFromClient(employeeHistory);
    return this.http.post<RestEmployeeHistory>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(employeeHistory: IEmployeeHistory): Observable<IEmployeeHistory> {
    const copy = this.convertValueFromClient(employeeHistory);
    return this.http
      .put<RestEmployeeHistory>(`${this.resourceUrl}/${encodeURIComponent(this.getEmployeeHistoryIdentifier(employeeHistory))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(employeeHistory: PartialUpdateEmployeeHistory): Observable<IEmployeeHistory> {
    const copy = this.convertValueFromClient(employeeHistory);
    return this.http
      .patch<RestEmployeeHistory>(`${this.resourceUrl}/${encodeURIComponent(this.getEmployeeHistoryIdentifier(employeeHistory))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IEmployeeHistory> {
    return this.http
      .get<RestEmployeeHistory>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IEmployeeHistory[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestEmployeeHistory[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getEmployeeHistoryIdentifier(employeeHistory: Pick<IEmployeeHistory, 'id'>): number {
    return employeeHistory.id;
  }

  compareEmployeeHistory(o1: Pick<IEmployeeHistory, 'id'> | null, o2: Pick<IEmployeeHistory, 'id'> | null): boolean {
    return o1 && o2 ? this.getEmployeeHistoryIdentifier(o1) === this.getEmployeeHistoryIdentifier(o2) : o1 === o2;
  }

  addEmployeeHistoryToCollectionIfMissing<Type extends Pick<IEmployeeHistory, 'id'>>(
    employeeHistoryCollection: Type[],
    ...employeeHistoriesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const employeeHistories: Type[] = employeeHistoriesToCheck.filter(isPresent);
    if (employeeHistories.length > 0) {
      const employeeHistoryCollectionIdentifiers = employeeHistoryCollection.map(employeeHistoryItem =>
        this.getEmployeeHistoryIdentifier(employeeHistoryItem),
      );
      const employeeHistoriesToAdd = employeeHistories.filter(employeeHistoryItem => {
        const employeeHistoryIdentifier = this.getEmployeeHistoryIdentifier(employeeHistoryItem);
        if (employeeHistoryCollectionIdentifiers.includes(employeeHistoryIdentifier)) {
          return false;
        }
        employeeHistoryCollectionIdentifiers.push(employeeHistoryIdentifier);
        return true;
      });
      return [...employeeHistoriesToAdd, ...employeeHistoryCollection];
    }
    return employeeHistoryCollection;
  }

  protected convertValueFromClient<T extends IEmployeeHistory | NewEmployeeHistory | PartialUpdateEmployeeHistory>(
    employeeHistory: T,
  ): RestOf<T> {
    return {
      ...employeeHistory,
      changedAt: employeeHistory.changedAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestEmployeeHistory): IEmployeeHistory {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestEmployeeHistory[]): IEmployeeHistory[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
