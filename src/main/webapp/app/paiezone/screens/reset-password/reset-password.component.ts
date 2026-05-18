import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import IconComponent from '../../core/icon/icon.component';

@Component({
  selector: 'pz-reset-password',
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

      <h1>Nouveau mot de passe</h1>
      <p class="sub">Choisissez un mot de passe sécurisé d'au moins 4 caractères.</p>

      @if (!key()) {
        <div class="alert error">
          <pz-icon name="CircleHelp" [size]="14" />
          Lien invalide ou expiré. Veuillez refaire une demande de réinitialisation.
        </div>
        <a routerLink="/paiezone/forgot-password" class="pz-btn pz-primary full lg" style="text-decoration:none;margin-top:8px">
          Refaire une demande
        </a>
      } @else if (success()) {
        <div class="alert success">
          <pz-icon name="Check" [size]="15" [strokeWidth]="2" />
          <div>
            <strong>Mot de passe mis à jour !</strong><br />
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </div>
        </div>
        <a routerLink="/paiezone/login" class="pz-btn pz-primary full lg" style="text-decoration:none;margin-top:8px">
          Se connecter <pz-icon name="Arrow" [size]="14" [strokeWidth]="1.6" />
        </a>
      } @else {
        @if (errMsg()) {
          <div class="alert error">
            <pz-icon name="CircleHelp" [size]="14" />
            {{ errMsg() }}
          </div>
        }

        <form (submit)="$event.preventDefault(); submit()" class="form">
          <!-- Nouveau mot de passe -->
          <div class="field">
            <label for="newPwd">Nouveau mot de passe</label>
            <div class="input-wrap" [class.error]="pwdError()">
              <pz-icon name="Lock" [size]="14" [strokeWidth]="1.4" />
              <input
                id="newPwd"
                [type]="showPwd() ? 'text' : 'password'"
                placeholder="••••••••••"
                [(ngModel)]="newPassword"
                name="newPassword"
                required
                autocomplete="new-password"
                autofocus
              />
              <button type="button" class="reveal" (click)="showPwd.set(!showPwd())">
                <pz-icon [name]="showPwd() ? 'X' : 'Eye'" [size]="14" [strokeWidth]="1.4" />
              </button>
            </div>
          </div>

          <!-- Confirmation -->
          <div class="field">
            <label for="confirmPwd">Confirmer le mot de passe</label>
            <div class="input-wrap" [class.error]="confirmError()">
              <pz-icon name="Lock" [size]="14" [strokeWidth]="1.4" />
              <input
                id="confirmPwd"
                [type]="showPwd() ? 'text' : 'password'"
                placeholder="••••••••••"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                required
                autocomplete="new-password"
              />
            </div>
          </div>

          <!-- Indicateur de force -->
          <div class="strength-bar">
            <div class="strength-track">
              <div class="strength-fill" [style.width.%]="strengthPct()" [class]="strengthClass()"></div>
            </div>
            <span class="strength-label" [class]="strengthClass()">{{ strengthLabel() }}</span>
          </div>

          <button type="submit" class="pz-btn pz-primary full lg" [disabled]="busy()">
            @if (busy()) {
              <span class="spinner"></span> Enregistrement…
            } @else {
              Enregistrer le mot de passe <pz-icon name="Check" [size]="14" [strokeWidth]="2" />
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
        .reveal {
          background: transparent;
          border: 0;
          color: var(--pz-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: grid;
          place-items: center;
          &:hover {
            background: var(--pz-surface-3);
            color: var(--pz-ink);
          }
        }
      }

      .strength-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: -6px;
      }
      .strength-track {
        flex: 1;
        height: 4px;
        border-radius: 2px;
        background: var(--pz-line);
        overflow: hidden;
      }
      .strength-fill {
        height: 100%;
        border-radius: 2px;
        transition:
          width 0.3s,
          background 0.3s;
        &.weak {
          background: #ef4444;
        }
        &.fair {
          background: #f97316;
        }
        &.good {
          background: #eab308;
        }
        &.strong {
          background: #22c55e;
        }
      }
      .strength-label {
        font-size: 11px;
        font-weight: 600;
        min-width: 48px;
        text-align: right;
        &.weak {
          color: #ef4444;
        }
        &.fair {
          color: #f97316;
        }
        &.good {
          color: #eab308;
        }
        &.strong {
          color: #22c55e;
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
export default class ResetPasswordComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(ApplicationConfigService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected newPassword = '';
  protected confirmPassword = '';
  protected readonly key = signal('');
  protected readonly busy = signal(false);
  protected readonly success = signal(false);
  protected readonly errMsg = signal('');
  protected readonly pwdError = signal(false);
  protected readonly confirmError = signal(false);
  protected readonly showPwd = signal(false);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.key.set(params['key'] ?? '');
    });
  }

  protected strengthPct(): number {
    const p = this.newPassword;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 4) score += 25;
    if (p.length >= 8) score += 25;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score += 25;
    if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) score += 25;
    return score;
  }

  protected strengthClass(): string {
    const p = this.strengthPct();
    if (p <= 25) return 'weak';
    if (p <= 50) return 'fair';
    if (p <= 75) return 'good';
    return 'strong';
  }

  protected strengthLabel(): string {
    const m: Record<string, string> = { weak: 'Faible', fair: 'Moyen', good: 'Bon', strong: 'Fort' };
    return m[this.strengthClass()] ?? '';
  }

  submit(): void {
    this.errMsg.set('');
    this.pwdError.set(false);
    this.confirmError.set(false);

    if (this.newPassword.length < 4) {
      this.pwdError.set(true);
      this.errMsg.set('Le mot de passe doit comporter au moins 4 caractères.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.confirmError.set(true);
      this.errMsg.set('Les deux mots de passe ne correspondent pas.');
      return;
    }

    this.busy.set(true);
    this.http
      .post(this.appConfig.getEndpointFor('api/account/reset-password/finish'), { key: this.key(), newPassword: this.newPassword })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.success.set(true);
        },
        error: () => {
          this.busy.set(false);
          this.errMsg.set('Lien expiré ou invalide. Veuillez refaire une demande de réinitialisation.');
        },
      });
  }
}
