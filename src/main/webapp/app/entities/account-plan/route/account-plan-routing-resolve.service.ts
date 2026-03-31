import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IAccountPlan } from '../account-plan.model';
import { AccountPlanService } from '../service/account-plan.service';

const accountPlanResolve = (route: ActivatedRouteSnapshot): Observable<null | IAccountPlan> => {
  const id = route.params.id;
  if (id) {
    return inject(AccountPlanService)
      .find(id)
      .pipe(
        mergeMap((accountPlan: HttpResponse<IAccountPlan>) => {
          if (accountPlan.body) {
            return of(accountPlan.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default accountPlanResolve;
