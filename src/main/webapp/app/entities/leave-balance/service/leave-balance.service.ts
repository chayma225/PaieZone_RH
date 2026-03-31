import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ILeaveBalance, NewLeaveBalance } from '../leave-balance.model';

export type PartialUpdateLeaveBalance = Partial<ILeaveBalance> & Pick<ILeaveBalance, 'id'>;

type RestOf<T extends ILeaveBalance | NewLeaveBalance> = Omit<T, 'lastUpdatedAt'> & {
  lastUpdatedAt?: string | null;
};

export type RestLeaveBalance = RestOf<ILeaveBalance>;

export type NewRestLeaveBalance = RestOf<NewLeaveBalance>;

export type PartialUpdateRestLeaveBalance = RestOf<PartialUpdateLeaveBalance>;

export type EntityResponseType = HttpResponse<ILeaveBalance>;
export type EntityArrayResponseType = HttpResponse<ILeaveBalance[]>;

@Injectable({ providedIn: 'root' })
export class LeaveBalanceService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/leave-balances');

  create(leaveBalance: NewLeaveBalance): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(leaveBalance);
    return this.http
      .post<RestLeaveBalance>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(leaveBalance: ILeaveBalance): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(leaveBalance);
    return this.http
      .put<RestLeaveBalance>(`${this.resourceUrl}/${this.getLeaveBalanceIdentifier(leaveBalance)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(leaveBalance: PartialUpdateLeaveBalance): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(leaveBalance);
    return this.http
      .patch<RestLeaveBalance>(`${this.resourceUrl}/${this.getLeaveBalanceIdentifier(leaveBalance)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestLeaveBalance>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestLeaveBalance[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getLeaveBalanceIdentifier(leaveBalance: Pick<ILeaveBalance, 'id'>): number {
    return leaveBalance.id;
  }

  compareLeaveBalance(o1: Pick<ILeaveBalance, 'id'> | null, o2: Pick<ILeaveBalance, 'id'> | null): boolean {
    return o1 && o2 ? this.getLeaveBalanceIdentifier(o1) === this.getLeaveBalanceIdentifier(o2) : o1 === o2;
  }

  addLeaveBalanceToCollectionIfMissing<Type extends Pick<ILeaveBalance, 'id'>>(
    leaveBalanceCollection: Type[],
    ...leaveBalancesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const leaveBalances: Type[] = leaveBalancesToCheck.filter(isPresent);
    if (leaveBalances.length > 0) {
      const leaveBalanceCollectionIdentifiers = leaveBalanceCollection.map(leaveBalanceItem =>
        this.getLeaveBalanceIdentifier(leaveBalanceItem),
      );
      const leaveBalancesToAdd = leaveBalances.filter(leaveBalanceItem => {
        const leaveBalanceIdentifier = this.getLeaveBalanceIdentifier(leaveBalanceItem);
        if (leaveBalanceCollectionIdentifiers.includes(leaveBalanceIdentifier)) {
          return false;
        }
        leaveBalanceCollectionIdentifiers.push(leaveBalanceIdentifier);
        return true;
      });
      return [...leaveBalancesToAdd, ...leaveBalanceCollection];
    }
    return leaveBalanceCollection;
  }

  protected convertDateFromClient<T extends ILeaveBalance | NewLeaveBalance | PartialUpdateLeaveBalance>(leaveBalance: T): RestOf<T> {
    return {
      ...leaveBalance,
      lastUpdatedAt: leaveBalance.lastUpdatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restLeaveBalance: RestLeaveBalance): ILeaveBalance {
    return {
      ...restLeaveBalance,
      lastUpdatedAt: restLeaveBalance.lastUpdatedAt ? dayjs(restLeaveBalance.lastUpdatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestLeaveBalance>): HttpResponse<ILeaveBalance> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestLeaveBalance[]>): HttpResponse<ILeaveBalance[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
