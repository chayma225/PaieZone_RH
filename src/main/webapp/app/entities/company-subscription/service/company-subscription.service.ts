import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ICompanySubscription, NewCompanySubscription } from '../company-subscription.model';

export type PartialUpdateCompanySubscription = Partial<ICompanySubscription> & Pick<ICompanySubscription, 'id'>;

type RestOf<T extends ICompanySubscription | NewCompanySubscription> = Omit<T, 'startDate' | 'endDate' | 'renewalDate'> & {
  startDate?: string | null;
  endDate?: string | null;
  renewalDate?: string | null;
};

export type RestCompanySubscription = RestOf<ICompanySubscription>;

export type NewRestCompanySubscription = RestOf<NewCompanySubscription>;

export type PartialUpdateRestCompanySubscription = RestOf<PartialUpdateCompanySubscription>;

export type EntityResponseType = HttpResponse<ICompanySubscription>;
export type EntityArrayResponseType = HttpResponse<ICompanySubscription[]>;

@Injectable({ providedIn: 'root' })
export class CompanySubscriptionService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/company-subscriptions');

  create(companySubscription: NewCompanySubscription): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(companySubscription);
    return this.http
      .post<RestCompanySubscription>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(companySubscription: ICompanySubscription): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(companySubscription);
    return this.http
      .put<RestCompanySubscription>(`${this.resourceUrl}/${this.getCompanySubscriptionIdentifier(companySubscription)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(companySubscription: PartialUpdateCompanySubscription): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(companySubscription);
    return this.http
      .patch<RestCompanySubscription>(`${this.resourceUrl}/${this.getCompanySubscriptionIdentifier(companySubscription)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestCompanySubscription>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestCompanySubscription[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getCompanySubscriptionIdentifier(companySubscription: Pick<ICompanySubscription, 'id'>): number {
    return companySubscription.id;
  }

  compareCompanySubscription(o1: Pick<ICompanySubscription, 'id'> | null, o2: Pick<ICompanySubscription, 'id'> | null): boolean {
    return o1 && o2 ? this.getCompanySubscriptionIdentifier(o1) === this.getCompanySubscriptionIdentifier(o2) : o1 === o2;
  }

  addCompanySubscriptionToCollectionIfMissing<Type extends Pick<ICompanySubscription, 'id'>>(
    companySubscriptionCollection: Type[],
    ...companySubscriptionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const companySubscriptions: Type[] = companySubscriptionsToCheck.filter(isPresent);
    if (companySubscriptions.length > 0) {
      const companySubscriptionCollectionIdentifiers = companySubscriptionCollection.map(companySubscriptionItem =>
        this.getCompanySubscriptionIdentifier(companySubscriptionItem),
      );
      const companySubscriptionsToAdd = companySubscriptions.filter(companySubscriptionItem => {
        const companySubscriptionIdentifier = this.getCompanySubscriptionIdentifier(companySubscriptionItem);
        if (companySubscriptionCollectionIdentifiers.includes(companySubscriptionIdentifier)) {
          return false;
        }
        companySubscriptionCollectionIdentifiers.push(companySubscriptionIdentifier);
        return true;
      });
      return [...companySubscriptionsToAdd, ...companySubscriptionCollection];
    }
    return companySubscriptionCollection;
  }

  protected convertDateFromClient<T extends ICompanySubscription | NewCompanySubscription | PartialUpdateCompanySubscription>(
    companySubscription: T,
  ): RestOf<T> {
    return {
      ...companySubscription,
      startDate: companySubscription.startDate?.format(DATE_FORMAT) ?? null,
      endDate: companySubscription.endDate?.format(DATE_FORMAT) ?? null,
      renewalDate: companySubscription.renewalDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restCompanySubscription: RestCompanySubscription): ICompanySubscription {
    return {
      ...restCompanySubscription,
      startDate: restCompanySubscription.startDate ? dayjs(restCompanySubscription.startDate) : undefined,
      endDate: restCompanySubscription.endDate ? dayjs(restCompanySubscription.endDate) : undefined,
      renewalDate: restCompanySubscription.renewalDate ? dayjs(restCompanySubscription.renewalDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestCompanySubscription>): HttpResponse<ICompanySubscription> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestCompanySubscription[]>): HttpResponse<ICompanySubscription[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
