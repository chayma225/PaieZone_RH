import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IEmployeeHistory } from '../employee-history.model';
import { EmployeeHistoryService } from '../service/employee-history.service';

const employeeHistoryResolve = (route: ActivatedRouteSnapshot): Observable<null | IEmployeeHistory> => {
  const id = route.params.id;
  if (id) {
    return inject(EmployeeHistoryService)
      .find(id)
      .pipe(
        mergeMap((employeeHistory: HttpResponse<IEmployeeHistory>) => {
          if (employeeHistory.body) {
            return of(employeeHistory.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default employeeHistoryResolve;
