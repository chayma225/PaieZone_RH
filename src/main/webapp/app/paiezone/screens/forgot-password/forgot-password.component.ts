import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import IconComponent from '../../core/icon/icon.component';

@Component({
  selector: 'pz-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-card">
      <div class="back-link">
        <a routerLink="/paiezone/login"> <pz-icon name="Arrow" [size]="13" style="transform:rotate(180deg)" /> Retour à la connexion </a>
      </div>

      <div class="card-icon">
        <pz-icon name="Lock" [size]="22" [strokeWidth]="1.5" />
      </div>

      <h1>Mot de passe oublié ?</h1>
      <p class="sub">Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>

      @if (success()) {
        <div class="alert success">
          <pz-icon name="Check" [size]="15" [strokeWidth]="2" />
          <div>
            <strong>Email envoyé !</strong><br />
            Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
          </div>
        </div>
        <a routerLink="/paiezone/login" class="pz-btn pz-primary full lg" style="margin-top:8px;text-decoration:none">
          Retour à la connexion
        </a>
      } @else {
        @if (errMsg()) {
          <div class="alert error">
            <pz-icon name="CircleHelp" [size]="14" />
            {{ errMsg() }}
          </div>
        }

        <form (submit)="$event.preventDefault(); submit()" class="form">
          <div class="field">
            <label for="email">Adresse email</label>
            <div class="input-wrap" [class.error]="emailError()">
              <pz-icon name="Mail" [size]="14" [strokeWidth]="1.4" />
              <input
                id="email"
                type="email"
                placeholder="votre@email.com"
                [(ngModel)]="email"
                name="email"
                required
                autocomplete="email"
                autofocus
              />
            </div>
          </div>

          <button type="submit" class="pz-btn pz-primary full lg" [disabled]="busy()">
            @if (busy()) {
              <span class="spinner"></span> Envoi en cours…
            } @else {
              Envoyer le lien <pz-icon name="Arrow" [size]="14" [strokeWidth]="1.6" />
            }
          </button>
        </form>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        max-width: 480px;
      }

      .auth-card {
        width: 100%;
        background: rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(40px) saturate(180%);
        -webkit-backdrop-filter: blur(40px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 28px;
        padding: 44px;
        box-shadow:
          0 50px 100px -20px rgba(0, 0, 0, 0.5),
          0 30px 60px -30px rgba(124, 58, 237, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        color: #fafaf7;
      }

      .back-link {
        margin-bottom: 24px;
      }
      .back-link a {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: rgba(250, 250, 247, 0.55);
        text-decoration: none;
        font-weight: 500;
        transition: color 0.15s;
      }
      .back-link a:hover {
        color: #fff;
      }

      .card-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: rgba(196, 181, 253, 0.15);
        border: 1px solid rgba(196, 181, 253, 0.3);
        color: #c4b5fd;
        display: grid;
        place-items: center;
        margin-bottom: 20px;
      }

      h1 {
        font-size: 32px;
        font-weight: 700;
        letter-spacing: -0.03em;
        margin: 0 0 10px;
        color: #fff;
        line-height: 1.1;
      }
      .sub {
        font-size: 14px;
        color: rgba(250, 250, 247, 0.65);
        margin: 0 0 28px;
        line-height: 1.6;
      }

      .alert {
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 13px;
        margin-bottom: 20px;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        line-height: 1.5;
      }
      .alert.error {
        background: rgba(251, 113, 133, 0.12);
        border: 1px solid rgba(251, 113, 133, 0.3);
        color: #fda4af;
        align-items: center;
      }
      .alert.success {
        background: rgba(74, 222, 128, 0.1);
        border: 1px solid rgba(74, 222, 128, 0.3);
        color: #86efac;
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .field label {
        font-size: 11.5px;
        font-weight: 600;
        color: rgba(250, 250, 247, 0.7);
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .input-wrap {
        height: 50px;
        display: flex;
        align-items: center;
        padding: 0 18px;
        gap: 12px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.04);
        transition: all 0.2s;
      }
      .input-wrap:focus-within {
        border-color: #c4b5fd;
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 0 4px rgba(196, 181, 253, 0.15);
      }
      .input-wrap.error {
        border-color: rgba(251, 113, 133, 0.5);
      }
      .input-wrap pz-icon {
        color: rgba(250, 250, 247, 0.4);
        flex-shrink: 0;
      }
      .input-wrap input {
        flex: 1;
        min-width: 0;
        border: 0;
        outline: 0;
        background: transparent;
        color: #fff;
        font-size: 14.5px;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      }
      .input-wrap input::placeholder {
        color: rgba(250, 250, 247, 0.3);
      }

      .pz-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        height: 36px;
        padding: 0 18px;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.2s;
      }
      .pz-btn.full {
        width: 100%;
      }
      .pz-btn.lg {
        height: 52px;
        font-size: 15px;
        font-weight: 700;
      }
      .pz-btn.pz-primary {
        background: linear-gradient(135deg, #fff, #ddd6fe);
        color: #0e0420;
        box-shadow: 0 10px 30px rgba(196, 181, 253, 0.3);
      }
      .pz-btn.pz-primary:hover:not([disabled]) {
        box-shadow: 0 14px 40px rgba(196, 181, 253, 0.5);
        transform: translateY(-2px);
      }
      .pz-btn[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .spinner {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid rgba(14, 4, 32, 0.3);
        border-top-color: #0e0420;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 640px) {
        .auth-card {
          padding: 32px 24px;
          border-radius: 22px;
        }
        h1 {
          font-size: 26px;
        }
      }
    `,
  ],
})
export default class ForgotPasswordComponent {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(ApplicationConfigService);

  protected email = '';
  protected readonly busy = signal(false);
  protected readonly success = signal(false);
  protected readonly errMsg = signal('');
  protected readonly emailError = signal(false);

  submit(): void {
    this.errMsg.set('');
    this.emailError.set(false);

    const trimmed = this.email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      this.emailError.set(true);
      this.errMsg.set('Veuillez saisir une adresse email valide.');
      return;
    }

    this.busy.set(true);
    this.http
      .post(this.appConfig.getEndpointFor('api/account/reset-password/init'), trimmed, {
        responseType: 'text',
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.success.set(true);
        },
        error: () => {
          this.busy.set(false);
          // On affiche toujours le succès pour ne pas révéler si l'email existe
          this.success.set(true);
        },
      });
  }
}
