import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { Company } from '../../core/types';

type Action = 'suspend' | 'reactivate' | 'cancel';

const PLANS = [
  { value: 'STARTER', label: 'Starter (Essai)', price: '0 TND/mois' },
  { value: 'PME', label: 'PME', price: '290 TND/mois' },
  { value: 'BUSINESS', label: 'Business', price: '720 TND/mois' },
  { value: 'ENTERPRISE', label: 'Enterprise', price: '1 480 TND/mois' },
];

const CONFIRM_TEXT: Record<Action, (name: string) => string> = {
  suspend: name => 'Suspendre l’accès à « ' + name + ' » ? Tous les utilisateurs seront bloqués immédiatement.',
  reactivate: name => 'Réactiver « ' + name + ' » ? L’accès sera restauré immédiatement.',
  cancel: name => 'Résilier définitivement l’abonnement de « ' + name + ' » ? Cette action est irréversible.',
};

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
      </div>

      <!-- ── KPIs ────────────────────────────────────────── -->
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

      <!-- ── Table ───────────────────────────────────────── -->
      <div class="pz-card">
        <table class="pz-table">
          <thead>
            <tr>
              <th>Entreprise</th>
              <th>Ville</th>
              <th>Plan</th>
              <th>Statut</th>
              <th>MRR</th>
              <th style="width:90px">Renouvl.</th>
              <th style="width:110px">Actions</th>
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
                    [class.danger]="c.status === 'SUSPENDED' || c.status === 'CANCELLED'"
                  >
                    {{ statusLabel(c.status) }}
                  </span>
                </td>
                <td class="pz-mono" style="font-size:12.5px">{{ data.fmtTND(c.priceHT) }}</td>
                <td style="font-size:11.5px;color:var(--pz-muted);white-space:nowrap">{{ c.renewal }}</td>
                <td>
                  <div class="row-actions">
                    <button class="act-btn blue" (click)="openPlan(c)" title="Modifier le plan">
                      <pz-icon name="Tag" [size]="14" />
                    </button>
                    @if (c.status === 'ACTIVE' || c.status === 'TRIAL') {
                      <button class="act-btn orange" (click)="openConfirm(c, 'suspend')" title="Suspendre">
                        <pz-icon name="PauseCircle" [size]="14" />
                      </button>
                    }
                    @if (c.status === 'SUSPENDED' || c.status === 'CANCELLED') {
                      <button class="act-btn green" (click)="openConfirm(c, 'reactivate')" title="Réactiver">
                        <pz-icon name="PlayCircle" [size]="14" />
                      </button>
                    }
                    @if (c.status !== 'CANCELLED') {
                      <button class="act-btn red" (click)="openConfirm(c, 'cancel')" title="Résilier">
                        <pz-icon name="XCircle" [size]="14" />
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Modal : Modifier plan ───────────────────────── -->
    @if (planTarget()) {
      <div class="pz-modal-backdrop" (click)="closePlan()">
        <div class="pz-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span class="pz-modal-title">Modifier le plan — {{ planTarget()!.name }}</span>
            <button class="pz-modal-close" (click)="closePlan()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <p style="font-size:12.5px;color:var(--pz-muted);margin:0 0 14px">
              Plan actuel : <strong>{{ planTarget()!.plan }}</strong>
            </p>
            <div class="plan-grid">
              @for (p of plans; track p.value) {
                <button class="plan-card" [class.selected]="selectedPlan() === p.value" (click)="selectedPlan.set(p.value)">
                  <div class="plan-name">{{ p.label }}</div>
                  <div class="plan-price">{{ p.price }}</div>
                </button>
              }
            </div>
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closePlan()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="busy() || !selectedPlan()" (click)="savePlan()">
              @if (busy()) {
                Enregistrement…
              } @else {
                Enregistrer
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ── Modal : Confirmation ────────────────────────── -->
    @if (confirmTarget()) {
      <div class="pz-modal-backdrop" (click)="closeConfirm()">
        <div class="pz-modal pz-modal-sm" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span class="pz-modal-title">{{ confirmTitle() }}</span>
            <button class="pz-modal-close" (click)="closeConfirm()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <p style="font-size:13px;line-height:1.5;margin:0">{{ confirmMessage() }}</p>
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeConfirm()">Annuler</button>
            <button
              class="pz-btn"
              [class.pz-danger]="confirmAction() === 'suspend' || confirmAction() === 'cancel'"
              [class.pz-primary]="confirmAction() === 'reactivate'"
              [disabled]="busy()"
              (click)="executeAction()"
            >
              @if (busy()) {
                En cours…
              } @else {
                Confirmer
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      /* ── KPI grid ── */
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

      /* ── Company logo ── */
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

      /* ── Table ── */
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

      /* ── Row action buttons ── */
      .row-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: nowrap;
      }
      .act-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition:
          opacity 0.15s,
          transform 0.1s;
      }
      .act-btn:hover {
        opacity: 0.85;
        transform: translateY(-1px);
      }
      .act-btn:active {
        transform: translateY(0);
      }
      .act-btn.blue {
        background: #dbeafe;
        color: #1d4ed8;
      }
      .act-btn.orange {
        background: #ffedd5;
        color: #c2410c;
      }
      .act-btn.green {
        background: #dcfce7;
        color: #15803d;
      }
      .act-btn.red {
        background: #fee2e2;
        color: #b91c1c;
      }

      /* ── Plan modal grid ── */
      .plan-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .plan-card {
        padding: 14px 16px;
        border: 1.5px solid var(--pz-line);
        border-radius: 10px;
        background: var(--pz-surface);
        cursor: pointer;
        text-align: left;
        transition:
          border-color 0.15s,
          background 0.15s;
      }
      .plan-card:hover {
        border-color: var(--pz-primary);
        background: var(--pz-primary-soft);
      }
      .plan-card.selected {
        border-color: var(--pz-primary);
        background: var(--pz-primary-soft);
      }
      .plan-name {
        font-weight: 600;
        font-size: 13px;
        margin-bottom: 4px;
      }
      .plan-price {
        font-size: 12px;
        color: var(--pz-muted);
      }

      /* ── Modals ── */
      .pz-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(2px);
        z-index: 1100;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .pz-modal {
        background: var(--pz-surface);
        border-radius: 14px;
        width: 480px;
        max-width: 94vw;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
        display: flex;
        flex-direction: column;
      }
      .pz-modal-sm {
        width: 400px;
      }
      .pz-modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 20px 14px;
        border-bottom: 1px solid var(--pz-line);
      }
      .pz-modal-title {
        font-weight: 600;
        font-size: 14px;
      }
      .pz-modal-close {
        border: none;
        background: none;
        cursor: pointer;
        color: var(--pz-muted);
        padding: 4px;
        border-radius: 6px;
        display: grid;
        place-items: center;
      }
      .pz-modal-close:hover {
        background: var(--pz-surface-3);
        color: var(--pz-text);
      }
      .pz-modal-body {
        padding: 18px 20px;
      }
      .pz-modal-foot {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 14px 20px 18px;
        border-top: 1px solid var(--pz-line);
      }
      .pz-btn.pz-danger {
        background: #dc2626;
        color: #fff;
        border-color: #dc2626;
      }
      .pz-btn.pz-danger:hover:not(:disabled) {
        background: #b91c1c;
      }
    `,
  ],
})
export default class TenantsComponent {
  protected readonly data = inject(DataService);
  private readonly api = inject(ApiService);

  readonly plans = PLANS;

  // ── Computed stats ──────────────────────────────────────────────────────
  protected readonly totalMrr = computed(() => this.data.companies().reduce((s, c) => s + (c.priceHT ?? 0), 0));
  protected readonly activeCount = computed(() => this.data.companies().filter(c => c.status === 'ACTIVE').length);
  protected readonly trialCount = computed(() => this.data.companies().filter(c => c.status === 'TRIAL').length);

  // ── Plan modal ──────────────────────────────────────────────────────────
  readonly planTarget = signal<Company | null>(null);
  readonly selectedPlan = signal<string>('');
  readonly busy = signal(false);

  openPlan(c: Company): void {
    this.selectedPlan.set(c.plan);
    this.planTarget.set(c);
  }

  closePlan(): void {
    this.planTarget.set(null);
  }

  savePlan(): void {
    const c = this.planTarget();
    if (!c || !this.selectedPlan() || this.busy()) return;
    this.busy.set(true);
    this.api.changePlan(c.id, this.selectedPlan()).subscribe({
      next: updated => {
        this.data.companies.update(list => list.map(x => (x.id === updated.id ? updated : x)));
        this.closePlan();
        this.busy.set(false);
      },
      error: () => this.busy.set(false),
    });
  }

  // ── Confirm modal ───────────────────────────────────────────────────────
  readonly confirmTarget = signal<Company | null>(null);
  readonly confirmAction = signal<Action | null>(null);

  readonly confirmTitle = computed(() => {
    const a = this.confirmAction();
    if (a === 'suspend') return "Suspendre l'accès";
    if (a === 'reactivate') return "Réactiver l'entreprise";
    if (a === 'cancel') return "Résilier l'abonnement";
    return '';
  });

  readonly confirmMessage = computed(() => {
    const c = this.confirmTarget();
    const a = this.confirmAction();
    if (!c || !a) return '';
    return CONFIRM_TEXT[a](c.name);
  });

  openConfirm(c: Company, action: Action): void {
    this.confirmTarget.set(c);
    this.confirmAction.set(action);
  }

  closeConfirm(): void {
    this.confirmTarget.set(null);
    this.confirmAction.set(null);
  }

  executeAction(): void {
    const c = this.confirmTarget();
    const a = this.confirmAction();
    if (!c || !a || this.busy()) return;
    this.busy.set(true);

    const call$ =
      a === 'suspend'
        ? this.api.suspendCompany(c.id)
        : a === 'reactivate'
          ? this.api.reactivateCompany(c.id)
          : this.api.cancelSubscription(c.id);

    call$.subscribe({
      next: updated => {
        this.data.companies.update(list => list.map(x => (x.id === updated.id ? updated : x)));
        this.closeConfirm();
        this.busy.set(false);
      },
      error: () => this.busy.set(false),
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────
  statusLabel(s: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'Actif',
      TRIAL: 'Essai',
      SUSPENDED: 'Suspendu',
      CANCELLED: 'Résilié',
    };
    return map[s] ?? s;
  }
}
