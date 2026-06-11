import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { LeaveBalance } from '../../core/types';

const LEAVE_ICON: Record<string, string> = {
  ANNUEL: 'Beach',
  MALADIE: 'Shield',
  RTT: 'Calendar',
  MATERNITE: 'User',
  PATERNITE: 'User',
  SANS_SOLDE: 'Doc',
  MARIAGE: 'Gift',
};
const LEAVE_COLOR: Record<string, string> = {
  ANNUEL: '#5b21b6',
  MALADIE: '#f59e0b',
  RTT: '#0ea5e9',
  MATERNITE: '#ec4899',
  PATERNITE: '#14b8a6',
  SANS_SOLDE: '#6b7280',
  MARIAGE: '#8b5cf6',
};
const LEAVE_LABEL: Record<string, string> = {
  ANNUEL: 'Congés payés',
  MALADIE: 'Congé maladie',
  RTT: 'RTT',
  MATERNITE: 'Maternité',
  PATERNITE: 'Paternité',
  SANS_SOLDE: 'Sans solde',
  MARIAGE: 'Congé mariage',
};

@Component({
  selector: 'pz-emp-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>Mon espace</strong> <span class="sep">/</span> Mes congés</div>
          <h1>Mes congés & absences</h1>
          <div class="pz-muted">Consultez vos soldes et déposez vos demandes</div>
        </div>
        <div class="pz-page-actions">
          <button class="pz-btn pz-primary" (click)="openCreate()">
            <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Nouvelle demande
          </button>
        </div>
      </div>

      <!-- Anneaux de soldes -->
      <div class="bal-grid">
        @if (loadingBalances()) {
          <div class="pz-card bal-card" style="color:var(--pz-muted);font-size:13px;">Chargement…</div>
        }
        @for (b of balances(); track b.label) {
          <div class="pz-card bal-card">
            <div class="ring-wrap">
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="30" fill="none" stroke="var(--pz-surface-3)" stroke-width="7" />
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  fill="none"
                  [attr.stroke]="b.color"
                  stroke-width="7"
                  stroke-linecap="round"
                  [attr.stroke-dasharray]="dash(b.used, b.total)"
                  transform="rotate(-90 36 36)"
                  class="ring"
                />
              </svg>
              <div class="ring-ico" [style.color]="b.color"><pz-icon [name]="b.icon" [size]="18" /></div>
            </div>
            <div class="bal-info">
              <div class="pz-muted small">{{ b.label }}</div>
              <div class="bal-num">
                {{ b.total - b.used }}<span class="pz-muted">/ {{ b.total }}j</span>
              </div>
              <div class="pz-muted small">{{ b.used }} jours pris</div>
            </div>
          </div>
        }
        @if (!loadingBalances() && balances().length === 0) {
          <div class="pz-card bal-card" style="color:var(--pz-muted);font-size:13px;">Aucun solde configuré.</div>
        }
      </div>

      <!-- Historique des demandes -->
      <div class="pz-card">
        <div class="card-head"><div class="card-title">Historique de mes demandes</div></div>
        <table class="pz-tbl">
          <thead>
            <tr>
              <th>Réf.</th>
              <th>Type</th>
              <th class="num">Jours</th>
              <th>Période</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @if (myLeaves().length === 0) {
              <tr>
                <td colspan="6" style="text-align:center;padding:40px;color:var(--pz-muted)">Aucune demande de congé</td>
              </tr>
            }
            @for (l of myLeaves(); track l.id) {
              <tr>
                <td class="pz-mono small">{{ l.id }}</td>
                <td>{{ l.type }}</td>
                <td class="num strong">{{ l.days }}j</td>
                <td class="pz-mono small">{{ l.from }} → {{ l.to }}</td>
                <td>
                  <span
                    class="pz-pill"
                    [class.pos]="l.status === 'approved'"
                    [class.warn]="l.status === 'pending'"
                    [class.danger]="l.status === 'rejected'"
                  >
                    <span class="dot"></span>{{ statusLabel(l.status) }}
                  </span>
                </td>
                <td>
                  <button class="pz-btn pz-sm pz-ghost" (click)="selectedLeave.set(l)"><pz-icon name="Eye" [size]="14" [strokeWidth]="1.4" /></button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Nouvelle demande -->
    @if (showCreate()) {
      <div class="pz-overlay" (click)="closeCreate()">
        <div class="pz-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Nouvelle demande de congé</span>
            <button class="pz-modal-close" (click)="closeCreate()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="pz-field">
              <label>Type de congé</label>
              <select [(ngModel)]="form.leaveTypeId">
                @for (lt of leaveTypes(); track lt.id) {
                  <option [ngValue]="lt.id">{{ lt.name }}</option>
                }
              </select>
            </div>
            <div class="pz-field-row">
              <div class="pz-field"><label>Date début</label><input type="date" [(ngModel)]="form.startDate" [min]="today" /></div>
              <div class="pz-field"><label>Date fin</label><input type="date" [(ngModel)]="form.endDate" [min]="form.startDate || today" /></div>
            </div>
            <div class="pz-field">
              <label>Commentaire (optionnel)</label>
              <textarea [(ngModel)]="form.comment" rows="3" placeholder="Précisions…"></textarea>
            </div>
            @if (errMsg()) {
              <div class="pz-err">{{ errMsg() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeCreate()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="busy()" (click)="submitCreate()">
              {{ busy() ? 'Envoi…' : 'Soumettre' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Détail congé -->
    @if (selectedLeave()) {
      <div class="pz-overlay" (click)="selectedLeave.set(null)">
        <div class="pz-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Détail du congé #{{ selectedLeave()!.id }}</span>
            <button class="pz-modal-close" (click)="selectedLeave.set(null)"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="detail-grid">
              <div class="detail-row">
                <span class="detail-label">Type</span>
                <span class="detail-value">{{ selectedLeave()!.type }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Statut</span>
                <span class="detail-value">
                  <span class="pz-pill"
                    [class.pos]="selectedLeave()!.status === 'approved'"
                    [class.warn]="selectedLeave()!.status === 'pending'"
                    [class.danger]="selectedLeave()!.status === 'rejected'">
                    <span class="dot"></span>{{ statusLabel(selectedLeave()!.status) }}
                  </span>
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Période</span>
                <span class="detail-value pz-mono">{{ selectedLeave()!.from }} → {{ selectedLeave()!.to }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Jours ouvrables</span>
                <span class="detail-value"><strong>{{ selectedLeave()!.days }}</strong> j</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Soumis le</span>
                <span class="detail-value pz-mono small">{{ selectedLeave()!.submitted | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              @if (selectedLeave()!.note) {
                <div class="detail-row">
                  <span class="detail-label">Votre commentaire</span>
                  <span class="detail-value">{{ selectedLeave()!.note }}</span>
                </div>
              }
              @if (selectedLeave()!.managerComment) {
                <div class="detail-row">
                  <span class="detail-label">Réponse RH</span>
                  <span class="detail-value" style="color:var(--pz-danger)">{{ selectedLeave()!.managerComment }}</span>
                </div>
              }
            </div>
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn pz-primary" (click)="selectedLeave.set(null)">Fermer</button>
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
      .pz-page-actions {
        display: flex;
        gap: 8px;
      }
      .bal-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--pz-gap);
      }
      .bal-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 18px 20px;
      }
      .ring-wrap {
        position: relative;
        width: 72px;
        height: 72px;
        flex-shrink: 0;
      }
      .ring-ico {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
      }
      .ring {
        transition: stroke-dasharray 1.1s cubic-bezier(0.22, 1, 0.36, 1);
      }
      @keyframes fadeUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .bal-card {
        animation: fadeUp 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      .bal-card:nth-child(1) {
        animation-delay: 0ms;
      }
      .bal-card:nth-child(2) {
        animation-delay: 70ms;
      }
      .bal-card:nth-child(3) {
        animation-delay: 140ms;
      }
      .bal-card:nth-child(4) {
        animation-delay: 210ms;
      }
      .bal-info {
        min-width: 0;
      }
      .bal-num {
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin-top: 2px;
      }
      .bal-num span {
        font-size: 13px;
        font-weight: 500;
        margin-left: 4px;
      }
      .small {
        font-size: 11.5px;
      }
      .strong {
        font-weight: 600;
      }
      .card-head {
        padding: 16px 20px 12px;
      }
      .card-title {
        font-size: 14px;
        font-weight: 600;
      }
      .pz-tbl {
        width: 100%;
        border-collapse: collapse;
      }
      .pz-tbl thead th {
        text-align: left;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
        color: var(--pz-muted);
        padding: 10px 16px;
        border-bottom: 1px solid var(--pz-line);
        background: var(--pz-surface-2);
      }
      .pz-tbl thead th.num,
      .pz-tbl tbody td.num {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .pz-tbl tbody td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--pz-line);
        font-size: 13px;
        color: var(--pz-ink-2);
      }
      .pz-tbl tbody tr:last-child td {
        border-bottom: 0;
      }
      .pz-tbl tbody tr:hover {
        background: var(--pz-surface-2);
      }
      .pz-mono {
        font-family: 'JetBrains Mono', monospace;
      }
      .pz-pill.danger {
        background: #fee2e2;
        color: #b91c1c;
      }
      .pz-primary {
        background: var(--pz-primary);
        color: #fff;
        border-color: var(--pz-primary);
      }
      .pz-primary:hover {
        background: #4338ca;
      }
      .pz-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .pz-modal {
        background: var(--pz-surface);
        border-radius: 14px;
        width: 460px;
        max-width: 95vw;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
        display: flex;
        flex-direction: column;
      }
      .pz-modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 20px 14px;
        font-weight: 600;
        font-size: 15px;
        border-bottom: 1px solid var(--pz-line);
      }
      .pz-modal-close {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--pz-muted);
        display: flex;
      }
      .pz-modal-body {
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .pz-modal-foot {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 14px 20px;
        border-top: 1px solid var(--pz-line);
      }
      .pz-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .pz-field-row {
        display: flex;
        gap: 12px;
      }
      .pz-field-row .pz-field {
        flex: 1;
      }
      .pz-field label {
        font-size: 12px;
        font-weight: 500;
        color: var(--pz-muted);
      }
      .pz-field input,
      .pz-field textarea,
      .pz-field select {
        border: 1px solid var(--pz-line);
        border-radius: 8px;
        padding: 8px 12px;
        font: inherit;
        font-size: 13px;
        background: var(--pz-surface);
        color: var(--pz-ink);
        outline: none;
        width: 100%;
        box-sizing: border-box;
      }
      .pz-field input:focus,
      .pz-field textarea:focus,
      .pz-field select:focus {
        border-color: var(--pz-primary);
      }
      .pz-err {
        color: #b91c1c;
        font-size: 12.5px;
        background: #fee2e2;
        border-radius: 8px;
        padding: 8px 12px;
      }
      .detail-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .detail-row {
        display: flex;
        gap: 12px;
        align-items: baseline;
      }
      .detail-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--pz-muted);
        min-width: 140px;
        flex-shrink: 0;
      }
      .detail-value {
        font-size: 13.5px;
        color: var(--pz-ink);
      }
      @media (max-width: 1024px) {
        .bal-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
    `,
  ],
})
export default class EmpLeavesComponent implements OnInit {
  protected readonly data = inject(DataService);
  protected readonly api = inject(ApiService);

  protected readonly leaveBalancesRaw = signal<LeaveBalance[]>([]);
  protected readonly myLeavesRaw = signal<any[]>([]);
  protected readonly leaveTypes = signal<{ id: number; name: string; maxDays: number }[]>([]);
  protected readonly loadingBalances = signal(true);
  protected readonly busy = signal(false);
  protected readonly errMsg = signal('');
  protected readonly showCreate = signal(false);
  protected readonly selectedLeave = signal<any>(null);
  protected readonly today = new Date().toISOString().slice(0, 10);
  protected form = { leaveTypeId: 0, startDate: '', endDate: '', comment: '' };

  protected readonly balances = computed(() =>
    this.leaveBalancesRaw().map(b => ({
      label: LEAVE_LABEL[b.leaveTypeName] ?? b.leaveTypeName,
      total: +(b.entitled ?? 0) + +(b.carryOver ?? 0),
      used: +(b.taken ?? 0),
      color: LEAVE_COLOR[b.leaveTypeName] ?? '#6b7280',
      icon: LEAVE_ICON[b.leaveTypeName] ?? 'Calendar',
    })),
  );

  protected readonly myLeaves = computed(() => this.myLeavesRaw());

  ngOnInit(): void {
    this.api.myLeaveBalances().subscribe({
      next: v => {
        this.leaveBalancesRaw.set(v);
        this.loadingBalances.set(false);
      },
      error: () => this.loadingBalances.set(false),
    });
    this.api.myLeaveRequests().subscribe({
      next: v => this.myLeavesRaw.set(v),
      error: () => {},
    });
    this.api.leaveTypes().subscribe({
      next: v => {
        this.leaveTypes.set(v);
        if (v.length) this.form.leaveTypeId = v[0].id;
      },
      error: () => {},
    });
  }

  protected dash(used: number, total: number): string {
    const C = 2 * Math.PI * 30;
    if (!total) return `0 ${C}`;
    return `${(used / total) * C} ${C}`;
  }

  protected statusLabel(s: string): string {
    return s === 'approved' ? 'Approuvée' : s === 'pending' ? 'En attente' : 'Refusée';
  }

  openCreate() {
    const first = this.leaveTypes()[0]?.id ?? 0;
    this.form = { leaveTypeId: first, startDate: '', endDate: '', comment: '' };
    this.errMsg.set('');
    this.showCreate.set(true);
  }
  closeCreate() {
    this.showCreate.set(false);
  }

  submitCreate() {
    if (!this.form.startDate || !this.form.endDate) {
      this.errMsg.set('Veuillez remplir les dates.');
      return;
    }
    this.busy.set(true);
    this.errMsg.set('');
    this.api
      .createLeaveRequest({
        leaveTypeId: this.form.leaveTypeId,
        startDate: this.form.startDate,
        endDate: this.form.endDate,
        comment: this.form.comment || undefined,
        employeeId: this.data.myEmployee()?.id,
      })
      .subscribe({
        next: () => {
          this.api.myLeaveBalances().subscribe({ next: v => this.leaveBalancesRaw.set(v), error: () => {} });
          this.api.myLeaveRequests().subscribe({ next: v => this.myLeavesRaw.set(v), error: () => {} });
          this.busy.set(false);
          this.showCreate.set(false);
        },
        error: err => {
          this.errMsg.set(err?.error?.detail ?? err?.error?.title ?? 'Erreur lors de la soumission.');
          this.busy.set(false);
        },
      });
  }
}
