import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { AccountService } from 'app/core/auth/account.service';

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
  private readonly localStorageService = inject(LocalStorageService);
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly accountService = inject(AccountService);

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
          console.log('Réponse reçue du serveur:', res);
          const token = res.id_token;

          if (token) {
            // Stockage du jeton final
            if (rememberMe) {
              this.localStorageService.store('authenticationToken', token);
            } else {
              this.sessionStorageService.store('authenticationToken', token);
            }

            // Nettoyage immédiat pour éviter les boucles
            this.sessionStorageService.clear('2fa_login');
            this.sessionStorageService.clear('2fa_remember');

            console.log('Jeton stocké, rafraîchissement de l identity...');

            // Forcer la récupération de l'utilisateur et rediriger
            this.accountService.identity(true).subscribe({
              next: () => {
                console.log('Utilisateur identifié, redirection vers l accueil...');
                this.router.navigate(['/']);
              },
              error: err => {
                console.error('Erreur lors de l identity:', err);
                this.router.navigate(['/']); // Redirection forcée même en cas d'erreur
              },
            });
          } else {
            console.error('Aucun id_token trouvé dans la réponse');
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
