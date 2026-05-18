import { Component, ChangeDetectionStrategy, signal, inject, viewChildren, ElementRef, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SessionStorageService } from 'ngx-webstorage';

import { AccountService } from 'app/core/auth/account.service';
import { StateStorageService } from 'app/core/auth/state-storage.service';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import IconComponent from '../../core/icon/icon.component';

@Component({
  selector: 'pz-twofa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './twofa.component.html',
  styleUrl: './twofa.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TwoFaComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionStorageService);
  private readonly accountService = inject(AccountService);
  private readonly stateStorage = inject(StateStorageService);
  private readonly appConfig = inject(ApplicationConfigService);

  protected readonly digits = signal<string[]>(['', '', '', '', '', '']);
  protected readonly busy = signal(false);
  protected readonly verified = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly method = signal<'app' | 'sms'>('app');
  protected readonly resendCooldown = signal(30);
  protected readonly email = signal<string | null>(null);

  protected readonly canResend = computed(() => this.resendCooldown() === 0);
  protected readonly cells = viewChildren<ElementRef<HTMLInputElement>>('cell');

  private timer: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    const emailFromQuery = this.route.snapshot.queryParamMap.get('email');
    const emailFromSession = this.session.retrieve('2fa_login');
    this.email.set(emailFromQuery ?? emailFromSession ?? null);
    this.startCooldown();
    queueMicrotask(() => this.cells()[0]?.nativeElement.focus());
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

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
