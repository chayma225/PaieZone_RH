import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPayrollPeriod } from '../payroll-period.model';
import { PayrollPeriodService } from '../service/payroll-period.service';

const payrollPeriodResolve = (route: ActivatedRouteSnapshot): Observable<null | IPayrollPeriod> => {
  const id = route.params.id;
  if (id) {
    return inject(PayrollPeriodService)
      .find(id)
      .pipe(
        mergeMap((payrollPeriod: HttpResponse<IPayrollPeriod>) => {
          if (payrollPeriod.body) {
            return of(payrollPeriod.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default payrollPeriodResolve;
