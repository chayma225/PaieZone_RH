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
  template: `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 80vh;">
      <div class="card shadow p-4" style="width: 400px; border-radius: 16px;">
        <div class="text-center mb-4">
          <h3 class="fw-bold">🔐 Sécurité PaieZone</h3>
          <p class="text-muted">Veuillez saisir le code de vérification à 6 chiffres envoyé à votre email.</p>
        </div>

        @if (error()) {
          <div class="alert alert-danger text-center">Code incorrect ! Veuillez réessayer.</div>
        }

        @if (expired()) {
          <div class="alert alert-warning text-center">Code expiré. <a href="#" (click)="resendCode($event)">Renvoyer un code</a></div>
        }

        @if (success()) {
          <div class="alert alert-success text-center">✅ Code vérifié ! Redirection...</div>
        }

        <div class="mb-3">
          <input
            type="text"
            class="form-control form-control-lg text-center"
            placeholder="_ _ _ _ _ _"
            maxlength="6"
            [(ngModel)]="otpCode"
            (keyup.enter)="confirmCode()"
            style="font-size: 2rem; letter-spacing: 0.5rem; border: 2px solid #0d6efd;"
          />
        </div>

        <button class="btn btn-primary w-100 btn-lg" (click)="confirmCode()" [disabled]="isLoading() || otpCode.length !== 6">
          @if (isLoading()) {
            <span class="spinner-border spinner-border-sm me-2"></span>
          }
          Vérifier et accéder au RH
        </button>

        <div class="text-center mt-3">
          <small class="text-muted">
            Vous n'avez pas reçu le code ?
            <a href="#" (click)="resendCode($event)">Renvoyer</a>
          </small>
        </div>
      </div>
    </div>
  `,
})
export class TwoFactorLoginComponent {
  otpCode = '';
  error = signal(false);
  expired = signal(false);
  success = signal(false);
  isLoading = signal(false);

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly sessionStorageService = inject(SessionStorageService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly accountService = inject(AccountService);

  confirmCode(): void {
    if (this.otpCode.length !== 6) return;

    this.isLoading.set(true);
    this.error.set(false);
    this.expired.set(false);

    const login = this.sessionStorageService.retrieve('2fa_login');
    const rememberMe = this.sessionStorageService.retrieve('2fa_remember');

    this.http.post<any>(this.applicationConfigService.getEndpointFor('api/verify-2fa'), { login, code: this.otpCode }).subscribe({
      next: res => {
        if (res.success) {
          this.success.set(true);
          // Récupérer le token stocké temporairement
          const token = this.sessionStorageService.retrieve('tempToken');
          if (rememberMe) {
            this.localStorageService.store('authenticationToken', token);
          } else {
            this.sessionStorageService.store('authenticationToken', token);
          }
          // Nettoyer
          this.sessionStorageService.clear('tempToken');
          this.sessionStorageService.clear('2fa_login');
          this.sessionStorageService.clear('2fa_remember');

          this.accountService.identity(true).subscribe(() => {
            setTimeout(() => this.router.navigate(['/']), 500);
          });
        } else {
          this.error.set(true);
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.error.set(true);
        this.isLoading.set(false);
      },
    });
  }

  resendCode(event: Event): void {
    event.preventDefault();
    const login = this.sessionStorageService.retrieve('2fa_login');
    this.http.post<any>(this.applicationConfigService.getEndpointFor('api/2fa/check'), { login }).subscribe(() => {
      this.error.set(false);
      this.expired.set(false);
      this.otpCode = '';
      alert('Un nouveau code a été envoyé à votre email !');
    });
  }
}
