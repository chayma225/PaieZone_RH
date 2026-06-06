import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';

interface RequestRow {
  ref: string;
  type: string;
  detail: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

@Component({
  selector: 'pz-emp-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>Mon espace</strong> <span class="sep">/</span> Mes demandes</div>
          <h1>Toutes mes demandes</h1>
          <div class="pz-muted">Suivi de l'ensemble de vos requêtes RH</div>
        </div>
      </div>

      <!-- Tuiles d'action -->
      <div class="tiles">
        <button class="pz-card tile" routerLink="/paiezone/emp-leaves">
          <div class="tile-ico"><pz-icon name="Calendar" [size]="20" /></div>
          <div class="tile-title">Demander un congé</div>
          <div class="pz-muted tile-sub">Posez vos congés payés, RTT ou jours exceptionnels</div>
          <div class="tile-go">Commencer <pz-icon name="Arrow" [size]="12" [strokeWidth]="1.6" /></div>
        </button>
        <button class="pz-card tile" (click)="openCreate()">
          <div class="tile-ico"><pz-icon name="Cash" [size]="20" /></div>
          <div class="tile-title">Demander une avance</div>
          <div class="pz-muted tile-sub">Sollicitez une avance sur votre prochain salaire</div>
          <div class="tile-go">Commencer <pz-icon name="Arrow" [size]="12" [strokeWidth]="1.6" /></div>
        </button>
        <button class="pz-card tile" disabled style="opacity:.5;cursor:default">
          <div class="tile-ico"><pz-icon name="Doc" [size]="20" /></div>
          <div class="tile-title">Demander un document</div>
          <div class="pz-muted tile-sub">Attestation employeur, certificat, etc.</div>
          <div class="tile-go pz-muted">Bientôt disponible</div>
        </button>
      </div>

      <!-- Historique unifié -->
      <div class="pz-card">
        <div class="card-head">
          <div class="card-title">Historique</div>
          <div class="pz-muted small">6 derniers mois</div>
        </div>
        <table class="pz-tbl">
          <thead>
            <tr>
              <th>Réf.</th>
              <th>Type</th>
              <th>Détail</th>
              <th>Date</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @if (requests().length === 0) {
              <tr>
                <td colspan="6" style="text-align:center;padding:40px;color:var(--pz-muted)">Aucune demande</td>
              </tr>
            }
            @for (r of requests(); track r.ref) {
              <tr>
                <td class="pz-mono small">{{ r.ref }}</td>
                <td class="strong">{{ r.type }}</td>
                <td class="pz-muted">{{ r.detail }}</td>
                <td class="pz-mono small">{{ r.date }}</td>
                <td>
                  <span
                    class="pz-pill"
                    [class.pos]="r.status === 'approved'"
                    [class.warn]="r.status === 'pending'"
                    [class.danger]="r.status === 'rejected'"
                  >
                    <span class="dot"></span>{{ statusLabel(r.status) }}
                  </span>
                </td>
                <td>
                  <button class="pz-btn pz-sm pz-ghost"><pz-icon name="Eye" [size]="14" [strokeWidth]="1.4" /></button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Avance -->
    @if (showCreate()) {
      <div class="pz-overlay" (click)="closeCreate()">
        <div class="pz-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Demande d'avance sur salaire</span>
            <button class="pz-modal-close" (click)="closeCreate()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="pz-field">
              <label>Montant souhaité (TND)</label>
              <input type="number" [(ngModel)]="form.amount" min="1" placeholder="ex: 300" />
            </div>
            <div class="pz-field">
              <label>Motif de la demande</label>
              <textarea [(ngModel)]="form.reason" rows="3" placeholder="Expliquez brièvement la raison…"></textarea>
            </div>
            <div class="pz-field">
              <label>Mois de déduction souhaité (optionnel)</label>
              <select [(ngModel)]="form.deductionMonth">
                <option [value]="null">— Non précisé —</option>
                <option [value]="1">Janvier</option>
                <option [value]="2">Février</option>
                <option [value]="3">Mars</option>
                <option [value]="4">Avril</option>
                <option [value]="5">Mai</option>
                <option [value]="6">Juin</option>
                <option [value]="7">Juillet</option>
                <option [value]="8">Août</option>
                <option [value]="9">Septembre</option>
                <option [value]="10">Octobre</option>
                <option [value]="11">Novembre</option>
                <option [value]="12">Décembre</option>
              </select>
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
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .tiles {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--pz-gap);
      }
      .tile {
        text-align: left;
        padding: 20px;
        cursor: pointer;
        border: 1px solid var(--pz-line);
        background: #fff;
        border-radius: var(--pz-radius-lg, 14px);
        transition:
          transform 0.15s,
          box-shadow 0.15s,
          border-color 0.15s;
      }
      .tile:not([disabled]):hover {
        transform: translateY(-3px);
        box-shadow: var(--pz-shadow-lg);
        border-color: var(--pz-primary);
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
      .tile {
        animation: fadeUp 340ms cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      .tile:nth-child(1) {
        animation-delay: 0ms;
      }
      .tile:nth-child(2) {
        animation-delay: 80ms;
      }
      .tile:nth-child(3) {
        animation-delay: 160ms;
      }
      .tile-ico {
        width: 44px;
        height: 44px;
        border-radius: 11px;
        background: var(--pz-primary-soft);
        color: var(--pz-primary);
        display: grid;
        place-items: center;
      }
      .tile-title {
        font-size: 15px;
        font-weight: 600;
        margin-top: 14px;
        color: var(--pz-ink);
      }
      .tile-sub {
        font-size: 12.5px;
        margin-top: 4px;
        line-height: 1.5;
      }
      .tile-go {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 14px;
        color: var(--pz-primary);
        font-size: 13px;
        font-weight: 600;
      }
      .card-head {
        padding: 16px 20px 12px;
        display: flex;
        align-items: baseline;
        gap: 10px;
      }
      .card-head .small {
        margin-left: auto;
      }
      .card-title {
        font-size: 14px;
        font-weight: 600;
      }
      .small {
        font-size: 11.5px;
      }
      .strong {
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
        width: 440px;
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
      @media (max-width: 1024px) {
        .tiles {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export default class EmpRequestsComponent {
  protected readonly data = inject(DataService);
  protected readonly api = inject(ApiService);
  protected readonly busy = signal(false);
  protected readonly errMsg = signal('');
  protected readonly showCreate = signal(false);
  protected form = { amount: 0, reason: '', deductionMonth: null as number | null };

  // Historique unifié : avances + congés de l'employé connecté
  protected readonly requests = computed<RequestRow[]>(() => {
    const empId = this.data.myEmployee()?.id;
    const rows: RequestRow[] = [];

    for (const a of this.data.advances()) {
      if (empId != null && a.empId !== empId) continue;
      rows.push({
        ref: `AV-${a.id}`,
        type: 'Avance sur salaire',
        detail: `${this.data.fmtTND(a.amount)}${a.repayment ? ' · ' + a.repayment : ''}`,
        date: a.submitted ? new Date(a.submitted).toLocaleDateString('fr-FR') : '—',
        status: a.status as any,
      });
    }

    for (const l of this.data.leaves()) {
      if (empId != null && l.empId !== empId) continue;
      rows.push({
        ref: `LV-${l.id}`,
        type: l.type,
        detail: `${l.days}j · ${l.from} → ${l.to}`,
        date: l.submitted ? new Date(l.submitted).toLocaleDateString('fr-FR') : '—',
        status: l.status as any,
      });
    }

    return rows.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
  });

  protected statusLabel(s: string): string {
    return s === 'approved' ? 'Approuvée' : s === 'pending' ? 'En attente' : 'Refusée';
  }

  openCreate() {
    this.form = { amount: 0, reason: '', deductionMonth: null };
    this.errMsg.set('');
    this.showCreate.set(true);
  }
  closeCreate() {
    this.showCreate.set(false);
  }

  submitCreate() {
    if (!this.form.amount || this.form.amount <= 0 || !this.form.reason.trim()) {
      this.errMsg.set('Veuillez indiquer un montant et un motif.');
      return;
    }
    this.busy.set(true);
    this.errMsg.set('');
    this.api
      .createAdvance({
        amount: this.form.amount,
        reason: this.form.reason,
        deductionMonth: this.form.deductionMonth ?? undefined,
        employeeId: this.data.myEmployee()?.id,
      })
      .subscribe({
        next: adv => {
          this.data.advances.update(list => [adv, ...list]);
          this.busy.set(false);
          this.showCreate.set(false);
        },
        error: () => {
          this.errMsg.set('Erreur lors de la soumission.');
          this.busy.set(false);
        },
      });
  }
}
