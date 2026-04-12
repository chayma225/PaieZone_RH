import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IKnowledgeDocument, NewKnowledgeDocument } from '../knowledge-document.model';

export type PartialUpdateKnowledgeDocument = Partial<IKnowledgeDocument> & Pick<IKnowledgeDocument, 'id'>;

type RestOf<T extends IKnowledgeDocument | NewKnowledgeDocument> = Omit<T, 'indexedAt' | 'createdAt'> & {
  indexedAt?: string | null;
  createdAt?: string | null;
};

export type RestKnowledgeDocument = RestOf<IKnowledgeDocument>;

export type NewRestKnowledgeDocument = RestOf<NewKnowledgeDocument>;

export type PartialUpdateRestKnowledgeDocument = RestOf<PartialUpdateKnowledgeDocument>;

@Injectable()
export class KnowledgeDocumentsService {
  readonly knowledgeDocumentsParams = signal<
    Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined
  >(undefined);
  readonly knowledgeDocumentsResource = httpResource<RestKnowledgeDocument[]>(() => {
    const params = this.knowledgeDocumentsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of knowledgeDocument that have been fetched. It is updated when the knowledgeDocumentsResource emits a new value.
   * In case of error while fetching the knowledgeDocuments, the signal is set to an empty array.
   */
  readonly knowledgeDocuments = computed(() =>
    (this.knowledgeDocumentsResource.hasValue() ? this.knowledgeDocumentsResource.value() : []).map(item =>
      this.convertValueFromServer(item),
    ),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/knowledge-documents');

  protected convertValueFromServer(restKnowledgeDocument: RestKnowledgeDocument): IKnowledgeDocument {
    return {
      ...restKnowledgeDocument,
      indexedAt: restKnowledgeDocument.indexedAt ? dayjs(restKnowledgeDocument.indexedAt) : undefined,
      createdAt: restKnowledgeDocument.createdAt ? dayjs(restKnowledgeDocument.createdAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class KnowledgeDocumentService extends KnowledgeDocumentsService {
  protected readonly http = inject(HttpClient);

  create(knowledgeDocument: NewKnowledgeDocument): Observable<IKnowledgeDocument> {
    const copy = this.convertValueFromClient(knowledgeDocument);
    return this.http.post<RestKnowledgeDocument>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(knowledgeDocument: IKnowledgeDocument): Observable<IKnowledgeDocument> {
    const copy = this.convertValueFromClient(knowledgeDocument);
    return this.http
      .put<RestKnowledgeDocument>(`${this.resourceUrl}/${encodeURIComponent(this.getKnowledgeDocumentIdentifier(knowledgeDocument))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(knowledgeDocument: PartialUpdateKnowledgeDocument): Observable<IKnowledgeDocument> {
    const copy = this.convertValueFromClient(knowledgeDocument);
    return this.http
      .patch<RestKnowledgeDocument>(
        `${this.resourceUrl}/${encodeURIComponent(this.getKnowledgeDocumentIdentifier(knowledgeDocument))}`,
        copy,
      )
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IKnowledgeDocument> {
    return this.http
      .get<RestKnowledgeDocument>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IKnowledgeDocument[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestKnowledgeDocument[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getKnowledgeDocumentIdentifier(knowledgeDocument: Pick<IKnowledgeDocument, 'id'>): number {
    return knowledgeDocument.id;
  }

  compareKnowledgeDocument(o1: Pick<IKnowledgeDocument, 'id'> | null, o2: Pick<IKnowledgeDocument, 'id'> | null): boolean {
    return o1 && o2 ? this.getKnowledgeDocumentIdentifier(o1) === this.getKnowledgeDocumentIdentifier(o2) : o1 === o2;
  }

  addKnowledgeDocumentToCollectionIfMissing<Type extends Pick<IKnowledgeDocument, 'id'>>(
    knowledgeDocumentCollection: Type[],
    ...knowledgeDocumentsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const knowledgeDocuments: Type[] = knowledgeDocumentsToCheck.filter(isPresent);
    if (knowledgeDocuments.length > 0) {
      const knowledgeDocumentCollectionIdentifiers = knowledgeDocumentCollection.map(knowledgeDocumentItem =>
        this.getKnowledgeDocumentIdentifier(knowledgeDocumentItem),
      );
      const knowledgeDocumentsToAdd = knowledgeDocuments.filter(knowledgeDocumentItem => {
        const knowledgeDocumentIdentifier = this.getKnowledgeDocumentIdentifier(knowledgeDocumentItem);
        if (knowledgeDocumentCollectionIdentifiers.includes(knowledgeDocumentIdentifier)) {
          return false;
        }
        knowledgeDocumentCollectionIdentifiers.push(knowledgeDocumentIdentifier);
        return true;
      });
      return [...knowledgeDocumentsToAdd, ...knowledgeDocumentCollection];
    }
    return knowledgeDocumentCollection;
  }

  protected convertValueFromClient<T extends IKnowledgeDocument | NewKnowledgeDocument | PartialUpdateKnowledgeDocument>(
    knowledgeDocument: T,
  ): RestOf<T> {
    return {
      ...knowledgeDocument,
      indexedAt: knowledgeDocument.indexedAt?.toJSON() ?? null,
      createdAt: knowledgeDocument.createdAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestKnowledgeDocument): IKnowledgeDocument {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestKnowledgeDocument[]): IKnowledgeDocument[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
