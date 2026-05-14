import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'pz-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>SaaS</strong> <span class="sep">/</span> Entreprises clientes</div>
          <h1>Entreprises clientes</h1>
          <div class="pz-muted">{{ data.companies().length }} tenant(s) · MRR total {{ data.fmtTND(totalMrr()) }}</div>
        </div>
        <button class="pz-btn pz-primary"><pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Nouvelle entreprise</button>
      </div>

      <div class="stat-grid">
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico"><pz-icon name="Building" /></span>Tenants actifs
          </div>
          <div class="stat-val">{{ activeCount() }}</div>
          <div class="stat-foot pz-muted">/ {{ data.companies().length }} total</div>
        </div>
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico info"><pz-icon name="Wallet" /></span>MRR total
          </div>
          <div class="stat-val">{{ data.fmtTND(totalMrr()) }}</div>
          <div class="stat-foot pz-muted">ARR {{ data.fmtTND(totalMrr() * 12) }}</div>
        </div>
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico warn"><pz-icon name="Users" /></span>Employés total
          </div>
          <div class="stat-val">{{ data.stats()['totalEmployees'] ?? 0 }}</div>
          <div class="stat-foot pz-muted">tous tenants</div>
        </div>
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico pos"><pz-icon name="TrendUp" /></span>Essais en cours
          </div>
          <div class="stat-val">{{ trialCount() }}</div>
          <div class="stat-foot pz-muted">à convertir</div>
        </div>
      </div>

      <div class="pz-card">
        <table class="pz-table">
          <thead>
            <tr>
              <th>Entreprise</th>
              <th>Ville</th>
              <th>Plan</th>
              <th>Statut</th>
              <th>MRR</th>
              <th>Renouvellement</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @if (data.companies().length === 0) {
              <tr>
                <td colspan="7" style="text-align:center;padding:40px;color:var(--pz-muted)">Aucune entreprise cliente</td>
              </tr>
            }
            @for (c of data.companies(); track c.id) {
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="co-logo">{{ c.name.slice(0, 2).toUpperCase() }}</div>
                    <div>
                      <div style="font-weight:500;font-size:13px">{{ c.name }}</div>
                      <div style="font-size:11.5px;color:var(--pz-muted)">{{ c.taxId }}</div>
                    </div>
                  </div>
                </td>
                <td style="font-size:12.5px">{{ c.city }}</td>
                <td>
                  <span class="pz-pill primary">{{ c.plan }}</span>
                </td>
                <td>
                  <span
                    class="pz-pill"
                    [class.pos]="c.status === 'ACTIVE'"
                    [class.warn]="c.status === 'TRIAL'"
                    [class.danger]="c.status === 'SUSPENDED'"
                  >
                    {{ c.status }}
                  </span>
                </td>
                <td class="pz-mono" style="font-size:12.5px">{{ data.fmtTND(c.priceHT) }}</td>
                <td style="font-size:12px;color:var(--pz-muted)">{{ c.renewal }}</td>
                <td>
                  <button class="pz-btn pz-sm"><pz-icon name="Eye" [size]="13" /></button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
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
        font-size: 24px;
        font-weight: 600;
        letter-spacing: -0.025em;
      }
      .stat-foot {
        font-size: 12px;
        margin-top: 8px;
      }
      .co-logo {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        background: linear-gradient(135deg, var(--pz-primary), #7c3aed);
        color: #fff;
        display: grid;
        place-items: center;
        font-weight: 700;
        font-size: 12px;
        flex-shrink: 0;
      }
      .pz-table {
        width: 100%;
        border-collapse: collapse;
      }
      .pz-table th {
        text-align: left;
        font-size: 11.5px;
        font-weight: 600;
        color: var(--pz-muted);
        padding: 10px 16px;
        border-bottom: 1px solid var(--pz-line);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .pz-table td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--pz-line);
        font-size: 13px;
        vertical-align: middle;
      }
      .pz-table tr:last-child td {
        border-bottom: 0;
      }
      .pz-table tr:hover td {
        background: var(--pz-surface-3);
      }
      .pz-pill.danger {
        background: #fee2e2;
        color: #b91c1c;
      }
    `,
  ],
})
export default class TenantsComponent {
  protected readonly data = inject(DataService);
  protected readonly totalMrr = computed(() => this.data.companies().reduce((s, c) => s + (c.priceHT ?? 0), 0));
  protected readonly activeCount = computed(() => this.data.companies().filter(c => c.status === 'ACTIVE').length);
  protected readonly trialCount = computed(() => this.data.companies().filter(c => c.status === 'TRIAL').length);
}
