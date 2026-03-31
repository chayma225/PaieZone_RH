import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IKnowledgeDocument } from '../knowledge-document.model';
import { KnowledgeDocumentService } from '../service/knowledge-document.service';

const knowledgeDocumentResolve = (route: ActivatedRouteSnapshot): Observable<null | IKnowledgeDocument> => {
  const id = route.params.id;
  if (id) {
    return inject(KnowledgeDocumentService)
      .find(id)
      .pipe(
        mergeMap((knowledgeDocument: HttpResponse<IKnowledgeDocument>) => {
          if (knowledgeDocument.body) {
            return of(knowledgeDocument.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default knowledgeDocumentResolve;
