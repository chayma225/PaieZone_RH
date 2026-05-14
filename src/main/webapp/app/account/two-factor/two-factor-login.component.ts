import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SessionStorageService } from 'ngx-webstorage';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { AccountService } from 'app/core/auth/account.service';
import { StateStorageService } from 'app/core/auth/state-storage.service';

@Component({
  standalone: true,
  selector: 'jhi-2fa-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './two-factor-login.component.html',
})
export class TwoFactorLoginComponent {
  otpCode = '';
  error = false;
  isLoading = false;

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly sessionStorageService = inject(SessionStorageService);
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly accountService = inject(AccountService);
  private readonly stateStorageService = inject(StateStorageService);

  confirmCode(): void {
    if (this.otpCode.length !== 6) return;

    this.isLoading = true;
    this.error = false;

    const login = this.sessionStorageService.retrieve('2fa_login');
    const rememberMe = this.sessionStorageService.retrieve('2fa_remember');

    console.log('Tentative de validation pour:', login, 'avec le code:', this.otpCode);

    this.http
      .post<any>(this.applicationConfigService.getEndpointFor('api/verify-2fa'), {
        login: login,
        code: this.otpCode,
      })
      .subscribe({
        next: res => {
          const token = res.id_token;

          if (token) {
            // Stocker avec la bonne clé (pz-authenticationToken via StateStorageService)
            this.stateStorageService.storeAuthenticationToken(token, rememberMe ?? false);

            // Nettoyage
            this.sessionStorageService.clear('2fa_login');
            this.sessionStorageService.clear('2fa_remember');

            // Forcer la récupération de l'utilisateur et rediriger
            this.accountService.identity(true).subscribe({
              next: () => this.router.navigate(['/']),
              error: () => this.router.navigate(['/']),
            });
          } else {
            this.isLoading = false;
            this.error = true;
          }
        },
        error: err => {
          console.error('Erreur API verify-2fa:', err);
          this.error = true;
          this.isLoading = false;
        },
      });
  }
}
