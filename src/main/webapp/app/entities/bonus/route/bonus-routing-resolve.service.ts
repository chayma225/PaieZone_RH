import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IBonus } from '../bonus.model';
import { BonusService } from '../service/bonus.service';

const bonusResolve = (route: ActivatedRouteSnapshot): Observable<null | IBonus> => {
  const id = route.params.id;
  if (id) {
    return inject(BonusService)
      .find(id)
      .pipe(
        mergeMap((bonus: HttpResponse<IBonus>) => {
          if (bonus.body) {
            return of(bonus.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default bonusResolve;
