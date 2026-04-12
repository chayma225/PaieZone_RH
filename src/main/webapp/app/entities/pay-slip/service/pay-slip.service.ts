import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IPaySlip, NewPaySlip } from '../pay-slip.model';

export type PartialUpdatePaySlip = Partial<IPaySlip> & Pick<IPaySlip, 'id'>;

type RestOf<T extends IPaySlip | NewPaySlip> = Omit<T, 'generatedAt' | 'sentToEmployeeAt'> & {
  generatedAt?: string | null;
  sentToEmployeeAt?: string | null;
};

export type RestPaySlip = RestOf<IPaySlip>;

export type NewRestPaySlip = RestOf<NewPaySlip>;

export type PartialUpdateRestPaySlip = RestOf<PartialUpdatePaySlip>;

@Injectable()
export class PaySlipsService {
  readonly paySlipsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly paySlipsResource = httpResource<RestPaySlip[]>(() => {
    const params = this.paySlipsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of paySlip that have been fetched. It is updated when the paySlipsResource emits a new value.
   * In case of error while fetching the paySlips, the signal is set to an empty array.
   */
  readonly paySlips = computed(() =>
    (this.paySlipsResource.hasValue() ? this.paySlipsResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/pay-slips');

  protected convertValueFromServer(restPaySlip: RestPaySlip): IPaySlip {
    return {
      ...restPaySlip,
      generatedAt: restPaySlip.generatedAt ? dayjs(restPaySlip.generatedAt) : undefined,
      sentToEmployeeAt: restPaySlip.sentToEmployeeAt ? dayjs(restPaySlip.sentToEmployeeAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class PaySlipService extends PaySlipsService {
  protected readonly http = inject(HttpClient);

  create(paySlip: NewPaySlip): Observable<IPaySlip> {
    const copy = this.convertValueFromClient(paySlip);
    return this.http.post<RestPaySlip>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(paySlip: IPaySlip): Observable<IPaySlip> {
    const copy = this.convertValueFromClient(paySlip);
    return this.http
      .put<RestPaySlip>(`${this.resourceUrl}/${encodeURIComponent(this.getPaySlipIdentifier(paySlip))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(paySlip: PartialUpdatePaySlip): Observable<IPaySlip> {
    const copy = this.convertValueFromClient(paySlip);
    return this.http
      .patch<RestPaySlip>(`${this.resourceUrl}/${encodeURIComponent(this.getPaySlipIdentifier(paySlip))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IPaySlip> {
    return this.http
      .get<RestPaySlip>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IPaySlip[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPaySlip[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getPaySlipIdentifier(paySlip: Pick<IPaySlip, 'id'>): number {
    return paySlip.id;
  }

  comparePaySlip(o1: Pick<IPaySlip, 'id'> | null, o2: Pick<IPaySlip, 'id'> | null): boolean {
    return o1 && o2 ? this.getPaySlipIdentifier(o1) === this.getPaySlipIdentifier(o2) : o1 === o2;
  }

  addPaySlipToCollectionIfMissing<Type extends Pick<IPaySlip, 'id'>>(
    paySlipCollection: Type[],
    ...paySlipsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const paySlips: Type[] = paySlipsToCheck.filter(isPresent);
    if (paySlips.length > 0) {
      const paySlipCollectionIdentifiers = paySlipCollection.map(paySlipItem => this.getPaySlipIdentifier(paySlipItem));
      const paySlipsToAdd = paySlips.filter(paySlipItem => {
        const paySlipIdentifier = this.getPaySlipIdentifier(paySlipItem);
        if (paySlipCollectionIdentifiers.includes(paySlipIdentifier)) {
          return false;
        }
        paySlipCollectionIdentifiers.push(paySlipIdentifier);
        return true;
      });
      return [...paySlipsToAdd, ...paySlipCollection];
    }
    return paySlipCollection;
  }

  protected convertValueFromClient<T extends IPaySlip | NewPaySlip | PartialUpdatePaySlip>(paySlip: T): RestOf<T> {
    return {
      ...paySlip,
      generatedAt: paySlip.generatedAt?.toJSON() ?? null,
      sentToEmployeeAt: paySlip.sentToEmployeeAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestPaySlip): IPaySlip {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestPaySlip[]): IPaySlip[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
