import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';

import IconComponent from '../../core/icon/icon.component';

// 2FA Setup — affiche un QR code (placeholder) + clé secrète, demande
// vérification d'un premier code à 6 chiffres pour activer le 2FA.
// En prod : appel /api/account/2fa/setup pour récupérer secret + QR.

@Component({
  selector: 'pz-twofa-setup',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="auth-card">
      <div class="ico-circle">
        <pz-icon name="Shield" [size]="26"/>
      </div>
      <h1>Configurer la 2FA</h1>
      <p class="sub">
        Scannez le QR code avec Google Authenticator, Authy ou Microsoft Authenticator.
        Vous recevrez un code à 6 chiffres à chaque connexion.
      </p>

      <div class="qr-block">
        <div class="qr">
          <!-- QR placeholder. En prod : <img [src]="qrUrl"/> ou bibliothèque qrcode -->
          <svg viewBox="0 0 100 100" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="#fff"/>
            @for (cell of qrCells; track $index) {
              <rect [attr.x]="cell.x" [attr.y]="cell.y" [attr.width]="cell.s" [attr.height]="cell.s" fill="#0f172a"/>
            }
          </svg>
        </div>
        <div class="qr-info">
          <div class="qr-label">Ou saisissez cette clé manuellement :</div>
          <div class="qr-secret">
            <span class="pz-mono">{{ secret }}</span>
            <button class="copy" (click)="copy()" [class.copied]="copied()">
              @if (copied()) {
                <pz-icon name="Check" [size]="12" [strokeWidth]="2"/> Copié
              } @else {
                <pz-icon name="Doc" [size]="12"/> Copier
              }
            </button>
          </div>
          <div class="qr-app">
            Compte : <strong>PaieZone (admin&#64;atlas-tech.tn)</strong>
          </div>
        </div>
      </div>

      <div class="actions">
        <a class="pz-btn" routerLink="/paiezone/admin-dash">Passer pour l'instant</a>
        <button class="pz-btn pz-primary lg" (click)="verify()">
          Vérifier avec un code <pz-icon name="Arrow" [size]="14" [strokeWidth]="1.6"/>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; max-width: 480px; }

    .auth-card {
      background: var(--pz-surface);
      border-radius: 18px;
      box-shadow: var(--pz-shadow-xl);
      border: 1px solid var(--pz-line);
      padding: 36px;
      animation: cardIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes cardIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .ico-circle {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: var(--pz-primary-soft);
      color: var(--pz-primary);
      display: grid; place-items: center;
      margin: 0 auto 16px;
    }

    h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 8px; text-align: center; }
    .sub { font-size: 13.5px; color: var(--pz-muted); margin: 0 0 24px; line-height: 1.55; text-align: center; }

    .qr-block {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 20px;
      padding: 20px;
      border: 1px solid var(--pz-line);
      border-radius: 14px;
      background: var(--pz-surface-2);
      margin-bottom: 24px;
    }

    .qr {
      width: 180px; height: 180px;
      border: 8px solid #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      display: grid; place-items: center;
    }

    .qr-info { display: flex; flex-direction: column; justify-content: center; }
    .qr-label { font-size: 12px; color: var(--pz-muted); font-weight: 500; margin-bottom: 8px; }
    .qr-secret {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--pz-surface);
      border: 1px solid var(--pz-line);
      border-radius: 8px;
      padding: 8px 10px;
      margin-bottom: 12px;
      font-size: 13px;
      .pz-mono { flex: 1; word-break: break-all; line-height: 1.4; }
    }

    .copy {
      background: transparent;
      border: 0;
      padding: 4px 8px;
      border-radius: 6px;
      color: var(--pz-muted);
      cursor: pointer;
      font: inherit;
      font-size: 11.5px;
      display: inline-flex;
      align-items: center;
      gap: 4px;

      &:hover { background: var(--pz-surface-3); color: var(--pz-ink); }
      &.copied { color: var(--pz-pos); }
    }

    .qr-app { font-size: 12px; color: var(--pz-muted); strong { color: var(--pz-ink-3); font-weight: 600; } }

    .actions { display: flex; gap: 10px; justify-content: space-between; }

    .pz-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 42px;
      padding: 0 16px;
      border-radius: 10px;
      border: 1px solid var(--pz-line);
      background: var(--pz-surface);
      color: var(--pz-ink-2);
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      font-family: inherit;

      &.lg { padding: 0 20px; font-size: 14px; font-weight: 600; }
      &.pz-primary {
        background: var(--pz-primary);
        color: #fff;
        border-color: var(--pz-primary);
        &:hover { background: var(--pz-primary-2); }
      }
      &:hover:not(.pz-primary) { background: var(--pz-surface-2); }
    }

    @media (max-width: 560px) {
      .qr-block { grid-template-columns: 1fr; }
      .qr { margin: 0 auto; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TwoFaSetupComponent {
  private readonly router = inject(Router);
  protected readonly copied = signal(false);
  protected readonly secret = 'PZRH 5KAJ 9DM7 NQXB 8TFY';

  // Pseudo-QR pattern (purement décoratif — remplacer par vrai QR en prod)
  protected readonly qrCells = (() => {
    const cells: { x: number; y: number; s: number }[] = [];
    const s = 100 / 21;
    // Three corner squares
    const corners = [[0, 0], [14, 0], [0, 14]];
    corners.forEach(([cx, cy]) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        if (x === 0 || y === 0 || x === 6 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)) {
          cells.push({ x: (cx + x) * s, y: (cy + y) * s, s });
        }
      }
    });
    // Pseudo-random body
    const seed = (i: number) => (Math.sin(i * 7919) * 10000) % 1;
    for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
      const inCorner =
        (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      if (!inCorner && Math.abs(seed(y * 21 + x)) > 0.55) {
        cells.push({ x: x * s, y: y * s, s });
      }
    }
    return cells;
  })();

  copy(): void {
    navigator.clipboard?.writeText(this.secret.replace(/\s/g, ''));
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }

  verify(): void {
    this.router.navigate(['/paiezone/2fa']);
  }
}
