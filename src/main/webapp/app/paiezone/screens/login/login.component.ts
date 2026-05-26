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
import { DataService } from '../../core/data.service';

@Component({
  selector: 'pz-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './login.component.html',
  styles: [
    `
      /* ── Card ── */
      .auth-card {
        width: 100%;
        max-width: 480px;
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
        position: relative;
        color: #fafaf7;
      }

      /* ── Eyebrow ── */
      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 11.5px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #fff;
        font-weight: 700;
        margin-bottom: 22px;
        padding: 5px 14px 5px 5px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 999px;
      }
      .ey-num {
        background: #c4b5fd;
        color: #0e0420;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: inline-grid;
        place-items: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10.5px;
        font-weight: 800;
      }

      /* ── Title ── */
      h1 {
        font-size: 38px;
        font-weight: 700;
        letter-spacing: -0.035em;
        line-height: 1.05;
        margin: 0 0 14px;
        color: #fff;
      }
      h1 em {
        font-style: italic;
        font-family: 'Instrument Serif', 'Times New Roman', serif;
        color: #c4b5fd;
        font-weight: 400;
        letter-spacing: -0.005em;
      }
      .lead {
        font-size: 14.5px;
        color: rgba(250, 250, 247, 0.7);
        line-height: 1.55;
        margin: 0 0 28px;
      }
      .lead strong {
        color: #fff;
        font-weight: 600;
      }

      /* ── Error ── */
      .err-alert {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        margin-bottom: 16px;
        background: rgba(251, 113, 133, 0.12);
        border: 1px solid rgba(251, 113, 133, 0.3);
        border-radius: 12px;
        font-size: 13px;
        color: #fda4af;
      }

      /* ── Form ── */
      .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
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
      .req {
        color: #c4b5fd;
        margin-left: 2px;
      }

      /* Input */
      .input-wrap {
        height: 50px;
        display: flex;
        align-items: center;
        padding: 0 18px;
        gap: 12px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.04);
        transition: all 0.2s ease;
      }
      .input-wrap:focus-within {
        border-color: #c4b5fd;
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 0 4px rgba(196, 181, 253, 0.15);
      }
      .input-wrap.is-err {
        border-color: rgba(251, 113, 133, 0.5);
      }
      .input-wrap.is-err:focus-within {
        border-color: #fb7185;
        box-shadow: 0 0 0 4px rgba(251, 113, 133, 0.15);
      }
      .ico {
        color: rgba(250, 250, 247, 0.4);
        display: grid;
        place-items: center;
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
        color: rgba(250, 250, 247, 0.4);
        display: grid;
        place-items: center;
        border-radius: 8px;
        padding: 4px;
        border: 0;
        background: transparent;
        cursor: pointer;
        transition: all 0.15s;
      }
      .reveal:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }

      /* Remember + forgot */
      .row-btw {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 2px;
      }
      .chk {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        user-select: none;
        font-size: 13px;
        color: rgba(250, 250, 247, 0.7);
      }
      .chk input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }
      .chk-box {
        width: 18px;
        height: 18px;
        border-radius: 5px;
        border: 1.5px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.05);
        display: grid;
        place-items: center;
        color: transparent;
        transition: all 0.15s;
        flex-shrink: 0;
      }
      .chk input:checked + .chk-box {
        background: #c4b5fd;
        border-color: #c4b5fd;
        color: #0e0420;
      }
      .link-pale {
        color: #c4b5fd;
        font-weight: 600;
        font-size: 13px;
        transition: color 0.15s;
        text-decoration: none;
      }
      .link-pale:hover {
        color: #fff;
      }

      /* Submit button */
      .btn-submit {
        width: 100%;
        height: 52px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border-radius: 999px;
        border: none;
        cursor: pointer;
        background: linear-gradient(135deg, #fff, #ddd6fe);
        color: #0e0420;
        font-size: 15px;
        font-weight: 700;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        box-shadow: 0 10px 30px rgba(196, 181, 253, 0.3);
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
        margin-top: 6px;
      }
      .btn-submit:hover:not(:disabled) {
        box-shadow: 0 14px 40px rgba(196, 181, 253, 0.5);
        transform: translateY(-2px);
      }
      .btn-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
      .btn-submit::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        transition: left 0.6s;
      }
      .btn-submit:hover:not(:disabled)::after {
        left: 100%;
      }
      .arr {
        transition: transform 0.2s;
      }
      .btn-submit:hover .arr {
        transform: translateX(3px);
      }

      /* Spinner */
      .spin {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid rgba(14, 4, 32, 0.3);
        border-top-color: #0e0420;
        animation: spin 0.7s linear infinite;
        flex-shrink: 0;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Card footer */
      .card-foot {
        margin-top: 24px;
        text-align: center;
        font-size: 13.5px;
        color: rgba(250, 250, 247, 0.6);
      }
      .card-foot a {
        color: #c4b5fd;
        font-weight: 600;
        margin-left: 4px;
        transition: color 0.15s;
      }
      .card-foot a:hover {
        color: #fff;
      }

      @media (max-width: 640px) {
        .auth-card {
          padding: 32px 24px;
          border-radius: 22px;
        }
        h1 {
          font-size: 30px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionStorageService);
  private readonly authServer = inject(AuthServerProvider);
  private readonly accountService = inject(AccountService);
  private readonly appConfig = inject(ApplicationConfigService);
  private readonly data = inject(DataService);

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
          this.data.reset();
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
