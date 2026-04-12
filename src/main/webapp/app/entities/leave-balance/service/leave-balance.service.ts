import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { ILeaveBalance, NewLeaveBalance } from '../leave-balance.model';

export type PartialUpdateLeaveBalance = Partial<ILeaveBalance> & Pick<ILeaveBalance, 'id'>;

type RestOf<T extends ILeaveBalance | NewLeaveBalance> = Omit<T, 'lastUpdatedAt'> & {
  lastUpdatedAt?: string | null;
};

export type RestLeaveBalance = RestOf<ILeaveBalance>;

export type NewRestLeaveBalance = RestOf<NewLeaveBalance>;

export type PartialUpdateRestLeaveBalance = RestOf<PartialUpdateLeaveBalance>;

@Injectable()
export class LeaveBalancesService {
  readonly leaveBalancesParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly leaveBalancesResource = httpResource<RestLeaveBalance[]>(() => {
    const params = this.leaveBalancesParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of leaveBalance that have been fetched. It is updated when the leaveBalancesResource emits a new value.
   * In case of error while fetching the leaveBalances, the signal is set to an empty array.
   */
  readonly leaveBalances = computed(() =>
    (this.leaveBalancesResource.hasValue() ? this.leaveBalancesResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/leave-balances');

  protected convertValueFromServer(restLeaveBalance: RestLeaveBalance): ILeaveBalance {
    return {
      ...restLeaveBalance,
      lastUpdatedAt: restLeaveBalance.lastUpdatedAt ? dayjs(restLeaveBalance.lastUpdatedAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class LeaveBalanceService extends LeaveBalancesService {
  protected readonly http = inject(HttpClient);

  create(leaveBalance: NewLeaveBalance): Observable<ILeaveBalance> {
    const copy = this.convertValueFromClient(leaveBalance);
    return this.http.post<RestLeaveBalance>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(leaveBalance: ILeaveBalance): Observable<ILeaveBalance> {
    const copy = this.convertValueFromClient(leaveBalance);
    return this.http
      .put<RestLeaveBalance>(`${this.resourceUrl}/${encodeURIComponent(this.getLeaveBalanceIdentifier(leaveBalance))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(leaveBalance: PartialUpdateLeaveBalance): Observable<ILeaveBalance> {
    const copy = this.convertValueFromClient(leaveBalance);
    return this.http
      .patch<RestLeaveBalance>(`${this.resourceUrl}/${encodeURIComponent(this.getLeaveBalanceIdentifier(leaveBalance))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<ILeaveBalance> {
    return this.http
      .get<RestLeaveBalance>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<ILeaveBalance[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestLeaveBalance[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
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

  protected convertValueFromClient<T extends ILeaveBalance | NewLeaveBalance | PartialUpdateLeaveBalance>(leaveBalance: T): RestOf<T> {
    return {
      ...leaveBalance,
      lastUpdatedAt: leaveBalance.lastUpdatedAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestLeaveBalance): ILeaveBalance {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestLeaveBalance[]): ILeaveBalance[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
