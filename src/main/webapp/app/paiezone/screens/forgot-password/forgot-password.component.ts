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
        max-width: 420px;
      }

      .auth-card {
        background: var(--pz-surface);
        border-radius: 18px;
        box-shadow: var(--pz-shadow-xl);
        border: 1px solid var(--pz-line);
        padding: 40px 36px;
        animation: cardIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      }

      @keyframes cardIn {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .back-link {
        margin-bottom: 24px;
        a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--pz-muted);
          text-decoration: none;
          font-weight: 500;
          &:hover {
            color: var(--pz-ink);
          }
        }
      }

      .card-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: var(--pz-primary-soft);
        color: var(--pz-primary);
        display: grid;
        place-items: center;
        margin-bottom: 20px;
      }

      h1 {
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.025em;
        margin: 0 0 8px;
        color: var(--pz-ink);
      }

      .sub {
        font-size: 14px;
        color: var(--pz-muted);
        margin: 0 0 28px;
        line-height: 1.6;
      }

      .alert {
        padding: 12px 14px;
        border-radius: 10px;
        font-size: 13px;
        margin-bottom: 20px;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        line-height: 1.5;
        &.error {
          background: var(--pz-danger-soft);
          color: var(--pz-danger-ink);
          align-items: center;
        }
        &.success {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        }
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        label {
          font-size: 13px;
          font-weight: 500;
          color: var(--pz-ink-3);
        }
      }

      .input-wrap {
        display: flex;
        align-items: center;
        height: 44px;
        padding: 0 12px;
        border: 1px solid var(--pz-line);
        border-radius: 10px;
        background: var(--pz-surface);
        gap: 10px;
        transition: all 0.12s;
        &:focus-within {
          border-color: var(--pz-primary);
          box-shadow: 0 0 0 3px var(--pz-primary-soft);
        }
        &.error {
          border-color: var(--pz-danger);
          background: var(--pz-danger-soft);
        }
        pz-icon {
          color: var(--pz-muted);
          flex-shrink: 0;
        }
        input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 14px;
          color: var(--pz-ink);
          font-family: inherit;
          &::placeholder {
            color: var(--pz-muted-2);
          }
        }
      }

      .pz-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        height: 36px;
        padding: 0 14px;
        border-radius: 8px;
        border: 1px solid var(--pz-line);
        background: var(--pz-surface);
        color: var(--pz-ink-2);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.12s;
        font-family: inherit;
        &.full {
          width: 100%;
        }
        &.lg {
          height: 46px;
          font-size: 14px;
          font-weight: 600;
        }
        &.pz-primary {
          background: var(--pz-primary);
          color: #fff;
          border-color: var(--pz-primary);
          box-shadow: 0 1px 2px rgba(79, 70, 229, 0.15);
          &:hover {
            background: var(--pz-primary-2);
          }
        }
        &[disabled] {
          opacity: 0.7;
          cursor: not-allowed;
        }
      }

      .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
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
