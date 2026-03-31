import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IAccountingEntry } from '../accounting-entry.model';
import { AccountingEntryService } from '../service/accounting-entry.service';

const accountingEntryResolve = (route: ActivatedRouteSnapshot): Observable<null | IAccountingEntry> => {
  const id = route.params.id;
  if (id) {
    return inject(AccountingEntryService)
      .find(id)
      .pipe(
        mergeMap((accountingEntry: HttpResponse<IAccountingEntry>) => {
          if (accountingEntry.body) {
            return of(accountingEntry.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default accountingEntryResolve;
