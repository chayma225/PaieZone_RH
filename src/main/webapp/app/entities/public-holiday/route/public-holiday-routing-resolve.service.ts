import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPublicHoliday } from '../public-holiday.model';
import { PublicHolidayService } from '../service/public-holiday.service';

const publicHolidayResolve = (route: ActivatedRouteSnapshot): Observable<null | IPublicHoliday> => {
  const id = route.params.id;
  if (id) {
    return inject(PublicHolidayService)
      .find(id)
      .pipe(
        mergeMap((publicHoliday: HttpResponse<IPublicHoliday>) => {
          if (publicHoliday.body) {
            return of(publicHoliday.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default publicHolidayResolve;
