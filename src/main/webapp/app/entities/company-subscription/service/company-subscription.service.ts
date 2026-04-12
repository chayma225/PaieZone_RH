import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
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

@Injectable()
export class CompanySubscriptionsService {
  readonly companySubscriptionsParams = signal<
    Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined
  >(undefined);
  readonly companySubscriptionsResource = httpResource<RestCompanySubscription[]>(() => {
    const params = this.companySubscriptionsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of companySubscription that have been fetched. It is updated when the companySubscriptionsResource emits a new value.
   * In case of error while fetching the companySubscriptions, the signal is set to an empty array.
   */
  readonly companySubscriptions = computed(() =>
    (this.companySubscriptionsResource.hasValue() ? this.companySubscriptionsResource.value() : []).map(item =>
      this.convertValueFromServer(item),
    ),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/company-subscriptions');

  protected convertValueFromServer(restCompanySubscription: RestCompanySubscription): ICompanySubscription {
    return {
      ...restCompanySubscription,
      startDate: restCompanySubscription.startDate ? dayjs(restCompanySubscription.startDate) : undefined,
      endDate: restCompanySubscription.endDate ? dayjs(restCompanySubscription.endDate) : undefined,
      renewalDate: restCompanySubscription.renewalDate ? dayjs(restCompanySubscription.renewalDate) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class CompanySubscriptionService extends CompanySubscriptionsService {
  protected readonly http = inject(HttpClient);

  create(companySubscription: NewCompanySubscription): Observable<ICompanySubscription> {
    const copy = this.convertValueFromClient(companySubscription);
    return this.http.post<RestCompanySubscription>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(companySubscription: ICompanySubscription): Observable<ICompanySubscription> {
    const copy = this.convertValueFromClient(companySubscription);
    return this.http
      .put<RestCompanySubscription>(
        `${this.resourceUrl}/${encodeURIComponent(this.getCompanySubscriptionIdentifier(companySubscription))}`,
        copy,
      )
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(companySubscription: PartialUpdateCompanySubscription): Observable<ICompanySubscription> {
    const copy = this.convertValueFromClient(companySubscription);
    return this.http
      .patch<RestCompanySubscription>(
        `${this.resourceUrl}/${encodeURIComponent(this.getCompanySubscriptionIdentifier(companySubscription))}`,
        copy,
      )
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<ICompanySubscription> {
    return this.http
      .get<RestCompanySubscription>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<ICompanySubscription[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestCompanySubscription[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
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

  protected convertValueFromClient<T extends ICompanySubscription | NewCompanySubscription | PartialUpdateCompanySubscription>(
    companySubscription: T,
  ): RestOf<T> {
    return {
      ...companySubscription,
      startDate: companySubscription.startDate?.format(DATE_FORMAT) ?? null,
      endDate: companySubscription.endDate?.format(DATE_FORMAT) ?? null,
      renewalDate: companySubscription.renewalDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertResponseFromServer(res: RestCompanySubscription): ICompanySubscription {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestCompanySubscription[]): ICompanySubscription[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
