import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IKnowledgeDocument, NewKnowledgeDocument } from '../knowledge-document.model';

export type PartialUpdateKnowledgeDocument = Partial<IKnowledgeDocument> & Pick<IKnowledgeDocument, 'id'>;

type RestOf<T extends IKnowledgeDocument | NewKnowledgeDocument> = Omit<T, 'indexedAt' | 'createdAt'> & {
  indexedAt?: string | null;
  createdAt?: string | null;
};

export type RestKnowledgeDocument = RestOf<IKnowledgeDocument>;

export type NewRestKnowledgeDocument = RestOf<NewKnowledgeDocument>;

export type PartialUpdateRestKnowledgeDocument = RestOf<PartialUpdateKnowledgeDocument>;

export type EntityResponseType = HttpResponse<IKnowledgeDocument>;
export type EntityArrayResponseType = HttpResponse<IKnowledgeDocument[]>;

@Injectable({ providedIn: 'root' })
export class KnowledgeDocumentService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/knowledge-documents');

  create(knowledgeDocument: NewKnowledgeDocument): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(knowledgeDocument);
    return this.http
      .post<RestKnowledgeDocument>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(knowledgeDocument: IKnowledgeDocument): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(knowledgeDocument);
    return this.http
      .put<RestKnowledgeDocument>(`${this.resourceUrl}/${this.getKnowledgeDocumentIdentifier(knowledgeDocument)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(knowledgeDocument: PartialUpdateKnowledgeDocument): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(knowledgeDocument);
    return this.http
      .patch<RestKnowledgeDocument>(`${this.resourceUrl}/${this.getKnowledgeDocumentIdentifier(knowledgeDocument)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestKnowledgeDocument>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestKnowledgeDocument[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
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

  protected convertDateFromClient<T extends IKnowledgeDocument | NewKnowledgeDocument | PartialUpdateKnowledgeDocument>(
    knowledgeDocument: T,
  ): RestOf<T> {
    return {
      ...knowledgeDocument,
      indexedAt: knowledgeDocument.indexedAt?.toJSON() ?? null,
      createdAt: knowledgeDocument.createdAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restKnowledgeDocument: RestKnowledgeDocument): IKnowledgeDocument {
    return {
      ...restKnowledgeDocument,
      indexedAt: restKnowledgeDocument.indexedAt ? dayjs(restKnowledgeDocument.indexedAt) : undefined,
      createdAt: restKnowledgeDocument.createdAt ? dayjs(restKnowledgeDocument.createdAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestKnowledgeDocument>): HttpResponse<IKnowledgeDocument> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestKnowledgeDocument[]>): HttpResponse<IKnowledgeDocument[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
