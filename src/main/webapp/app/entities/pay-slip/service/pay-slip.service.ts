import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPaySlip, NewPaySlip } from '../pay-slip.model';

export type PartialUpdatePaySlip = Partial<IPaySlip> & Pick<IPaySlip, 'id'>;

type RestOf<T extends IPaySlip | NewPaySlip> = Omit<T, 'generatedAt' | 'sentToEmployeeAt'> & {
  generatedAt?: string | null;
  sentToEmployeeAt?: string | null;
};

export type RestPaySlip = RestOf<IPaySlip>;

export type NewRestPaySlip = RestOf<NewPaySlip>;

export type PartialUpdateRestPaySlip = RestOf<PartialUpdatePaySlip>;

export type EntityResponseType = HttpResponse<IPaySlip>;
export type EntityArrayResponseType = HttpResponse<IPaySlip[]>;

@Injectable({ providedIn: 'root' })
export class PaySlipService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/pay-slips');

  create(paySlip: NewPaySlip): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(paySlip);
    return this.http
      .post<RestPaySlip>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(paySlip: IPaySlip): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(paySlip);
    return this.http
      .put<RestPaySlip>(`${this.resourceUrl}/${this.getPaySlipIdentifier(paySlip)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(paySlip: PartialUpdatePaySlip): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(paySlip);
    return this.http
      .patch<RestPaySlip>(`${this.resourceUrl}/${this.getPaySlipIdentifier(paySlip)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestPaySlip>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPaySlip[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
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

  protected convertDateFromClient<T extends IPaySlip | NewPaySlip | PartialUpdatePaySlip>(paySlip: T): RestOf<T> {
    return {
      ...paySlip,
      generatedAt: paySlip.generatedAt?.toJSON() ?? null,
      sentToEmployeeAt: paySlip.sentToEmployeeAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restPaySlip: RestPaySlip): IPaySlip {
    return {
      ...restPaySlip,
      generatedAt: restPaySlip.generatedAt ? dayjs(restPaySlip.generatedAt) : undefined,
      sentToEmployeeAt: restPaySlip.sentToEmployeeAt ? dayjs(restPaySlip.sentToEmployeeAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestPaySlip>): HttpResponse<IPaySlip> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestPaySlip[]>): HttpResponse<IPaySlip[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
