import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IAccountPlan, NewAccountPlan } from '../account-plan.model';

export type PartialUpdateAccountPlan = Partial<IAccountPlan> & Pick<IAccountPlan, 'id'>;

@Injectable()
export class AccountPlansService {
  readonly accountPlansParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly accountPlansResource = httpResource<IAccountPlan[]>(() => {
    const params = this.accountPlansParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of accountPlan that have been fetched. It is updated when the accountPlansResource emits a new value.
   * In case of error while fetching the accountPlans, the signal is set to an empty array.
   */
  readonly accountPlans = computed(() => (this.accountPlansResource.hasValue() ? this.accountPlansResource.value() : []));
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/account-plans');
}

@Injectable({ providedIn: 'root' })
export class AccountPlanService extends AccountPlansService {
  protected readonly http = inject(HttpClient);

  create(accountPlan: NewAccountPlan): Observable<IAccountPlan> {
    return this.http.post<IAccountPlan>(this.resourceUrl, accountPlan);
  }

  update(accountPlan: IAccountPlan): Observable<IAccountPlan> {
    return this.http.put<IAccountPlan>(
      `${this.resourceUrl}/${encodeURIComponent(this.getAccountPlanIdentifier(accountPlan))}`,
      accountPlan,
    );
  }

  partialUpdate(accountPlan: PartialUpdateAccountPlan): Observable<IAccountPlan> {
    return this.http.patch<IAccountPlan>(
      `${this.resourceUrl}/${encodeURIComponent(this.getAccountPlanIdentifier(accountPlan))}`,
      accountPlan,
    );
  }

  find(id: number): Observable<IAccountPlan> {
    return this.http.get<IAccountPlan>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  query(req?: any): Observable<HttpResponse<IAccountPlan[]>> {
    const options = createRequestOption(req);
    return this.http.get<IAccountPlan[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getAccountPlanIdentifier(accountPlan: Pick<IAccountPlan, 'id'>): number {
    return accountPlan.id;
  }

  compareAccountPlan(o1: Pick<IAccountPlan, 'id'> | null, o2: Pick<IAccountPlan, 'id'> | null): boolean {
    return o1 && o2 ? this.getAccountPlanIdentifier(o1) === this.getAccountPlanIdentifier(o2) : o1 === o2;
  }

  addAccountPlanToCollectionIfMissing<Type extends Pick<IAccountPlan, 'id'>>(
    accountPlanCollection: Type[],
    ...accountPlansToCheck: (Type | null | undefined)[]
  ): Type[] {
    const accountPlans: Type[] = accountPlansToCheck.filter(isPresent);
    if (accountPlans.length > 0) {
      const accountPlanCollectionIdentifiers = accountPlanCollection.map(accountPlanItem => this.getAccountPlanIdentifier(accountPlanItem));
      const accountPlansToAdd = accountPlans.filter(accountPlanItem => {
        const accountPlanIdentifier = this.getAccountPlanIdentifier(accountPlanItem);
        if (accountPlanCollectionIdentifiers.includes(accountPlanIdentifier)) {
          return false;
        }
        accountPlanCollectionIdentifiers.push(accountPlanIdentifier);
        return true;
      });
      return [...accountPlansToAdd, ...accountPlanCollection];
    }
    return accountPlanCollection;
  }
}
