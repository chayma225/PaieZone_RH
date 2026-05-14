import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SessionStorageService } from 'ngx-webstorage';

import { AccountService } from 'app/core/auth/account.service';
import { AuthServerProvider } from 'app/core/auth/auth-jwt.service';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { Login } from './login.model';

interface AuthenticationResponse {
  id_token: string;
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(
    private accountService: AccountService,
    private authServerProvider: AuthServerProvider,
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService,
    private router: Router,
    private sessionStorageService: SessionStorageService,
  ) {}

  login(credentials: Login): Observable<void> {
    return this.http.post<AuthenticationResponse>(this.applicationConfigService.getEndpointFor('api/authenticate'), credentials).pipe(
      mergeMap(response => {
        if (response.id_token === '2FA_REQUIRED') {
          // Stocker avec ngx-webstorage pour que TwoFactorLoginComponent puisse le lire
          this.sessionStorageService.store('2fa_login', credentials.username);
          this.sessionStorageService.store('2fa_remember', credentials.rememberMe);
          this.router.navigate(['/account/2fa-login']);
          return new Observable<void>(subscriber => subscriber.complete());
        }

        return this.authServerProvider.login(credentials).pipe(mergeMap(() => this.accountService.identity(true)));
      }),
      map(() => {}),
    );
  }

  logout(): void {
    this.authServerProvider.logout().subscribe({ complete: () => this.accountService.authenticate(null) });
  }
}
