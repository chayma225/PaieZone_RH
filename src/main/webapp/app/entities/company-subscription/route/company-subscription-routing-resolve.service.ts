import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ICompanySubscription } from '../company-subscription.model';
import { CompanySubscriptionService } from '../service/company-subscription.service';

const companySubscriptionResolve = (route: ActivatedRouteSnapshot): Observable<null | ICompanySubscription> => {
  const id = route.params.id;
  if (id) {
    return inject(CompanySubscriptionService)
      .find(id)
      .pipe(
        mergeMap((companySubscription: HttpResponse<ICompanySubscription>) => {
          if (companySubscription.body) {
            return of(companySubscription.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default companySubscriptionResolve;
