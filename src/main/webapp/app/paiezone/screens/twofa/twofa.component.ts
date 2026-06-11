import { Component, ChangeDetectionStrategy, signal, inject, viewChildren, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SessionStorageService } from 'ngx-webstorage';

import { AccountService } from 'app/core/auth/account.service';
import { StateStorageService } from 'app/core/auth/state-storage.service';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'pz-twofa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './twofa.component.html',
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
        text-align: center;
        color: #fafaf7;
      }

      /* Eyebrow */
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

      .ico-circle {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: rgba(196, 181, 253, 0.15);
        border: 1px solid rgba(196, 181, 253, 0.3);
        color: #c4b5fd;
        display: grid;
        place-items: center;
        margin: 0 auto 20px;
      }

      h1 {
        font-size: 32px;
        font-weight: 700;
        letter-spacing: -0.035em;
        line-height: 1.05;
        margin: 0 0 12px;
        color: #fff;
      }
      h1 em {
        font-style: italic;
        font-family: 'Instrument Serif', 'Times New Roman', serif;
        color: #c4b5fd;
        font-weight: 400;
      }

      .sub {
        font-size: 14px;
        color: rgba(250, 250, 247, 0.65);
        margin: 0 0 28px;
        line-height: 1.55;
      }
      .sub strong {
        color: #fff;
        font-weight: 600;
      }

      /* Error */
      .err-alert {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 16px;
        margin-bottom: 16px;
        background: rgba(251, 113, 133, 0.12);
        border: 1px solid rgba(251, 113, 133, 0.3);
        border-radius: 12px;
        font-size: 13px;
        color: #fda4af;
      }

      /* OTP digits */
      .otp-row {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin: 8px 0 24px;
      }
      .otp-row input {
        width: 52px;
        height: 62px;
        border: 1.5px solid rgba(255, 255, 255, 0.35);
        border-radius: 14px;
        text-align: center;
        font-size: 26px;
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
        color: #0e0420;
        background: #fff;
        outline: 0;
        transition: all 0.15s;
        caret-color: #7c3aed;
      }
      .otp-row input:focus {
        border-color: #c4b5fd;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(196, 181, 253, 0.3);
        transform: translateY(-2px);
      }
      .otp-row input:disabled {
        opacity: 0.6;
      }
      .otp-row.is-err input {
        border-color: rgba(251, 113, 133, 0.5);
        animation: shake 0.3s;
      }
      .otp-row.is-ok input {
        border-color: #4ade80;
        background: rgba(74, 222, 128, 0.08);
        color: #4ade80;
      }
      @keyframes shake {
        0%,
        100% {
          transform: translateX(0);
        }
        25% {
          transform: translateX(-4px);
        }
        75% {
          transform: translateX(4px);
        }
      }

      /* Submit */
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
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        color: #fff;
        font-size: 15px;
        font-weight: 700;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        box-shadow: 0 10px 30px rgba(124, 58, 237, 0.35);
        transition: all 0.2s ease;
        margin-bottom: 20px;
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
      .spin {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: #fff;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Back link */
      .back {
        display: inline-block;
        font-size: 13px;
        color: rgba(250, 250, 247, 0.5);
        text-decoration: none;
        transition: color 0.15s;
      }
      .back:hover {
        color: #fff;
      }

      @media (max-width: 640px) {
        .auth-card {
          padding: 32px 20px;
          border-radius: 22px;
        }
        h1 {
          font-size: 26px;
        }
        .otp-row input {
          width: 44px;
          height: 54px;
          font-size: 22px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TwoFaComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionStorageService);
  private readonly accountService = inject(AccountService);
  private readonly stateStorage = inject(StateStorageService);
  private readonly appConfig = inject(ApplicationConfigService);
  private readonly data = inject(DataService);

  protected readonly digits = signal<string[]>(['', '', '', '', '', '']);
  protected readonly busy = signal(false);
  protected readonly verified = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly email = signal<string | null>(null);

  protected readonly cells = viewChildren<ElementRef<HTMLInputElement>>('cell');

  ngOnInit(): void {
    const emailFromQuery = this.route.snapshot.queryParamMap.get('email');
    const emailFromSession = this.session.retrieve('2fa_login');
    this.email.set(emailFromQuery ?? emailFromSession ?? null);
    queueMicrotask(() => this.cells()[0]?.nativeElement.focus());
  }

  onInput(i: number, ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const v = input.value.replace(/\D/g, '').slice(0, 1);
    input.value = v;
    this.digits.update(d => {
      const c = [...d];
      c[i] = v;
      return c;
    });
    this.error.set(null);
    if (v && i < 5) this.cells()[i + 1]?.nativeElement.focus();
    if (this.digits().every(x => x.length === 1)) this.verify();
  }

  onKey(i: number, ev: KeyboardEvent): void {
    if (ev.key === 'Backspace' && !this.digits()[i] && i > 0) this.cells()[i - 1]?.nativeElement.focus();
    if (ev.key === 'ArrowLeft' && i > 0) this.cells()[i - 1]?.nativeElement.focus();
    if (ev.key === 'ArrowRight' && i < 5) this.cells()[i + 1]?.nativeElement.focus();
  }

  onPaste(ev: ClipboardEvent): void {
    ev.preventDefault();
    const text = (ev.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const arr = text.padEnd(6, '').split('').slice(0, 6);
    this.digits.set(arr);
    arr.forEach((c, i) => {
      const el = this.cells()[i]?.nativeElement;
      if (el) el.value = c;
    });
    if (text.length === 6) this.verify();
    else this.cells()[text.length]?.nativeElement.focus();
  }

  verify(): void {
    if (this.busy()) return;
    this.busy.set(true);
    const code = this.digits().join('');
    const login = this.email() ?? this.session.retrieve('2fa_login');
    const rememberMe = this.session.retrieve('2fa_remember') ?? false;

    this.http.post<{ id_token: string }>(this.appConfig.getEndpointFor('api/verify-2fa'), { login, code, rememberMe }).subscribe({
      next: res => {
        const token = res?.id_token;
        if (!token) {
          this.busy.set(false);
          this.error.set('Code invalide. Veuillez réessayer.');
          this.digits.set(['', '', '', '', '', '']);
          queueMicrotask(() => this.cells()[0]?.nativeElement.focus());
          return;
        }
        this.stateStorage.storeAuthenticationToken(token, rememberMe);
        this.session.clear('2fa_login');
        this.session.clear('2fa_remember');
        this.data.reset();
        this.verified.set(true);
        this.busy.set(false);
        this.accountService.identity(true).subscribe(acc => {
          const roles = acc?.authorities ?? [];
          if (roles.includes('ROLE_SUPER_ADMIN')) this.router.navigate(['/paiezone/saas-dash']);
          else if (roles.includes('ROLE_ADMIN')) this.router.navigate(['/paiezone/admin-dash']);
          else if (roles.includes('ROLE_EMPLOYE')) this.router.navigate(['/paiezone/emp-dash']);
          else this.router.navigate(['/paiezone/rh-dash']);
        });
      },
      error: () => {
        this.busy.set(false);
        this.error.set('Code invalide ou expiré. Veuillez réessayer.');
        this.digits.set(['', '', '', '', '', '']);
        queueMicrotask(() => this.cells()[0]?.nativeElement.focus());
      },
    });
  }
}
