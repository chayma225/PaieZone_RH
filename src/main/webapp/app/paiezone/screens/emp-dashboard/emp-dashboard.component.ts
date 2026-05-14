import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'pz-emp-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>Mon espace</strong> <span class="sep">/</span> Tableau de bord</div>
          <h1>Bonjour Mehdi 👋</h1>
          <div class="pz-muted">Mercredi 14 mai 2026 · Lead Développeur · matricule <span class="pz-mono">A12-018</span></div>
        </div>
        <div class="pz-page-actions">
          <button class="pz-btn" routerLink="/paiezone/emp-leaves"><pz-icon name="Calendar" /> Demander un congé</button>
          <button class="pz-btn pz-primary" routerLink="/paiezone/emp-requests"><pz-icon name="Cash" /> Demander une avance</button>
        </div>
      </div>

      <div class="grid-21">
        <div class="pz-card hero">
          <div class="hero-head">
            <div>
              <div class="hero-title">Dernier bulletin de paie</div>
              <div class="hero-sub">Avril 2026 · disponible depuis le 03/05/2026</div>
            </div>
            <span class="pz-pill pos"><span class="dot"></span>Validé</span>
          </div>
          <div class="hero-body">
            <div>
              <div class="amount-label">Net à payer</div>
              <div class="amount">{{ data.fmtTNDdec(2783.05) }}</div>
              <div class="amount-detail pz-muted">
                Brut <span class="pz-mono">3 680,000</span> · Cotisations <span class="pz-mono">−896,950</span>
              </div>
            </div>
            <div class="hero-actions">
              <button class="pz-btn"><pz-icon name="Eye" [size]="14" [strokeWidth]="1.4" /> Voir détail</button>
              <button class="pz-btn pz-primary"><pz-icon name="Download" [size]="14" [strokeWidth]="1.5" /> Télécharger PDF</button>
            </div>
          </div>
        </div>

        <div class="pz-card">
          <div class="card-head"><div class="card-title">Notifications</div></div>
          <div class="card-body">
            @for (n of notifs; track n.title) {
              <div class="notif">
                <div class="notif-ico" [class]="n.tone"><pz-icon [name]="n.icon" /></div>
                <div class="grow">
                  <div class="strong">{{ n.title }}</div>
                  <div class="pz-muted small">{{ n.sub }}</div>
                </div>
                <div class="pz-mono pz-muted small">{{ n.time }}</div>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="pz-card">
        <div class="card-head"><div class="card-title">Mes soldes de congés — 2026</div></div>
        <div class="card-body">
          @for (b of balances; track b.label) {
            <div class="bal">
              <div class="bal-head">
                <span class="strong">{{ b.label }}</span>
                <span
                  ><strong class="pz-mono">{{ b.total - b.used }}</strong>
                  <span class="pz-muted small">/ {{ b.total }}j restants</span></span
                >
              </div>
              <div class="progress"><i [style.width.%]="(b.used / b.total) * 100" [style.background]="b.color"></i></div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .pz-page-actions {
        display: flex;
        gap: 8px;
      }
      .grid-21 {
        display: grid;
        gap: var(--pz-gap);
        grid-template-columns: 2fr 1fr;
      }

      .hero {
        background: linear-gradient(135deg, #ffffff 0%, var(--pz-primary-soft) 100%);
        border-color: var(--pz-primary-soft);
      }
      .hero-head {
        padding: 16px 20px 12px;
        display: flex;
        align-items: center;
      }
      .hero-head > div:first-child {
        flex: 1;
      }
      .hero-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--pz-primary-ink);
      }
      .hero-sub {
        font-size: 12px;
        color: var(--pz-muted);
        margin-top: 2px;
      }
      .hero-body {
        padding: 4px 20px 20px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 20px;
        flex-wrap: wrap;
      }
      .amount-label {
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--pz-muted);
      }
      .amount {
        font-size: 36px;
        font-weight: 600;
        letter-spacing: -0.025em;
        font-family: 'JetBrains Mono', monospace;
        color: var(--pz-ink);
        margin-top: 4px;
      }
      .amount-detail {
        font-size: 12px;
        margin-top: 6px;
      }
      .hero-actions {
        display: flex;
        gap: 8px;
      }

      .card-head {
        padding: 16px 20px 12px;
      }
      .card-title {
        font-size: 14px;
        font-weight: 600;
      }
      .card-body {
        padding: 0 20px 14px;
      }

      .notif {
        padding: 10px 0;
        border-top: 1px solid var(--pz-line);
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }
      .notif:first-child {
        border-top: 0;
      }
      .notif-ico {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: grid;
        place-items: center;
        background: var(--pz-primary-soft);
        color: var(--pz-primary-ink);
        flex-shrink: 0;
      }
      .notif-ico.pos {
        background: var(--pz-pos-soft);
        color: var(--pz-pos-ink);
      }
      .notif-ico.warn {
        background: var(--pz-warn-soft);
        color: var(--pz-warn-ink);
      }
      .notif-ico.info {
        background: var(--pz-info-soft);
        color: var(--pz-info-ink);
      }
      .grow {
        flex: 1;
        min-width: 0;
      }
      .strong {
        font-weight: 500;
        font-size: 13px;
      }
      .small {
        font-size: 11.5px;
      }

      .bal {
        margin-bottom: 14px;
      }
      .bal-head {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      .progress {
        height: 4px;
        background: var(--pz-surface-3);
        border-radius: 999px;
        overflow: hidden;
      }
      .progress i {
        display: block;
        height: 100%;
        border-radius: 999px;
        transition: width 0.3s;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EmpDashboardComponent {
  protected readonly data = inject(DataService);

  protected readonly notifs = [
    { icon: 'Cash', tone: 'primary', title: "Bulletin d'avril disponible", sub: 'Téléchargeable depuis Mes documents', time: 'il y a 1 j' },
    { icon: 'Check', tone: 'pos', title: 'Avance approuvée', sub: '800 TND — remboursement sur 3 mois', time: 'il y a 3 j' },
    { icon: 'Calendar', tone: 'warn', title: 'Solde CP : 20 jours restants', sub: 'À utiliser avant le 31/12/2026', time: 'il y a 1 sem.' },
  ];

  protected readonly balances = [
    { label: 'Congés payés', used: 4, total: 24, color: '#4f46e5' },
    { label: 'RTT', used: 2, total: 11, color: '#0ea5e9' },
    { label: 'Maladie', used: 0, total: 15, color: '#f59e0b' },
  ];
}
