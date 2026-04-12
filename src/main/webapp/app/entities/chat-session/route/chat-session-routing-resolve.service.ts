import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { EMPTY, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { IChatSession } from '../chat-session.model';
import { ChatSessionService } from '../service/chat-session.service';

const chatSessionResolve = (route: ActivatedRouteSnapshot): Observable<null | IChatSession> => {
  const id = route.params.id;
  if (id) {
    const router = inject(Router);
    const service = inject(ChatSessionService);
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

export default chatSessionResolve;
