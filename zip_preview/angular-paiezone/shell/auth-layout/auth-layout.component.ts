import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pz-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="auth-page">
      <header class="auth-top">
        <a class="brand" routerLink="/paiezone">
          <div class="brand-mark">PZ</div>
          <div class="brand-name">paie<span>zone</span> RH</div>
        </a>
        <div class="legal">© 2026 PaieZone · Tunis</div>
      </header>
      <main class="auth-main">
        <router-outlet/>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; }

    .auth-page {
      min-height: 100vh;
      background: var(--pz-surface-2);
      background-image:
        radial-gradient(circle at 10% 10%, rgba(79, 70, 229, 0.05), transparent 50%),
        radial-gradient(circle at 90% 90%, rgba(124, 58, 237, 0.04), transparent 50%);
      display: flex;
      flex-direction: column;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }

    .auth-top {
      height: 64px;
      padding: 0 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      font-size: 16px;
      letter-spacing: -0.02em;
      text-decoration: none;
      color: var(--pz-ink);
    }

    .brand-mark {
      width: 30px; height: 30px;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--pz-primary), #7c3aed);
      color: #fff;
      display: grid; place-items: center;
      font-weight: 700;
      font-size: 13px;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
    }

    .brand-name span { color: var(--pz-primary); font-weight: 700; }

    .legal { font-size: 12.5px; color: var(--pz-muted); }

    .auth-main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AuthLayoutComponent {}
