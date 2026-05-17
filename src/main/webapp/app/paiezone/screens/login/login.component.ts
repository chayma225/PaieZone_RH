import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SessionStorageService } from 'ngx-webstorage';

import { AccountService } from 'app/core/auth/account.service';
import { AuthServerProvider } from 'app/core/auth/auth-jwt.service';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import IconComponent from '../../core/icon/icon.component';

@Component({
  selector: 'pz-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionStorageService);
  private readonly authServer = inject(AuthServerProvider);
  private readonly accountService = inject(AccountService);
  private readonly appConfig = inject(ApplicationConfigService);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly remember = signal(true);
  protected readonly showPwd = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly emailError = signal(false);
  protected readonly pwdError = signal(false);

  submit(): void {
    this.error.set(null);
    this.emailError.set(false);
    this.pwdError.set(false);

    if (this.email().trim().length < 2) {
      this.emailError.set(true);
      this.error.set('Veuillez saisir votre identifiant.');
      return;
    }
    if (this.password().length < 4) {
      this.pwdError.set(true);
      this.error.set('Mot de passe trop court (4 caractères minimum).');
      return;
    }

    this.busy.set(true);

    this.http
      .post<{ id_token: string }>(this.appConfig.getEndpointFor('api/authenticate'), {
        username: this.email(),
        password: this.password(),
        rememberMe: this.remember(),
      })
      .subscribe({
        next: res => {
          if (res.id_token === '2FA_REQUIRED') {
            this.session.store('2fa_login', this.email());
            this.session.store('2fa_remember', this.remember());
            this.busy.set(false);
            this.router.navigate(['/paiezone/2fa']);
            return;
          }
          this.authServer.storeToken(res.id_token, this.remember());
          this.accountService.identity(true).subscribe(acc => {
            this.busy.set(false);
            const roles = acc?.authorities ?? [];
            if (roles.includes('ROLE_SUPER_ADMIN')) this.router.navigate(['/paiezone/saas-dash']);
            else if (roles.includes('ROLE_ADMIN')) this.router.navigate(['/paiezone/admin-dash']);
            else if (roles.includes('ROLE_EMPLOYE')) this.router.navigate(['/paiezone/emp-dash']);
            else this.router.navigate(['/paiezone/rh-dash']);
          });
        },
        error: err => {
          this.busy.set(false);
          if (err.status === 401) {
            this.emailError.set(true);
            this.pwdError.set(true);
            this.error.set('Email ou mot de passe incorrect.');
          } else {
            this.error.set('Erreur de connexion. Veuillez réessayer.');
          }
        },
      });
  }
}
