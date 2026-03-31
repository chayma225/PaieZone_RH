import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IChatSession } from '../chat-session.model';
import { ChatSessionService } from '../service/chat-session.service';

const chatSessionResolve = (route: ActivatedRouteSnapshot): Observable<null | IChatSession> => {
  const id = route.params.id;
  if (id) {
    return inject(ChatSessionService)
      .find(id)
      .pipe(
        mergeMap((chatSession: HttpResponse<IChatSession>) => {
          if (chatSession.body) {
            return of(chatSession.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default chatSessionResolve;
