import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ITaxBracket } from '../tax-bracket.model';
import { TaxBracketService } from '../service/tax-bracket.service';

const taxBracketResolve = (route: ActivatedRouteSnapshot): Observable<null | ITaxBracket> => {
  const id = route.params.id;
  if (id) {
    return inject(TaxBracketService)
      .find(id)
      .pipe(
        mergeMap((taxBracket: HttpResponse<ITaxBracket>) => {
          if (taxBracket.body) {
            return of(taxBracket.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default taxBracketResolve;
