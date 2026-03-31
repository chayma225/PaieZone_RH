import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IRubrique } from '../rubrique.model';
import { RubriqueService } from '../service/rubrique.service';

const rubriqueResolve = (route: ActivatedRouteSnapshot): Observable<null | IRubrique> => {
  const id = route.params.id;
  if (id) {
    return inject(RubriqueService)
      .find(id)
      .pipe(
        mergeMap((rubrique: HttpResponse<IRubrique>) => {
          if (rubrique.body) {
            return of(rubrique.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default rubriqueResolve;
