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
      .reveal {
        background: transparent;
        border: 0;
        color: rgba(250, 250, 247, 0.4);
        cursor: pointer;
        padding: 4px;
        border-radius: 8px;
        display: grid;
        place-items: center;
        transition: all 0.15s;
      }
      .reveal:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
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
        background: rgba(255, 255, 255, 0.12);
        overflow: hidden;
      }
      .strength-fill {
        height: 100%;
        border-radius: 2px;
        transition:
          width 0.3s,
          background 0.3s;
      }
      .strength-fill.weak {
        background: #ef4444;
      }
      .strength-fill.fair {
        background: #f97316;
      }
      .strength-fill.good {
        background: #eab308;
      }
      .strength-fill.strong {
        background: #22c55e;
      }
      .strength-label {
        font-size: 11px;
        font-weight: 600;
        min-width: 48px;
        text-align: right;
      }
      .strength-label.weak {
        color: #ef4444;
      }
      .strength-label.fair {
        color: #f97316;
      }
      .strength-label.good {
        color: #eab308;
      }
      .strength-label.strong {
        color: #22c55e;
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
