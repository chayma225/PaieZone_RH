import { inject, Injector } from '@angular/core'; // Ajoute Injector
import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { LoginService } from 'app/login/login.service';

export const authExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector); // Injecte l'injecteur global

  return next(req).pipe(
    tap({
      error: (err: any) => {
        if (err.status === 401 && err.url && !err.url.includes('api/account')) {
          // Récupère le LoginService seulement au moment de l'erreur
          const loginService = injector.get(LoginService);
          loginService.logout();
        }
      },
    }),
  );
};
