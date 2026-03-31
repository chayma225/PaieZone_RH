import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IJobPosition, NewJobPosition } from '../job-position.model';

export type PartialUpdateJobPosition = Partial<IJobPosition> & Pick<IJobPosition, 'id'>;

export type EntityResponseType = HttpResponse<IJobPosition>;
export type EntityArrayResponseType = HttpResponse<IJobPosition[]>;

@Injectable({ providedIn: 'root' })
export class JobPositionService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/job-positions');

  create(jobPosition: NewJobPosition): Observable<EntityResponseType> {
    return this.http.post<IJobPosition>(this.resourceUrl, jobPosition, { observe: 'response' });
  }

  update(jobPosition: IJobPosition): Observable<EntityResponseType> {
    return this.http.put<IJobPosition>(`${this.resourceUrl}/${this.getJobPositionIdentifier(jobPosition)}`, jobPosition, {
      observe: 'response',
    });
  }

  partialUpdate(jobPosition: PartialUpdateJobPosition): Observable<EntityResponseType> {
    return this.http.patch<IJobPosition>(`${this.resourceUrl}/${this.getJobPositionIdentifier(jobPosition)}`, jobPosition, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IJobPosition>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IJobPosition[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getJobPositionIdentifier(jobPosition: Pick<IJobPosition, 'id'>): number {
    return jobPosition.id;
  }

  compareJobPosition(o1: Pick<IJobPosition, 'id'> | null, o2: Pick<IJobPosition, 'id'> | null): boolean {
    return o1 && o2 ? this.getJobPositionIdentifier(o1) === this.getJobPositionIdentifier(o2) : o1 === o2;
  }

  addJobPositionToCollectionIfMissing<Type extends Pick<IJobPosition, 'id'>>(
    jobPositionCollection: Type[],
    ...jobPositionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const jobPositions: Type[] = jobPositionsToCheck.filter(isPresent);
    if (jobPositions.length > 0) {
      const jobPositionCollectionIdentifiers = jobPositionCollection.map(jobPositionItem => this.getJobPositionIdentifier(jobPositionItem));
      const jobPositionsToAdd = jobPositions.filter(jobPositionItem => {
        const jobPositionIdentifier = this.getJobPositionIdentifier(jobPositionItem);
        if (jobPositionCollectionIdentifiers.includes(jobPositionIdentifier)) {
          return false;
        }
        jobPositionCollectionIdentifiers.push(jobPositionIdentifier);
        return true;
      });
      return [...jobPositionsToAdd, ...jobPositionCollection];
    }
    return jobPositionCollection;
  }
}
