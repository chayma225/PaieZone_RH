import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { ILeaveRequest, NewLeaveRequest } from '../leave-request.model';

export type PartialUpdateLeaveRequest = Partial<ILeaveRequest> & Pick<ILeaveRequest, 'id'>;

type RestOf<T extends ILeaveRequest | NewLeaveRequest> = Omit<T, 'startDate' | 'endDate' | 'requestedAt' | 'processedAt'> & {
  startDate?: string | null;
  endDate?: string | null;
  requestedAt?: string | null;
  processedAt?: string | null;
};

export type RestLeaveRequest = RestOf<ILeaveRequest>;

export type NewRestLeaveRequest = RestOf<NewLeaveRequest>;

export type PartialUpdateRestLeaveRequest = RestOf<PartialUpdateLeaveRequest>;

@Injectable()
export class LeaveRequestsService {
  readonly leaveRequestsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly leaveRequestsResource = httpResource<RestLeaveRequest[]>(() => {
    const params = this.leaveRequestsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of leaveRequest that have been fetched. It is updated when the leaveRequestsResource emits a new value.
   * In case of error while fetching the leaveRequests, the signal is set to an empty array.
   */
  readonly leaveRequests = computed(() =>
    (this.leaveRequestsResource.hasValue() ? this.leaveRequestsResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/leave-requests');

  protected convertValueFromServer(restLeaveRequest: RestLeaveRequest): ILeaveRequest {
    return {
      ...restLeaveRequest,
      startDate: restLeaveRequest.startDate ? dayjs(restLeaveRequest.startDate) : undefined,
      endDate: restLeaveRequest.endDate ? dayjs(restLeaveRequest.endDate) : undefined,
      requestedAt: restLeaveRequest.requestedAt ? dayjs(restLeaveRequest.requestedAt) : undefined,
      processedAt: restLeaveRequest.processedAt ? dayjs(restLeaveRequest.processedAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class LeaveRequestService extends LeaveRequestsService {
  protected readonly http = inject(HttpClient);

  create(leaveRequest: NewLeaveRequest): Observable<ILeaveRequest> {
    const copy = this.convertValueFromClient(leaveRequest);
    return this.http.post<RestLeaveRequest>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(leaveRequest: ILeaveRequest): Observable<ILeaveRequest> {
    const copy = this.convertValueFromClient(leaveRequest);
    return this.http
      .put<RestLeaveRequest>(`${this.resourceUrl}/${encodeURIComponent(this.getLeaveRequestIdentifier(leaveRequest))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(leaveRequest: PartialUpdateLeaveRequest): Observable<ILeaveRequest> {
    const copy = this.convertValueFromClient(leaveRequest);
    return this.http
      .patch<RestLeaveRequest>(`${this.resourceUrl}/${encodeURIComponent(this.getLeaveRequestIdentifier(leaveRequest))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<ILeaveRequest> {
    return this.http
      .get<RestLeaveRequest>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<ILeaveRequest[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestLeaveRequest[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getLeaveRequestIdentifier(leaveRequest: Pick<ILeaveRequest, 'id'>): number {
    return leaveRequest.id;
  }

  compareLeaveRequest(o1: Pick<ILeaveRequest, 'id'> | null, o2: Pick<ILeaveRequest, 'id'> | null): boolean {
    return o1 && o2 ? this.getLeaveRequestIdentifier(o1) === this.getLeaveRequestIdentifier(o2) : o1 === o2;
  }

  addLeaveRequestToCollectionIfMissing<Type extends Pick<ILeaveRequest, 'id'>>(
    leaveRequestCollection: Type[],
    ...leaveRequestsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const leaveRequests: Type[] = leaveRequestsToCheck.filter(isPresent);
    if (leaveRequests.length > 0) {
      const leaveRequestCollectionIdentifiers = leaveRequestCollection.map(leaveRequestItem =>
        this.getLeaveRequestIdentifier(leaveRequestItem),
      );
      const leaveRequestsToAdd = leaveRequests.filter(leaveRequestItem => {
        const leaveRequestIdentifier = this.getLeaveRequestIdentifier(leaveRequestItem);
        if (leaveRequestCollectionIdentifiers.includes(leaveRequestIdentifier)) {
          return false;
        }
        leaveRequestCollectionIdentifiers.push(leaveRequestIdentifier);
        return true;
      });
      return [...leaveRequestsToAdd, ...leaveRequestCollection];
    }
    return leaveRequestCollection;
  }

  protected convertValueFromClient<T extends ILeaveRequest | NewLeaveRequest | PartialUpdateLeaveRequest>(leaveRequest: T): RestOf<T> {
    return {
      ...leaveRequest,
      startDate: leaveRequest.startDate?.format(DATE_FORMAT) ?? null,
      endDate: leaveRequest.endDate?.format(DATE_FORMAT) ?? null,
      requestedAt: leaveRequest.requestedAt?.toJSON() ?? null,
      processedAt: leaveRequest.processedAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestLeaveRequest): ILeaveRequest {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestLeaveRequest[]): ILeaveRequest[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
