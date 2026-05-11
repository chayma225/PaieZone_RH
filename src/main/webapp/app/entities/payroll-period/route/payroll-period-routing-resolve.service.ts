import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { IPayrollPeriod } from '../payroll-period.model';
import { PayrollPeriodService } from '../service/payroll-period.service';

const resolve: ResolveFn<IPayrollPeriod | null> = (
  route: ActivatedRouteSnapshot,
): Observable<IPayrollPeriod | null> => {
  const id = route.paramMap.get('id');
  if (id) {
    return inject(PayrollPeriodService)
      .find(+id)
      .pipe(
        mergeMap((res: HttpResponse<IPayrollPeriod>) => {
          if (res.body) return of(res.body);
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default resolve;
