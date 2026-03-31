import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IOfficialDocument } from '../official-document.model';
import { OfficialDocumentService } from '../service/official-document.service';

const officialDocumentResolve = (route: ActivatedRouteSnapshot): Observable<null | IOfficialDocument> => {
  const id = route.params.id;
  if (id) {
    return inject(OfficialDocumentService)
      .find(id)
      .pipe(
        mergeMap((officialDocument: HttpResponse<IOfficialDocument>) => {
          if (officialDocument.body) {
            return of(officialDocument.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default officialDocumentResolve;
