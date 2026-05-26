import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { AccountService } from 'app/core/auth/account.service';
import IconComponent from '../../core/icon/icon.component';

@Component({
  selector: 'pz-twofa-setup',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page" style="max-width:720px;margin:0 auto">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>Mon compte</strong> <span class="sep">/</span> Double authentification</div>
          <h1>Sécurité du compte</h1>
          <div class="pz-muted">Protégez votre compte avec la vérification en deux étapes</div>
        </div>
      </div>

      @if (loading()) {
        <div class="pz-card" style="padding:48px;text-align:center;color:var(--pz-muted)">
          <span class="spinner"></span>
          <span style="margin-left:10px">Chargement…</span>
        </div>
      } @else {
        <!-- Hero card 2FA -->
        <div class="pz-card hero-card" [class.hero-enabled]="enabled()">
          <div class="hero-inner">
            <div class="status-icon" [class.on]="enabled()">
              <pz-icon [name]="enabled() ? 'Shield' : 'ShieldOff'" [size]="28" [strokeWidth]="1.5" />
            </div>
            <div class="hero-text">
              <div class="hero-title">
                Double authentification (2FA)
                <span class="pz-pill" [class.pos]="enabled()" [class.danger]="!enabled()">
                  {{ enabled() ? 'Activée' : 'Désactivée' }}
                </span>
              </div>
              <div class="hero-sub">
                @if (enabled()) {
                  À chaque connexion, un code à usage unique vous sera envoyé à l'adresse
                  <strong>{{ email() ?? 'votre email' }}</strong
                  >.
                } @else {
                  Activez la 2FA pour sécuriser votre compte. Un code sera envoyé à
                  <strong>{{ email() ?? 'votre email' }}</strong> à chaque connexion.
                }
              </div>
            </div>
            <div class="hero-action">
              @if (enabled()) {
                <button class="pz-btn pz-danger" [disabled]="busy()" (click)="disable()">
                  @if (busy()) {
                    <span class="spinner sm"></span>
                  } @else {
                    <pz-icon name="ShieldOff" [size]="14" />
                  }
                  Désactiver la 2FA
                </button>
              } @else {
                <button class="pz-btn pz-primary" [disabled]="busy()" (click)="enable()">
                  @if (busy()) {
                    <span class="spinner sm"></span>
                  } @else {
                    <pz-icon name="Shield" [size]="14" />
                  }
                  Activer la 2FA
                </button>
              }
            </div>
          </div>

          @if (successMsg()) {
            <div class="feedback pos">
              <pz-icon name="Check" [size]="14" [strokeWidth]="2" />
              {{ successMsg() }}
            </div>
          }
          @if (errMsg()) {
            <div class="feedback neg">
              <pz-icon name="CircleHelp" [size]="14" />
              {{ errMsg() }}
            </div>
          }
        </div>

        <!-- How it works -->
        <div class="pz-card info-card">
          <div class="card-head"><div class="card-title">Comment fonctionne la 2FA ?</div></div>
          <div class="card-body">
            <div class="steps">
              <div class="step-row">
                <div class="step-num">1</div>
                <div>
                  <div class="step-title">Connexion habituelle</div>
                  <div class="step-desc">Saisissez votre email et votre mot de passe normalement.</div>
                </div>
              </div>
              <div class="step-row">
                <div class="step-num">2</div>
                <div>
                  <div class="step-title">Code de vérification par email</div>
                  <div class="step-desc">
                    Un code à 6 chiffres est automatiquement envoyé à <strong>{{ email() ?? 'votre email' }}</strong
                    >.
                  </div>
                </div>
              </div>
              <div class="step-row">
                <div class="step-num">3</div>
                <div>
                  <div class="step-title">Accès sécurisé</div>
                  <div class="step-desc">Saisissez le code reçu pour accéder à votre espace. Le code expire après 10 minutes.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="actions-row">
          <a class="pz-btn" routerLink="/paiezone">
            <pz-icon name="Arrow" [size]="13" style="transform:rotate(180deg)" /> Retour au tableau de bord
          </a>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .hero-card {
        border: 1px solid var(--pz-line);
        transition: border-color 0.2s;
      }
      .hero-card.hero-enabled {
        border-color: rgba(34, 197, 94, 0.35);
        background: linear-gradient(to bottom right, var(--pz-surface), rgba(34, 197, 94, 0.04));
      }

      .hero-inner {
        display: flex;
        align-items: flex-start;
        gap: 20px;
        padding: 28px;
      }

      .status-icon {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        background: rgba(251, 113, 133, 0.12);
        border: 1px solid rgba(251, 113, 133, 0.25);
        color: #fb7185;
        display: grid;
        place-items: center;
        flex-shrink: 0;
        transition: all 0.2s;
      }
      .status-icon.on {
        background: rgba(34, 197, 94, 0.1);
        border-color: rgba(34, 197, 94, 0.3);
        color: #22c55e;
      }

      .hero-text {
        flex: 1;
      }
      .hero-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--pz-ink);
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .hero-sub {
        font-size: 13.5px;
        color: var(--pz-muted);
        line-height: 1.55;
        strong {
          color: var(--pz-ink-2);
        }
      }

      .hero-action {
        flex-shrink: 0;
      }

      .feedback {
        margin: 0 28px 16px;
        padding: 11px 14px;
        border-radius: 10px;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .feedback.pos {
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.25);
        color: #22c55e;
      }
      .feedback.neg {
        background: rgba(251, 113, 133, 0.1);
        border: 1px solid rgba(251, 113, 133, 0.25);
        color: #fb7185;
      }

      .pz-pill.pos {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
        border: 1px solid rgba(34, 197, 94, 0.25);
      }
      .pz-pill.danger {
        background: rgba(251, 113, 133, 0.1);
        color: #fb7185;
        border: 1px solid rgba(251, 113, 133, 0.2);
      }

      .pz-btn.pz-danger {
        border: 1px solid rgba(251, 113, 133, 0.35);
        color: #fb7185;
        background: rgba(251, 113, 133, 0.08);
      }
      .pz-btn.pz-danger:hover:not([disabled]) {
        background: rgba(251, 113, 133, 0.14);
        border-color: rgba(251, 113, 133, 0.5);
      }

      .info-card .card-body {
        padding: 0 20px 20px;
      }

      .steps {
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .step-row {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 18px 0;
        border-bottom: 1px solid var(--pz-line);
      }
      .step-row:last-child {
        border-bottom: 0;
      }
      .step-num {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--pz-primary-soft);
        color: var(--pz-primary);
        font-size: 13px;
        font-weight: 700;
        display: grid;
        place-items: center;
        flex-shrink: 0;
      }
      .step-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--pz-ink);
        margin-bottom: 4px;
      }
      .step-desc {
        font-size: 13px;
        color: var(--pz-muted);
        line-height: 1.5;
        strong {
          color: var(--pz-ink-2);
        }
      }

      .actions-row {
        display: flex;
        gap: 10px;
        margin-top: 8px;
      }

      .spinner {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid var(--pz-line);
        border-top-color: var(--pz-primary);
        animation: spin 0.7s linear infinite;
        display: inline-block;
      }
      .spinner.sm {
        width: 14px;
        height: 14px;
        border-width: 2px;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 640px) {
        .hero-inner {
          flex-direction: column;
          gap: 16px;
        }
        .hero-action {
          width: 100%;
        }
        .hero-action button {
          width: 100%;
        }
      }
    `,
  ],
})
export default class TwoFaSetupComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(ApplicationConfigService);
  private readonly accountService = inject(AccountService);

  protected readonly loading = signal(true);
  protected readonly enabled = signal(false);
  protected readonly busy = signal(false);
  protected readonly successMsg = signal('');
  protected readonly errMsg = signal('');
  protected readonly email = signal<string | null>(null);

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => {
      if (account) {
        this.email.set(account.email ?? null);
      }
    });

    this.http.get<{ twoFactorEnabled: boolean }>(this.appConfig.getEndpointFor('api/2fa/status')).subscribe({
      next: res => {
        this.enabled.set(res.twoFactorEnabled);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  enable(): void {
    this.busy.set(true);
    this.errMsg.set('');
    this.successMsg.set('');

    this.http.post<{ message: string }>(this.appConfig.getEndpointFor('api/2fa/enable'), {}).subscribe({
      next: () => {
        this.enabled.set(true);
        this.busy.set(false);
        this.successMsg.set('La double authentification a été activée. Votre email recevra un code à chaque connexion.');
      },
      error: () => {
        this.busy.set(false);
        this.errMsg.set("Impossible d'activer la 2FA. Veuillez réessayer.");
      },
    });
  }

  disable(): void {
    this.busy.set(true);
    this.errMsg.set('');
    this.successMsg.set('');

    this.http.delete<{ message: string }>(this.appConfig.getEndpointFor('api/2fa/disable')).subscribe({
      next: () => {
        this.enabled.set(false);
        this.busy.set(false);
        this.successMsg.set('La double authentification a été désactivée.');
      },
      error: () => {
        this.busy.set(false);
        this.errMsg.set('Impossible de désactiver la 2FA. Veuillez réessayer.');
      },
    });
  }
}
