import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'pz-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>Administration</strong> <span class="sep">/</span> Tableau de bord</div>
          <h1>Atlas Tech SARL</h1>
          <div class="pz-muted">Vue administrateur · Mehdi Trabelsi · Mercredi 14 mai 2026</div>
        </div>
        <div class="pz-page-actions">
          <a class="pz-btn" routerLink="/paiezone/admin-company"><pz-icon name="Building" /> Mon entreprise</a>
          <button class="pz-btn pz-primary"><pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Inviter un utilisateur</button>
        </div>
      </div>

      <div class="stat-grid">
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico"><pz-icon name="Users" /></span>Utilisateurs actifs
          </div>
          <div class="stat-val">
            {{ activeUsers() }}<small>/ {{ data.tenantUsers().length }}</small>
          </div>
          <div class="stat-foot pz-muted">{{ data.tenantUsers().length - activeUsers() }} désactivé(s)</div>
        </div>
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico info"><pz-icon name="Briefcase" /></span>Effectif total
          </div>
          <div class="stat-val">{{ data.stats()['activeEmployees'] ?? data.employees().length }}</div>
          <div class="stat-foot"><span class="pz-muted">collaborateurs actifs</span></div>
        </div>
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico warn"><pz-icon name="Shield" /></span>2FA activée
          </div>
          <div class="stat-val">{{ twofaPct() }}<small>%</small></div>
          <div class="stat-foot pz-muted">Recommandé pour Admin & RH</div>
        </div>
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico pos"><pz-icon name="Wallet" /></span>Plan d'abonnement
          </div>
          <div class="stat-val" style="font-size:20px">Business</div>
          <div class="stat-foot pz-muted">42/100 employés · 540 TND/mois</div>
        </div>
      </div>

      <div class="grid">
        <div class="pz-card">
          <div class="card-head">
            <div class="card-title">Répartition des rôles</div>
            <a class="pz-btn pz-sm pz-ghost" routerLink="/paiezone/admin-users"
              >Gérer <pz-icon name="Arrow" [size]="12" [strokeWidth]="1.6"
            /></a>
          </div>
          <div class="card-body">
            @for (r of roleDist(); track r.role) {
              <div class="role-row">
                <div class="row-top">
                  <span class="pz-pill" [class.primary]="r.role === 'ADMIN'" [class.info]="r.role === 'RH_COMPTABLE'">{{ r.label }}</span>
                  <span class="pz-muted small">{{ r.desc }}</span>
                  <span class="pz-mono strong">{{ r.count }}</span>
                </div>
                <div class="progress"><i [style.width.%]="r.pct"></i></div>
              </div>
            }
          </div>
        </div>

        <div class="pz-card">
          <div class="card-head"><div class="card-title">Mon entreprise</div></div>
          <div class="card-body">
            <div class="company-head">
              <div class="logo">AT</div>
              <div>
                <div class="strong">Atlas Tech SARL</div>
                <div class="pz-muted small">Tunis · Création 02/04/2018</div>
              </div>
            </div>
            <div class="info-rows">
              <div class="info-row"><span class="pz-muted small">Matricule fiscal</span><span class="pz-mono small">1234567/A</span></div>
              <div class="info-row"><span class="pz-muted small">ID CNSS</span><span class="pz-mono small">12500-0001</span></div>
              <div class="info-row">
                <span class="pz-muted small">Effectif</span
                ><span class="strong">{{ data.stats()['activeEmployees'] ?? data.employees().length }} collaborateurs</span>
              </div>
              <div class="info-row"><span class="pz-muted small">Plan</span><span class="pz-pill primary">Business</span></div>
            </div>
            <a class="pz-btn full" routerLink="/paiezone/admin-company"><pz-icon name="Edit" [size]="14" [strokeWidth]="1.4" /> Modifier</a>
          </div>
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
      .stat-grid {
        display: grid;
        gap: var(--pz-gap);
        grid-template-columns: repeat(4, 1fr);
      }
      .stat {
        padding: 18px 20px;
      }
      .stat-head {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--pz-muted);
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 8px;
      }
      .stat-head .ico {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        background: var(--pz-primary-soft);
        color: var(--pz-primary);
        display: grid;
        place-items: center;
      }
      .stat-head .ico.info {
        background: var(--pz-info-soft);
        color: var(--pz-info-ink);
      }
      .stat-head .ico.warn {
        background: var(--pz-warn-soft);
        color: var(--pz-warn-ink);
      }
      .stat-head .ico.pos {
        background: var(--pz-pos-soft);
        color: var(--pz-pos-ink);
      }
      .stat-val {
        font-size: 26px;
        font-weight: 600;
        letter-spacing: -0.025em;
        font-variant-numeric: tabular-nums;
        line-height: 1.1;
      }
      .stat-val small {
        font-size: 14px;
        color: var(--pz-muted);
        font-weight: 500;
        margin-left: 3px;
      }
      .stat-foot {
        display: flex;
        gap: 8px;
        margin-top: 10px;
        font-size: 12px;
        align-items: center;
      }
      .grid {
        display: grid;
        gap: var(--pz-gap);
        grid-template-columns: 2fr 1fr;
      }
      .card-head {
        display: flex;
        align-items: center;
        padding: 16px 20px 12px;
      }
      .card-title {
        font-size: 14px;
        font-weight: 600;
      }
      .card-head .pz-btn {
        margin-left: auto;
      }
      .card-body {
        padding: 4px 20px 20px;
      }
      .role-row {
        margin-bottom: 14px;
      }
      .row-top {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }
      .row-top .pz-mono {
        margin-left: auto;
        font-size: 13px;
      }
      .small {
        font-size: 12px;
      }
      .strong {
        font-weight: 500;
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
        background: var(--pz-primary);
        border-radius: 999px;
      }
      .company-head {
        display: flex;
        gap: 14px;
        align-items: center;
        margin-bottom: 14px;
      }
      .company-head .logo {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--pz-primary), #7c3aed);
        color: #fff;
        display: grid;
        place-items: center;
        font-weight: 700;
        font-size: 18px;
      }
      .info-rows {
        margin-bottom: 14px;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid var(--pz-line);
      }
      .info-row:last-child {
        border-bottom: 0;
      }
      .pz-btn.full {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminDashboardComponent {
  protected readonly data = inject(DataService);

  protected activeUsers() {
    return this.data.tenantUsers().filter(u => u.active).length;
  }

  protected twofaPct() {
    const users = this.data.tenantUsers();
    if (!users.length) return 0;
    return Math.round((users.filter(u => u.twofa).length / users.length) * 100);
  }

  protected roleDist() {
    const total = this.data.tenantUsers().length;
    const meta = {
      ADMIN: { label: 'Administrateur', desc: 'Accès complet' },
      RH_COMPTABLE: { label: 'RH / Comptable', desc: 'Paie, congés, employés' },
      EMPLOYE: { label: 'Employé', desc: 'Self-service' },
    } as const;
    return (['ADMIN', 'RH_COMPTABLE', 'EMPLOYE'] as const).map(r => {
      const count = this.data.tenantUsers().filter(u => u.role === r).length;
      return { role: r, ...meta[r], count, pct: (count / total) * 100 };
    });
  }
}
