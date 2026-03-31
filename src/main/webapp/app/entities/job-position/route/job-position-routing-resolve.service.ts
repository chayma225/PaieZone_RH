import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IJobPosition } from '../job-position.model';
import { JobPositionService } from '../service/job-position.service';

const jobPositionResolve = (route: ActivatedRouteSnapshot): Observable<null | IJobPosition> => {
  const id = route.params.id;
  if (id) {
    return inject(JobPositionService)
      .find(id)
      .pipe(
        mergeMap((jobPosition: HttpResponse<IJobPosition>) => {
          if (jobPosition.body) {
            return of(jobPosition.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default jobPositionResolve;
