import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ILeaveType, NewLeaveType } from '../leave-type.model';

export type PartialUpdateLeaveType = Partial<ILeaveType> & Pick<ILeaveType, 'id'>;

export type EntityResponseType = HttpResponse<ILeaveType>;
export type EntityArrayResponseType = HttpResponse<ILeaveType[]>;

@Injectable({ providedIn: 'root' })
export class LeaveTypeService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/leave-types');

  create(leaveType: NewLeaveType): Observable<EntityResponseType> {
    return this.http.post<ILeaveType>(this.resourceUrl, leaveType, { observe: 'response' });
  }

  update(leaveType: ILeaveType): Observable<EntityResponseType> {
    return this.http.put<ILeaveType>(`${this.resourceUrl}/${this.getLeaveTypeIdentifier(leaveType)}`, leaveType, { observe: 'response' });
  }

  partialUpdate(leaveType: PartialUpdateLeaveType): Observable<EntityResponseType> {
    return this.http.patch<ILeaveType>(`${this.resourceUrl}/${this.getLeaveTypeIdentifier(leaveType)}`, leaveType, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ILeaveType>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ILeaveType[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
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
