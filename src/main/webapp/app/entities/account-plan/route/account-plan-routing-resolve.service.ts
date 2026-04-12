import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { EMPTY, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { IAccountPlan } from '../account-plan.model';
import { AccountPlanService } from '../service/account-plan.service';

const accountPlanResolve = (route: ActivatedRouteSnapshot): Observable<null | IAccountPlan> => {
  const id = route.params.id;
  if (id) {
    const router = inject(Router);
    const service = inject(AccountPlanService);
    return service.find(id).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          router.navigate(['404']);
        } else {
          router.navigate(['error']);
        }
        return EMPTY;
      }),
    );
  }

  return of(null);
};

export default accountPlanResolve;
