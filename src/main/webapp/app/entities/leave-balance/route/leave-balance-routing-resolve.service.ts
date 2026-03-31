import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ILeaveBalance } from '../leave-balance.model';
import { LeaveBalanceService } from '../service/leave-balance.service';

const leaveBalanceResolve = (route: ActivatedRouteSnapshot): Observable<null | ILeaveBalance> => {
  const id = route.params.id;
  if (id) {
    return inject(LeaveBalanceService)
      .find(id)
      .pipe(
        mergeMap((leaveBalance: HttpResponse<ILeaveBalance>) => {
          if (leaveBalance.body) {
            return of(leaveBalance.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default leaveBalanceResolve;
