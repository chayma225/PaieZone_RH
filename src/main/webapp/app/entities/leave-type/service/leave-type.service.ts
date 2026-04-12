import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { ILeaveType, NewLeaveType } from '../leave-type.model';

export type PartialUpdateLeaveType = Partial<ILeaveType> & Pick<ILeaveType, 'id'>;

@Injectable()
export class LeaveTypesService {
  readonly leaveTypesParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly leaveTypesResource = httpResource<ILeaveType[]>(() => {
    const params = this.leaveTypesParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of leaveType that have been fetched. It is updated when the leaveTypesResource emits a new value.
   * In case of error while fetching the leaveTypes, the signal is set to an empty array.
   */
  readonly leaveTypes = computed(() => (this.leaveTypesResource.hasValue() ? this.leaveTypesResource.value() : []));
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/leave-types');
}

@Injectable({ providedIn: 'root' })
export class LeaveTypeService extends LeaveTypesService {
  protected readonly http = inject(HttpClient);

  create(leaveType: NewLeaveType): Observable<ILeaveType> {
    return this.http.post<ILeaveType>(this.resourceUrl, leaveType);
  }

  update(leaveType: ILeaveType): Observable<ILeaveType> {
    return this.http.put<ILeaveType>(`${this.resourceUrl}/${encodeURIComponent(this.getLeaveTypeIdentifier(leaveType))}`, leaveType);
  }

  partialUpdate(leaveType: PartialUpdateLeaveType): Observable<ILeaveType> {
    return this.http.patch<ILeaveType>(`${this.resourceUrl}/${encodeURIComponent(this.getLeaveTypeIdentifier(leaveType))}`, leaveType);
  }

  find(id: number): Observable<ILeaveType> {
    return this.http.get<ILeaveType>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  query(req?: any): Observable<HttpResponse<ILeaveType[]>> {
    const options = createRequestOption(req);
    return this.http.get<ILeaveType[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getLeaveTypeIdentifier(leaveType: Pick<ILeaveType, 'id'>): number {
    return leaveType.id;
  }

  compareLeaveType(o1: Pick<ILeaveType, 'id'> | null, o2: Pick<ILeaveType, 'id'> | null): boolean {
    return o1 && o2 ? this.getLeaveTypeIdentifier(o1) === this.getLeaveTypeIdentifier(o2) : o1 === o2;
  }

  addLeaveTypeToCollectionIfMissing<Type extends Pick<ILeaveType, 'id'>>(
    leaveTypeCollection: Type[],
    ...leaveTypesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const leaveTypes: Type[] = leaveTypesToCheck.filter(isPresent);
    if (leaveTypes.length > 0) {
      const leaveTypeCollectionIdentifiers = leaveTypeCollection.map(leaveTypeItem => this.getLeaveTypeIdentifier(leaveTypeItem));
      const leaveTypesToAdd = leaveTypes.filter(leaveTypeItem => {
        const leaveTypeIdentifier = this.getLeaveTypeIdentifier(leaveTypeItem);
        if (leaveTypeCollectionIdentifiers.includes(leaveTypeIdentifier)) {
          return false;
        }
        leaveTypeCollectionIdentifiers.push(leaveTypeIdentifier);
        return true;
      });
      return [...leaveTypesToAdd, ...leaveTypeCollection];
    }
    return leaveTypeCollection;
  }
}
