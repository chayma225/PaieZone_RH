import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IAdvance } from '../advance.model';
import { AdvanceService } from '../service/advance.service';

const advanceResolve = (route: ActivatedRouteSnapshot): Observable<null | IAdvance> => {
  const id = route.params.id;
  if (id) {
    return inject(AdvanceService)
      .find(id)
      .pipe(
        mergeMap((advance: HttpResponse<IAdvance>) => {
          if (advance.body) {
            return of(advance.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default advanceResolve;
