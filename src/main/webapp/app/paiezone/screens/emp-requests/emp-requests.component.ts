import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'pz-emp-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>Mon espace</strong> <span class="sep">/</span> Mes demandes</div>
          <h1>Mes demandes</h1>
          <div class="pz-muted">Avances sur salaire et autres demandes</div>
        </div>
        <button class="pz-btn pz-primary" (click)="openCreate()">
          <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Demander une avance
        </button>
      </div>

      <div class="pz-card">
        <div class="card-head"><div class="card-title">Demandes d'avance</div></div>
        <table class="pz-table">
          <thead>
            <tr>
              <th>Montant</th>
              <th>Motif</th>
              <th>Remboursement</th>
              <th>Soumis</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            @if (myAdvances().length === 0) {
              <tr>
                <td colspan="5" style="text-align:center;padding:60px">
                  <pz-icon name="Cash" [size]="28" [strokeWidth]="1.2" />
                  <div style="margin-top:10px;font-size:13px;color:var(--pz-muted)">Aucune demande d'avance</div>
                </td>
              </tr>
            }
            @for (a of myAdvances(); track a.id) {
              <tr>
                <td>
                  <strong class="pz-mono">{{ data.fmtTND(a.amount) }}</strong>
                </td>
                <td style="font-size:12.5px;max-width:220px">{{ a.reason }}</td>
                <td style="font-size:12px;color:var(--pz-muted)">{{ a.repayment }}</td>
                <td style="font-size:12px;color:var(--pz-muted)">{{ a.submitted }}</td>
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
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Demande d'avance -->
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
              @if (busy()) {
                Envoi…
              } @else {
                Soumettre
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
        color: var(--pz-danger-ink, #b91c1c);
        font-size: 12.5px;
        background: #fee2e2;
        border-radius: 8px;
        padding: 8px 12px;
      }
    `,
  ],
})
export default class EmpRequestsComponent {
  protected readonly data = inject(DataService);
  protected readonly api = inject(ApiService);
  protected readonly myAdvances = computed(() => this.data.advances().slice(0, 10));
  protected readonly busy = signal(false);
  protected readonly errMsg = signal('');
  protected readonly showCreate = signal(false);
  protected form = { amount: 0, reason: '', deductionMonth: null as number | null };

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
