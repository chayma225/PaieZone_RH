import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IAuditLog, NewAuditLog } from '../audit-log.model';

export type PartialUpdateAuditLog = Partial<IAuditLog> & Pick<IAuditLog, 'id'>;

type RestOf<T extends IAuditLog | NewAuditLog> = Omit<T, 'occurredAt'> & {
  occurredAt?: string | null;
};

export type RestAuditLog = RestOf<IAuditLog>;

export type NewRestAuditLog = RestOf<NewAuditLog>;

export type PartialUpdateRestAuditLog = RestOf<PartialUpdateAuditLog>;

@Injectable()
export class AuditLogsService {
  readonly auditLogsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly auditLogsResource = httpResource<RestAuditLog[]>(() => {
    const params = this.auditLogsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of auditLog that have been fetched. It is updated when the auditLogsResource emits a new value.
   * In case of error while fetching the auditLogs, the signal is set to an empty array.
   */
  readonly auditLogs = computed(() =>
    (this.auditLogsResource.hasValue() ? this.auditLogsResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/audit-logs');

  protected convertValueFromServer(restAuditLog: RestAuditLog): IAuditLog {
    return {
      ...restAuditLog,
      occurredAt: restAuditLog.occurredAt ? dayjs(restAuditLog.occurredAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class AuditLogService extends AuditLogsService {
  protected readonly http = inject(HttpClient);

  create(auditLog: NewAuditLog): Observable<IAuditLog> {
    const copy = this.convertValueFromClient(auditLog);
    return this.http.post<RestAuditLog>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(auditLog: IAuditLog): Observable<IAuditLog> {
    const copy = this.convertValueFromClient(auditLog);
    return this.http
      .put<RestAuditLog>(`${this.resourceUrl}/${encodeURIComponent(this.getAuditLogIdentifier(auditLog))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(auditLog: PartialUpdateAuditLog): Observable<IAuditLog> {
    const copy = this.convertValueFromClient(auditLog);
    return this.http
      .patch<RestAuditLog>(`${this.resourceUrl}/${encodeURIComponent(this.getAuditLogIdentifier(auditLog))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IAuditLog> {
    return this.http
      .get<RestAuditLog>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IAuditLog[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestAuditLog[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getAuditLogIdentifier(auditLog: Pick<IAuditLog, 'id'>): number {
    return auditLog.id;
  }

  compareAuditLog(o1: Pick<IAuditLog, 'id'> | null, o2: Pick<IAuditLog, 'id'> | null): boolean {
    return o1 && o2 ? this.getAuditLogIdentifier(o1) === this.getAuditLogIdentifier(o2) : o1 === o2;
  }

  addAuditLogToCollectionIfMissing<Type extends Pick<IAuditLog, 'id'>>(
    auditLogCollection: Type[],
    ...auditLogsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const auditLogs: Type[] = auditLogsToCheck.filter(isPresent);
    if (auditLogs.length > 0) {
      const auditLogCollectionIdentifiers = auditLogCollection.map(auditLogItem => this.getAuditLogIdentifier(auditLogItem));
      const auditLogsToAdd = auditLogs.filter(auditLogItem => {
        const auditLogIdentifier = this.getAuditLogIdentifier(auditLogItem);
        if (auditLogCollectionIdentifiers.includes(auditLogIdentifier)) {
          return false;
        }
        auditLogCollectionIdentifiers.push(auditLogIdentifier);
        return true;
      });
      return [...auditLogsToAdd, ...auditLogCollection];
    }
    return auditLogCollection;
  }

  protected convertValueFromClient<T extends IAuditLog | NewAuditLog | PartialUpdateAuditLog>(auditLog: T): RestOf<T> {
    return {
      ...auditLog,
      occurredAt: auditLog.occurredAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestAuditLog): IAuditLog {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestAuditLog[]): IAuditLog[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
