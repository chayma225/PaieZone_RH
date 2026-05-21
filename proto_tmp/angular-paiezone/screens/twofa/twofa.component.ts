import { Component, ChangeDetectionStrategy, signal, inject, viewChildren, ElementRef, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

import IconComponent from '../../core/icon/icon.component';

@Component({
  selector: 'pz-twofa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <div class="auth-card">
      <div class="ico-circle">
        <pz-icon name="Shield" [size]="26" [strokeWidth]="1.4"/>
      </div>
      <h1>Vérification en deux étapes</h1>
      <p class="sub">
        Saisissez le code à 6 chiffres généré par votre application d'authentification
        ({{ method() === 'app' ? 'Google Authenticator, Authy…' : 'envoyé par SMS' }}).
        @if (email()) {
          <br/>Compte&nbsp;: <strong>{{ email() }}</strong>
        }
      </p>

      @if (error()) {
        <div class="alert">
          <pz-icon name="CircleHelp" [size]="14"/>{{ error() }}
        </div>
      }

      <div class="otp-row" [class.error]="!!error()" [class.success]="verified()">
        @for (i of [0,1,2,3,4,5]; track i) {
          <input #cell
                 type="text"
                 inputmode="numeric"
                 maxlength="1"
                 [value]="digits()[i]"
                 (input)="onInput(i, $event)"
                 (keydown)="onKey(i, $event)"
                 (paste)="onPaste($event)"
                 [disabled]="busy() || verified()"/>
        }
      </div>

      <div class="method-row">
        <span class="muted">Vous n'avez pas reçu de code ?</span>
        @if (canResend()) {
          <button class="link" type="button" (click)="resend()">Renvoyer</button>
        } @else {
          <span class="muted">Renvoyer dans {{ resendCooldown() }}s</span>
        }
      </div>

      <div class="method-switch">
        <button type="button"
                [class.active]="method() === 'app'"
                (click)="setMethod('app')">
          <pz-icon name="Bot" [size]="14"/> Application
        </button>
        <button type="button"
                [class.active]="method() === 'sms'"
                (click)="setMethod('sms')">
          <pz-icon name="Phone" [size]="14"/> SMS
        </button>
      </div>

      <a class="back" routerLink="/paiezone/login">
        ← Revenir à la connexion
      </a>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; max-width: 460px; }

    .auth-card {
      background: var(--pz-surface);
      border-radius: 18px;
      box-shadow: var(--pz-shadow-xl);
      border: 1px solid var(--pz-line);
      padding: 40px 36px;
      text-align: center;
      animation: cardIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes cardIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .ico-circle {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: var(--pz-primary-soft);
      color: var(--pz-primary);
      display: grid; place-items: center;
      margin: 0 auto 16px;
    }

    h1 { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 10px; }
    .sub { font-size: 14px; color: var(--pz-muted); margin: 0 0 28px; line-height: 1.55;
      strong { color: var(--pz-ink); font-weight: 600; }
    }
    .muted { color: var(--pz-muted); }

    .alert {
      padding: 10px 12px;
      background: var(--pz-danger-soft);
      color: var(--pz-danger-ink);
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
      display: flex; align-items: center; gap: 8px;
      justify-content: center;
    }

    .otp-row {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin: 8px 0 24px;

      input {
        width: 52px; height: 60px;
        border: 1.5px solid var(--pz-line-2);
        border-radius: 12px;
        text-align: center;
        font-size: 24px;
        font-weight: 600;
        font-family: 'JetBrains Mono', monospace;
        color: var(--pz-ink);
        background: var(--pz-surface);
        outline: 0;
        transition: all 0.12s;
        caret-color: var(--pz-primary);

        &:focus {
          border-color: var(--pz-primary);
          box-shadow: 0 0 0 4px var(--pz-primary-soft);
          transform: translateY(-1px);
        }

        &:disabled { opacity: 0.7; }
      }

      &.error input {
        border-color: var(--pz-danger);
        animation: shake 0.3s;
      }

      &.success input {
        border-color: var(--pz-pos);
        background: var(--pz-pos-soft);
        color: var(--pz-pos-ink);
      }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }

    .method-row {
      display: flex;
      gap: 6px;
      justify-content: center;
      font-size: 13px;
      margin-bottom: 24px;
    }

    .link {
      color: var(--pz-primary);
      font-weight: 500;
      background: transparent;
      border: 0;
      cursor: pointer;
      font: inherit;
      padding: 0;

      &:hover { text-decoration: underline; }
    }

    .method-switch {
      display: flex;
      gap: 4px;
      padding: 4px;
      background: var(--pz-surface-3);
      border-radius: 10px;
      margin-bottom: 24px;

      button {
        flex: 1;
        height: 36px;
        border: 0;
        background: transparent;
        border-radius: 7px;
        font: inherit;
        font-size: 13px;
        font-weight: 500;
        color: var(--pz-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.12s;

        &.active {
          background: var(--pz-surface);
          color: var(--pz-ink);
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
      }
    }

    .back {
      display: inline-block;
      font-size: 13px;
      color: var(--pz-muted);
      text-decoration: none;

      &:hover { color: var(--pz-ink); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TwoFaComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly digits = signal<string[]>(['', '', '', '', '', '']);
  protected readonly busy = signal(false);
  protected readonly verified = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly method = signal<'app' | 'sms'>('app');
  protected readonly resendCooldown = signal(30);
  protected readonly email = signal<string | null>(null);

  protected readonly canResend = computed(() => this.resendCooldown() === 0);

  protected readonly cells = viewChildren<ElementRef<HTMLInputElement>>('cell');

  private timer: any;

  ngOnInit(): void {
    this.email.set(this.route.snapshot.queryParamMap.get('email'));
    this.startCooldown();
    // Focus first cell
    queueMicrotask(() => this.cells()[0]?.nativeElement.focus());
  }

  ngOnDestroy(): void { clearInterval(this.timer); }

  setMethod(m: 'app' | 'sms'): void {
    this.method.set(m);
    this.digits.set(['', '', '', '', '', '']);
    this.error.set(null);
    queueMicrotask(() => this.cells()[0]?.nativeElement.focus());
  }

  resend(): void {
    this.startCooldown();
    this.error.set(null);
    this.digits.set(['', '', '', '', '', '']);
    queueMicrotask(() => this.cells()[0]?.nativeElement.focus());
  }

  private startCooldown(): void {
    this.resendCooldown.set(30);
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.resendCooldown.update(v => Math.max(0, v - 1));
      if (this.resendCooldown() === 0) clearInterval(this.timer);
    }, 1000);
  }

  onInput(i: number, ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const v = input.value.replace(/\D/g, '').slice(0, 1);
    input.value = v;
    this.digits.update(d => { const c = [...d]; c[i] = v; return c; });
    this.error.set(null);

    if (v && i < 5) {
      this.cells()[i + 1]?.nativeElement.focus();
    }

    // Auto-submit when complete
    if (this.digits().every(x => x.length === 1)) {
      this.verify();
    }
  }

  onKey(i: number, ev: KeyboardEvent): void {
    if (ev.key === 'Backspace' && !this.digits()[i] && i > 0) {
      this.cells()[i - 1]?.nativeElement.focus();
    }
    if (ev.key === 'ArrowLeft' && i > 0) {
      this.cells()[i - 1]?.nativeElement.focus();
    }
    if (ev.key === 'ArrowRight' && i < 5) {
      this.cells()[i + 1]?.nativeElement.focus();
    }
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

    setTimeout(() => {
      // Demo : 000000 ou 123456 acceptés, sinon erreur après "vérification".
      if (code === '000000' || code === '123456' || code === '111111') {
        this.verified.set(true);
        this.busy.set(false);
        setTimeout(() => this.router.navigate(['/paiezone/rh-dash']), 600);
      } else {
        // En démo, on accepte tout ce qui fait 6 chiffres pour ne pas bloquer la navigation.
        this.verified.set(true);
        this.busy.set(false);
        setTimeout(() => this.router.navigate(['/paiezone/rh-dash']), 600);
      }
    }, 900);
  }
}
