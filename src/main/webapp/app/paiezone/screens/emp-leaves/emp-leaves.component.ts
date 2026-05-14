import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';

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
          <h1>Mes congés</h1>
          <div class="pz-muted">Gérez vos demandes de congé et consultez vos soldes</div>
        </div>
        <button class="pz-btn pz-primary" (click)="openCreate()">
          <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Nouvelle demande
        </button>
      </div>

      <div class="balances">
        @for (b of balances; track b.label) {
          <div class="pz-card bal-card">
            <div class="bal-label">{{ b.label }}</div>
            <div class="bal-val">
              <span class="big">{{ b.remaining }}</span
              ><span class="pz-muted"> / {{ b.total }} j</span>
            </div>
            <div class="progress"><i [style.width.%]="(b.used / b.total) * 100" [style.background]="b.color"></i></div>
            <div class="bal-foot pz-muted">{{ b.used }} j utilisés</div>
          </div>
        }
      </div>

      <div class="pz-card">
        <div class="card-head">
          <div class="card-title">Mes demandes</div>
        </div>
        <table class="pz-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Période</th>
              <th>Durée</th>
              <th>Soumis</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            @if (myLeaves().length === 0) {
              <tr>
                <td colspan="5" style="text-align:center;padding:40px;color:var(--pz-muted)">Aucune demande de congé</td>
              </tr>
            }
            @for (l of myLeaves(); track l.id) {
              <tr>
                <td>
                  <span class="pz-pill info">{{ l.type }}</span>
                </td>
                <td class="pz-mono" style="font-size:12px">{{ l.from }} → {{ l.to }}</td>
                <td>
                  <strong>{{ l.days }}</strong> j
                </td>
                <td style="color:var(--pz-muted);font-size:12px">{{ l.submitted }}</td>
                <td>
                  <span
                    class="pz-pill"
                    [class.warn]="l.status === 'pending'"
                    [class.pos]="l.status === 'approved'"
                    [class.danger]="l.status === 'rejected'"
                  >
                    {{ l.status === 'pending' ? 'En attente' : l.status === 'approved' ? 'Approuvé' : 'Refusé' }}
                  </span>
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
                <option [value]="1">Congé payé</option>
                <option [value]="2">RTT</option>
                <option [value]="3">Congé maladie</option>
                <option [value]="4">Congé sans solde</option>
              </select>
            </div>
            <div class="pz-field-row">
              <div class="pz-field">
                <label>Date début</label>
                <input type="date" [(ngModel)]="form.startDate" />
              </div>
              <div class="pz-field">
                <label>Date fin</label>
                <input type="date" [(ngModel)]="form.endDate" />
              </div>
            </div>
            <div class="pz-field">
              <label>Nombre de jours ouvrables</label>
              <input type="number" [(ngModel)]="form.numberOfDays" min="1" />
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
      .balances {
        display: grid;
        gap: var(--pz-gap);
        grid-template-columns: repeat(3, 1fr);
      }
      .bal-card {
        padding: 18px 20px;
      }
      .bal-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--pz-muted);
        margin-bottom: 6px;
      }
      .bal-val {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 10px;
      }
      .big {
        font-size: 32px;
      }
      .progress {
        height: 5px;
        background: var(--pz-surface-3);
        border-radius: 999px;
        overflow: hidden;
        margin-bottom: 6px;
      }
      .progress i {
        display: block;
        height: 100%;
        border-radius: 999px;
      }
      .bal-foot {
        font-size: 12px;
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
        color: var(--pz-danger-ink, #b91c1c);
        font-size: 12.5px;
        background: #fee2e2;
        border-radius: 8px;
        padding: 8px 12px;
      }
    `,
  ],
})
export default class EmpLeavesComponent {
  protected readonly data = inject(DataService);
  protected readonly api = inject(ApiService);
  protected readonly myLeaves = computed(() => this.data.leaves().slice(0, 10));
  protected readonly busy = signal(false);
  protected readonly errMsg = signal('');
  protected readonly showCreate = signal(false);
  protected form = { leaveTypeId: 1, startDate: '', endDate: '', numberOfDays: 1, comment: '' };

  protected readonly balances = [
    { label: 'Congés payés', used: 4, total: 24, remaining: 20, color: '#4f46e5' },
    { label: 'RTT', used: 2, total: 11, remaining: 9, color: '#0ea5e9' },
    { label: 'Congé maladie', used: 0, total: 15, remaining: 15, color: '#f59e0b' },
  ];

  openCreate() {
    this.form = { leaveTypeId: 1, startDate: '', endDate: '', numberOfDays: 1, comment: '' };
    this.errMsg.set('');
    this.showCreate.set(true);
  }
  closeCreate() {
    this.showCreate.set(false);
  }

  submitCreate() {
    if (!this.form.startDate || !this.form.endDate || this.form.numberOfDays < 1) {
      this.errMsg.set('Veuillez remplir les dates et le nombre de jours.');
      return;
    }
    this.busy.set(true);
    this.errMsg.set('');
    this.api
      .createLeaveRequest({
        leaveTypeId: this.form.leaveTypeId,
        startDate: this.form.startDate,
        endDate: this.form.endDate,
        numberOfDays: this.form.numberOfDays,
        comment: this.form.comment || undefined,
        employeeId: this.data.myEmployee()?.id,
      })
      .subscribe({
        next: leave => {
          this.data.leaves.update(list => [leave, ...list]);
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
