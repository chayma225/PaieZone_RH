import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IRegulatoryParam } from '../regulatory-param.model';
import { RegulatoryParamService } from '../service/regulatory-param.service';

const regulatoryParamResolve = (route: ActivatedRouteSnapshot): Observable<null | IRegulatoryParam> => {
  const id = route.params.id;
  if (id) {
    return inject(RegulatoryParamService)
      .find(id)
      .pipe(
        mergeMap((regulatoryParam: HttpResponse<IRegulatoryParam>) => {
          if (regulatoryParam.body) {
            return of(regulatoryParam.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default regulatoryParamResolve;
