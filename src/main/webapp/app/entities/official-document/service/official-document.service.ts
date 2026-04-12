import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IOfficialDocument, NewOfficialDocument } from '../official-document.model';

export type PartialUpdateOfficialDocument = Partial<IOfficialDocument> & Pick<IOfficialDocument, 'id'>;

type RestOf<T extends IOfficialDocument | NewOfficialDocument> = Omit<T, 'generatedAt' | 'sentAt'> & {
  generatedAt?: string | null;
  sentAt?: string | null;
};

export type RestOfficialDocument = RestOf<IOfficialDocument>;

export type NewRestOfficialDocument = RestOf<NewOfficialDocument>;

export type PartialUpdateRestOfficialDocument = RestOf<PartialUpdateOfficialDocument>;

@Injectable()
export class OfficialDocumentsService {
  readonly officialDocumentsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly officialDocumentsResource = httpResource<RestOfficialDocument[]>(() => {
    const params = this.officialDocumentsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of officialDocument that have been fetched. It is updated when the officialDocumentsResource emits a new value.
   * In case of error while fetching the officialDocuments, the signal is set to an empty array.
   */
  readonly officialDocuments = computed(() =>
    (this.officialDocumentsResource.hasValue() ? this.officialDocumentsResource.value() : []).map(item =>
      this.convertValueFromServer(item),
    ),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/official-documents');

  protected convertValueFromServer(restOfficialDocument: RestOfficialDocument): IOfficialDocument {
    return {
      ...restOfficialDocument,
      generatedAt: restOfficialDocument.generatedAt ? dayjs(restOfficialDocument.generatedAt) : undefined,
      sentAt: restOfficialDocument.sentAt ? dayjs(restOfficialDocument.sentAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class OfficialDocumentService extends OfficialDocumentsService {
  protected readonly http = inject(HttpClient);

  create(officialDocument: NewOfficialDocument): Observable<IOfficialDocument> {
    const copy = this.convertValueFromClient(officialDocument);
    return this.http.post<RestOfficialDocument>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(officialDocument: IOfficialDocument): Observable<IOfficialDocument> {
    const copy = this.convertValueFromClient(officialDocument);
    return this.http
      .put<RestOfficialDocument>(`${this.resourceUrl}/${encodeURIComponent(this.getOfficialDocumentIdentifier(officialDocument))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(officialDocument: PartialUpdateOfficialDocument): Observable<IOfficialDocument> {
    const copy = this.convertValueFromClient(officialDocument);
    return this.http
      .patch<RestOfficialDocument>(`${this.resourceUrl}/${encodeURIComponent(this.getOfficialDocumentIdentifier(officialDocument))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IOfficialDocument> {
    return this.http
      .get<RestOfficialDocument>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IOfficialDocument[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestOfficialDocument[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getOfficialDocumentIdentifier(officialDocument: Pick<IOfficialDocument, 'id'>): number {
    return officialDocument.id;
  }

  compareOfficialDocument(o1: Pick<IOfficialDocument, 'id'> | null, o2: Pick<IOfficialDocument, 'id'> | null): boolean {
    return o1 && o2 ? this.getOfficialDocumentIdentifier(o1) === this.getOfficialDocumentIdentifier(o2) : o1 === o2;
  }

  addOfficialDocumentToCollectionIfMissing<Type extends Pick<IOfficialDocument, 'id'>>(
    officialDocumentCollection: Type[],
    ...officialDocumentsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const officialDocuments: Type[] = officialDocumentsToCheck.filter(isPresent);
    if (officialDocuments.length > 0) {
      const officialDocumentCollectionIdentifiers = officialDocumentCollection.map(officialDocumentItem =>
        this.getOfficialDocumentIdentifier(officialDocumentItem),
      );
      const officialDocumentsToAdd = officialDocuments.filter(officialDocumentItem => {
        const officialDocumentIdentifier = this.getOfficialDocumentIdentifier(officialDocumentItem);
        if (officialDocumentCollectionIdentifiers.includes(officialDocumentIdentifier)) {
          return false;
        }
        officialDocumentCollectionIdentifiers.push(officialDocumentIdentifier);
        return true;
      });
      return [...officialDocumentsToAdd, ...officialDocumentCollection];
    }
    return officialDocumentCollection;
  }

  protected convertValueFromClient<T extends IOfficialDocument | NewOfficialDocument | PartialUpdateOfficialDocument>(
    officialDocument: T,
  ): RestOf<T> {
    return {
      ...officialDocument,
      generatedAt: officialDocument.generatedAt?.toJSON() ?? null,
      sentAt: officialDocument.sentAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestOfficialDocument): IOfficialDocument {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestOfficialDocument[]): IOfficialDocument[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
