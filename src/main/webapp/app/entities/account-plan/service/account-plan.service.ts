import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IAccountPlan, NewAccountPlan } from '../account-plan.model';

export type PartialUpdateAccountPlan = Partial<IAccountPlan> & Pick<IAccountPlan, 'id'>;

export type EntityResponseType = HttpResponse<IAccountPlan>;
export type EntityArrayResponseType = HttpResponse<IAccountPlan[]>;

@Injectable({ providedIn: 'root' })
export class AccountPlanService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/account-plans');

  create(accountPlan: NewAccountPlan): Observable<EntityResponseType> {
    return this.http.post<IAccountPlan>(this.resourceUrl, accountPlan, { observe: 'response' });
  }

  update(accountPlan: IAccountPlan): Observable<EntityResponseType> {
    return this.http.put<IAccountPlan>(`${this.resourceUrl}/${this.getAccountPlanIdentifier(accountPlan)}`, accountPlan, {
      observe: 'response',
    });
  }

  partialUpdate(accountPlan: PartialUpdateAccountPlan): Observable<EntityResponseType> {
    return this.http.patch<IAccountPlan>(`${this.resourceUrl}/${this.getAccountPlanIdentifier(accountPlan)}`, accountPlan, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IAccountPlan>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IAccountPlan[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
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
