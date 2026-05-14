import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'pz-rh-finances',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>RH</strong> <span class="sep">/</span> Finances RH</div>
          <h1>Avances sur salaire</h1>
          <div class="pz-muted">
            {{ data.advances().length }} demande(s) ·
            {{ pendingAmt() > 0 ? data.fmtTND(pendingAmt()) + ' en attente' : 'Aucune en attente' }}
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="pz-btn pz-primary" (click)="openCreate()">
            <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Nouvelle avance
          </button>
        </div>
      </div>

      <div class="stat-grid">
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico warn"><pz-icon name="Cash" /></span>En attente
          </div>
          <div class="stat-val">{{ pendingCount() }}</div>
          <div class="stat-foot pz-muted">{{ data.fmtTND(pendingAmt()) }}</div>
        </div>
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico pos"><pz-icon name="Check" /></span>Approuvées
          </div>
          <div class="stat-val">{{ approvedCount() }}</div>
          <div class="stat-foot pz-muted">ce mois</div>
        </div>
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico"><pz-icon name="Wallet" /></span>Total accordé
          </div>
          <div class="stat-val">{{ data.fmtTND(totalApproved()) }}</div>
          <div class="stat-foot pz-muted">sur l'année</div>
        </div>
      </div>

      <div class="pz-card">
        <div class="card-head"><div class="card-title">Demandes d'avance</div></div>
        <table class="pz-table">
          <thead>
            <tr>
              <th>Employé</th>
              <th>Montant</th>
              <th>Motif</th>
              <th>Remboursement</th>
              <th>Soumis</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @if (data.advances().length === 0) {
              <tr>
                <td colspan="7" style="text-align:center;padding:40px;color:var(--pz-muted)">Aucune demande d'avance</td>
              </tr>
            }
            @for (a of data.advances(); track a.id) {
              @let e = data.empById(a.empId);
              <tr>
                <td>
                  @if (e) {
                    <div style="display:flex;align-items:center;gap:10px">
                      <div class="pz-avatar sm" [attr.data-bg]="data.empBgIdx(e.id)">{{ data.initials(e) }}</div>
                      <div>
                        <div style="font-weight:500;font-size:13px">{{ data.fullName(e) }}</div>
                        <div style="font-size:11.5px;color:var(--pz-muted)">{{ e.dept }}</div>
                      </div>
                    </div>
                  } @else {
                    <span class="pz-muted">—</span>
                  }
                </td>
                <td>
                  <strong class="pz-mono">{{ data.fmtTND(a.amount) }}</strong>
                </td>
                <td style="color:var(--pz-ink-2);font-size:12.5px;max-width:200px">{{ a.reason }}</td>
                <td style="color:var(--pz-muted);font-size:12px">{{ a.repayment }}</td>
                <td style="color:var(--pz-muted);font-size:12px">{{ a.submitted }}</td>
                <td>
                  <span
                    class="pz-pill"
                    [class.warn]="a.status === 'pending'"
                    [class.pos]="a.status === 'approved'"
                    [class.danger]="a.status === 'rejected'"
                  >
                    {{ a.status === 'pending' ? 'En attente' : a.status === 'approved' ? 'Approuvée' : 'Refusée' }}
                  </span>
                </td>
                <td>
                  @if (a.status === 'pending') {
                    <div style="display:flex;gap:6px">
                      <button
                        class="pz-btn pz-sm"
                        style="background:var(--pz-pos);color:#fff;border-color:var(--pz-pos)"
                        [disabled]="busy()"
                        (click)="approve(a.id)"
                        title="Approuver"
                      >
                        <pz-icon name="Check" [size]="13" [strokeWidth]="1.8" />
                      </button>
                      <button
                        class="pz-btn pz-sm"
                        style="color:var(--pz-danger-ink)"
                        [disabled]="busy()"
                        (click)="openReject(a.id)"
                        title="Refuser"
                      >
                        <pz-icon name="X" [size]="13" [strokeWidth]="1.6" />
                      </button>
                    </div>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Nouvelle avance -->
    @if (showCreate()) {
      <div class="pz-overlay" (click)="closeCreate()">
        <div class="pz-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Nouvelle avance sur salaire</span>
            <button class="pz-modal-close" (click)="closeCreate()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="pz-field">
              <label>Employé</label>
              <select [(ngModel)]="form.employeeId">
                <option [value]="0">— Sélectionner —</option>
                @for (e of data.employees(); track e.id) {
                  <option [value]="e.id">{{ data.fullName(e) }} ({{ e.matricule }})</option>
                }
              </select>
            </div>
            <div class="pz-field">
              <label>Montant (TND)</label>
              <input type="number" [(ngModel)]="form.amount" min="1" placeholder="ex: 500" />
            </div>
            <div class="pz-field">
              <label>Motif</label>
              <textarea [(ngModel)]="form.reason" rows="2" placeholder="Expliquez la raison de la demande…"></textarea>
            </div>
            <div class="pz-field">
              <label>Mois de déduction (optionnel)</label>
              <input type="number" [(ngModel)]="form.deductionMonth" min="1" max="12" placeholder="ex: 6" />
            </div>
            @if (errMsg()) {
              <div class="pz-err">{{ errMsg() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeCreate()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="busy()" (click)="submitCreate()">
              @if (busy()) {
                Enregistrement…
              } @else {
                Soumettre
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Refus -->
    @if (rejectId()) {
      <div class="pz-overlay" (click)="closeReject()">
        <div class="pz-modal pz-modal-sm" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Motif du refus</span>
            <button class="pz-modal-close" (click)="closeReject()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="pz-field">
              <label>Raison</label>
              <textarea [(ngModel)]="rejectReason" rows="3" placeholder="Expliquez le motif du refus…"></textarea>
            </div>
            @if (errMsg()) {
              <div class="pz-err">{{ errMsg() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeReject()">Annuler</button>
            <button
              class="pz-btn"
              style="background:var(--pz-danger);color:#fff;border-color:var(--pz-danger)"
              [disabled]="busy()"
              (click)="confirmReject()"
            >
              @if (busy()) {
                …
              } @else {
                Confirmer le refus
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
      .stat-grid {
        display: grid;
        gap: var(--pz-gap);
        grid-template-columns: repeat(3, 1fr);
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
      }
      .stat-foot {
        font-size: 12px;
        margin-top: 8px;
      }
      .card-head {
        padding: 16px 20px 8px;
      }
      .card-title {
        font-size: 14px;
        font-weight: 600;
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
      .pz-modal-sm {
        width: 380px;
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
      .pz-field textarea {
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
      .pz-field textarea:focus {
        border-color: var(--pz-primary);
      }
      .pz-err {
        color: var(--pz-danger-ink, #b91c1c);
        font-size: 12.5px;
        background: #fee2e2;
        border-radius: 8px;
        padding: 8px 12px;
      }
    `,
  ],
})
export default class RhFinancesComponent {
  protected readonly data = inject(DataService);
  protected readonly api = inject(ApiService);
  protected readonly busy = signal(false);
  protected readonly errMsg = signal('');
  protected readonly showCreate = signal(false);
  protected readonly rejectId = signal<string | null>(null);
  protected rejectReason = '';
  protected form = { employeeId: 0, amount: 0, reason: '', deductionMonth: null as number | null };

  protected readonly pendingCount = computed(() => this.data.advances().filter(a => a.status === 'pending').length);
  protected readonly pendingAmt = computed(() =>
    this.data
      .advances()
      .filter(a => a.status === 'pending')
      .reduce((s, a) => s + a.amount, 0),
  );
  protected readonly approvedCount = computed(() => this.data.advances().filter(a => a.status === 'approved').length);
  protected readonly totalApproved = computed(() =>
    this.data
      .advances()
      .filter(a => a.status === 'approved')
      .reduce((s, a) => s + a.amount, 0),
  );

  openCreate() {
    this.form = { employeeId: 0, amount: 0, reason: '', deductionMonth: null };
    this.errMsg.set('');
    this.showCreate.set(true);
  }
  closeCreate() {
    this.showCreate.set(false);
  }

  submitCreate() {
    if (!this.form.employeeId || !this.form.amount || this.form.amount <= 0 || !this.form.reason.trim()) {
      this.errMsg.set('Veuillez sélectionner un employé, indiquer un montant et un motif.');
      return;
    }
    this.busy.set(true);
    this.errMsg.set('');
    this.api
      .createAdvance({
        employeeId: this.form.employeeId,
        amount: this.form.amount,
        reason: this.form.reason,
        deductionMonth: this.form.deductionMonth ?? undefined,
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

  approve(id: string) {
    this.busy.set(true);
    this.api.approveAdvance(+id).subscribe({
      next: updated => {
        this.data.advances.update(list => list.map(a => (a.id === id ? updated : a)));
        this.busy.set(false);
      },
      error: () => this.busy.set(false),
    });
  }

  openReject(id: string) {
    this.rejectReason = '';
    this.errMsg.set('');
    this.rejectId.set(id);
  }
  closeReject() {
    this.rejectId.set(null);
  }

  confirmReject() {
    const id = this.rejectId();
    if (!id) return;
    this.busy.set(true);
    this.errMsg.set('');
    this.api.rejectAdvance(+id, this.rejectReason).subscribe({
      next: updated => {
        this.data.advances.update(list => list.map(a => (a.id === id ? updated : a)));
        this.busy.set(false);
        this.rejectId.set(null);
      },
      error: () => {
        this.errMsg.set('Erreur lors du refus.');
        this.busy.set(false);
      },
    });
  }
}
