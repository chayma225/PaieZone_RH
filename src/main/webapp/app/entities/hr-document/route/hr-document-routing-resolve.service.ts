import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IHrDocument } from '../hr-document.model';
import { HrDocumentService } from '../service/hr-document.service';

const hrDocumentResolve = (route: ActivatedRouteSnapshot): Observable<null | IHrDocument> => {
  const id = route.params.id;
  if (id) {
    return inject(HrDocumentService)
      .find(id)
      .pipe(
        mergeMap((hrDocument: HttpResponse<IHrDocument>) => {
          if (hrDocument.body) {
            return of(hrDocument.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default hrDocumentResolve;
