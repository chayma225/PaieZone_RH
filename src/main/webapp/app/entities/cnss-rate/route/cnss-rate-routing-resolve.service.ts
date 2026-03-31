import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ICnssRate } from '../cnss-rate.model';
import { CnssRateService } from '../service/cnss-rate.service';

const cnssRateResolve = (route: ActivatedRouteSnapshot): Observable<null | ICnssRate> => {
  const id = route.params.id;
  if (id) {
    return inject(CnssRateService)
      .find(id)
      .pipe(
        mergeMap((cnssRate: HttpResponse<ICnssRate>) => {
          if (cnssRate.body) {
            return of(cnssRate.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default cnssRateResolve;
