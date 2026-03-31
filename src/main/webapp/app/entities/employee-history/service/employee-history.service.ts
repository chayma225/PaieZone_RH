import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IEmployeeHistory, NewEmployeeHistory } from '../employee-history.model';

export type PartialUpdateEmployeeHistory = Partial<IEmployeeHistory> & Pick<IEmployeeHistory, 'id'>;

type RestOf<T extends IEmployeeHistory | NewEmployeeHistory> = Omit<T, 'changedAt'> & {
  changedAt?: string | null;
};

export type RestEmployeeHistory = RestOf<IEmployeeHistory>;

export type NewRestEmployeeHistory = RestOf<NewEmployeeHistory>;

export type PartialUpdateRestEmployeeHistory = RestOf<PartialUpdateEmployeeHistory>;

export type EntityResponseType = HttpResponse<IEmployeeHistory>;
export type EntityArrayResponseType = HttpResponse<IEmployeeHistory[]>;

@Injectable({ providedIn: 'root' })
export class EmployeeHistoryService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/employee-histories');

  create(employeeHistory: NewEmployeeHistory): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(employeeHistory);
    return this.http
      .post<RestEmployeeHistory>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(employeeHistory: IEmployeeHistory): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(employeeHistory);
    return this.http
      .put<RestEmployeeHistory>(`${this.resourceUrl}/${this.getEmployeeHistoryIdentifier(employeeHistory)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(employeeHistory: PartialUpdateEmployeeHistory): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(employeeHistory);
    return this.http
      .patch<RestEmployeeHistory>(`${this.resourceUrl}/${this.getEmployeeHistoryIdentifier(employeeHistory)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestEmployeeHistory>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestEmployeeHistory[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
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

  protected convertDateFromClient<T extends IEmployeeHistory | NewEmployeeHistory | PartialUpdateEmployeeHistory>(
    employeeHistory: T,
  ): RestOf<T> {
    return {
      ...employeeHistory,
      changedAt: employeeHistory.changedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restEmployeeHistory: RestEmployeeHistory): IEmployeeHistory {
    return {
      ...restEmployeeHistory,
      changedAt: restEmployeeHistory.changedAt ? dayjs(restEmployeeHistory.changedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestEmployeeHistory>): HttpResponse<IEmployeeHistory> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestEmployeeHistory[]>): HttpResponse<IEmployeeHistory[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
