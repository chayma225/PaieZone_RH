import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ILeaveType } from '../leave-type.model';
import { LeaveTypeService } from '../service/leave-type.service';

const leaveTypeResolve = (route: ActivatedRouteSnapshot): Observable<null | ILeaveType> => {
  const id = route.params.id;
  if (id) {
    return inject(LeaveTypeService)
      .find(id)
      .pipe(
        mergeMap((leaveType: HttpResponse<ILeaveType>) => {
          if (leaveType.body) {
            return of(leaveType.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default leaveTypeResolve;
