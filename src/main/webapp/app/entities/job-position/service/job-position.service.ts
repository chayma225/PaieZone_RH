import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IJobPosition, NewJobPosition } from '../job-position.model';

export type PartialUpdateJobPosition = Partial<IJobPosition> & Pick<IJobPosition, 'id'>;

@Injectable()
export class JobPositionsService {
  readonly jobPositionsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly jobPositionsResource = httpResource<IJobPosition[]>(() => {
    const params = this.jobPositionsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of jobPosition that have been fetched. It is updated when the jobPositionsResource emits a new value.
   * In case of error while fetching the jobPositions, the signal is set to an empty array.
   */
  readonly jobPositions = computed(() => (this.jobPositionsResource.hasValue() ? this.jobPositionsResource.value() : []));
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/job-positions');
}

@Injectable({ providedIn: 'root' })
export class JobPositionService extends JobPositionsService {
  protected readonly http = inject(HttpClient);

  create(jobPosition: NewJobPosition): Observable<IJobPosition> {
    return this.http.post<IJobPosition>(this.resourceUrl, jobPosition);
  }

  update(jobPosition: IJobPosition): Observable<IJobPosition> {
    return this.http.put<IJobPosition>(
      `${this.resourceUrl}/${encodeURIComponent(this.getJobPositionIdentifier(jobPosition))}`,
      jobPosition,
    );
  }

  partialUpdate(jobPosition: PartialUpdateJobPosition): Observable<IJobPosition> {
    return this.http.patch<IJobPosition>(
      `${this.resourceUrl}/${encodeURIComponent(this.getJobPositionIdentifier(jobPosition))}`,
      jobPosition,
    );
  }

  find(id: number): Observable<IJobPosition> {
    return this.http.get<IJobPosition>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  query(req?: any): Observable<HttpResponse<IJobPosition[]>> {
    const options = createRequestOption(req);
    return this.http.get<IJobPosition[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
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
