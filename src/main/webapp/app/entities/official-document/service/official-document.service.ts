import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IOfficialDocument, NewOfficialDocument } from '../official-document.model';

export type PartialUpdateOfficialDocument = Partial<IOfficialDocument> & Pick<IOfficialDocument, 'id'>;

type RestOf<T extends IOfficialDocument | NewOfficialDocument> = Omit<T, 'generatedAt' | 'sentAt'> & {
  generatedAt?: string | null;
  sentAt?: string | null;
};

export type RestOfficialDocument = RestOf<IOfficialDocument>;

export type NewRestOfficialDocument = RestOf<NewOfficialDocument>;

export type PartialUpdateRestOfficialDocument = RestOf<PartialUpdateOfficialDocument>;

export type EntityResponseType = HttpResponse<IOfficialDocument>;
export type EntityArrayResponseType = HttpResponse<IOfficialDocument[]>;

@Injectable({ providedIn: 'root' })
export class OfficialDocumentService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/official-documents');

  create(officialDocument: NewOfficialDocument): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(officialDocument);
    return this.http
      .post<RestOfficialDocument>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(officialDocument: IOfficialDocument): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(officialDocument);
    return this.http
      .put<RestOfficialDocument>(`${this.resourceUrl}/${this.getOfficialDocumentIdentifier(officialDocument)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(officialDocument: PartialUpdateOfficialDocument): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(officialDocument);
    return this.http
      .patch<RestOfficialDocument>(`${this.resourceUrl}/${this.getOfficialDocumentIdentifier(officialDocument)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestOfficialDocument>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestOfficialDocument[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
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

  protected convertDateFromClient<T extends IOfficialDocument | NewOfficialDocument | PartialUpdateOfficialDocument>(
    officialDocument: T,
  ): RestOf<T> {
    return {
      ...officialDocument,
      generatedAt: officialDocument.generatedAt?.toJSON() ?? null,
      sentAt: officialDocument.sentAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restOfficialDocument: RestOfficialDocument): IOfficialDocument {
    return {
      ...restOfficialDocument,
      generatedAt: restOfficialDocument.generatedAt ? dayjs(restOfficialDocument.generatedAt) : undefined,
      sentAt: restOfficialDocument.sentAt ? dayjs(restOfficialDocument.sentAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestOfficialDocument>): HttpResponse<IOfficialDocument> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestOfficialDocument[]>): HttpResponse<IOfficialDocument[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
