import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'pz-rh-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>RH</strong> <span class="sep">/</span> Paie</div>
          <h1>Gestion de la paie</h1>
          <div class="pz-muted">{{ data.payrollPeriods().length }} période(s) enregistrée(s)</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="pz-btn pz-primary" (click)="openCreate()">
            <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Nouvelle période
          </button>
        </div>
      </div>

      <div class="pz-card">
        <div class="card-head"><div class="card-title">Périodes de paie</div></div>
        <table class="pz-table">
          <thead>
            <tr>
              <th>Période</th>
              <th>Bulletins</th>
              <th>Brut total</th>
              <th>Net total</th>
              <th>Statut</th>
              <th>Validé le</th>
              <th>Verrouillé le</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @if (data.payrollPeriods().length === 0) {
              <tr>
                <td colspan="8" style="text-align:center;padding:40px;color:var(--pz-muted)">Aucune période de paie</td>
              </tr>
            }
            @for (p of data.payrollPeriods(); track p.id) {
              <tr>
                <td>
                  <strong>{{ p.label }}</strong>
                </td>
                <td>{{ p.employees > 0 ? p.employees : '—' }}</td>
                <td class="pz-mono">{{ p.gross > 0 ? data.fmtTND(p.gross) : '—' }}</td>
                <td class="pz-mono">{{ p.net > 0 ? data.fmtTND(p.net) : '—' }}</td>
                <td>
                  <span class="pz-pill" [class]="statusClass(p.status)">{{ statusLabel(p.status) }}</span>
                </td>
                <td style="color:var(--pz-muted);font-size:12px">{{ p.validatedAt ?? '—' }}</td>
                <td style="color:var(--pz-muted);font-size:12px">{{ p.lockedAt ?? '—' }}</td>
                <td>
                  <div style="display:flex;gap:6px">
                    @if (p.status === 'DRAFT') {
                      <button class="pz-btn pz-sm pz-primary" [disabled]="busy()" (click)="calculate(p.id)">
                        @if (busy()) {
                          …
                        } @else {
                          Calculer
                        }
                      </button>
                    }
                    @if (p.status === 'CALCULATED') {
                      <button class="pz-btn pz-sm pz-primary" [disabled]="busy()" (click)="validate(p.id)">
                        @if (busy()) {
                          …
                        } @else {
                          Valider
                        }
                      </button>
                    }
                    @if (p.status === 'VALIDATED') {
                      <button
                        class="pz-btn pz-sm"
                        style="border-color:var(--pz-primary);color:var(--pz-primary)"
                        [disabled]="busy()"
                        (click)="lock(p.id)"
                      >
                        @if (busy()) {
                          …
                        } @else {
                          Verrouiller
                        }
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="pz-card">
        <div class="card-head"><div class="card-title">Barème IRPP 2026 (LF 2026)</div></div>
        <table class="pz-table">
          <thead>
            <tr>
              <th>Tranche annuelle (TND)</th>
              <th>Taux</th>
            </tr>
          </thead>
          <tbody>
            @for (b of data.irppBrackets(); track b.from) {
              <tr>
                <td class="pz-mono" style="font-size:12px">
                  {{ b.from.toLocaleString('fr-FR') }} → {{ b.to ? b.to.toLocaleString('fr-FR') : '∞' }}
                </td>
                <td>
                  <strong>{{ b.rate }} %</strong>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Nouvelle période -->
    @if (showCreate()) {
      <div class="pz-overlay" (click)="closeCreate()">
        <div class="pz-modal pz-modal-sm" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Nouvelle période de paie</span>
            <button class="pz-modal-close" (click)="closeCreate()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="pz-field-row">
              <div class="pz-field">
                <label>Mois</label>
                <select [(ngModel)]="form.month">
                  @for (m of months; track m.v) {
                    <option [value]="m.v">{{ m.label }}</option>
                  }
                </select>
              </div>
              <div class="pz-field">
                <label>Année</label>
                <input type="number" [(ngModel)]="form.year" min="2020" max="2030" />
              </div>
            </div>
            @if (errMsg()) {
              <div class="pz-err">{{ errMsg() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeCreate()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="busy()" (click)="submitCreate()">
              @if (busy()) {
                Création…
              } @else {
                Créer
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
        width: 340px;
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
export default class RhPayrollComponent {
  protected readonly data = inject(DataService);
  protected readonly api = inject(ApiService);
  protected readonly busy = signal(false);
  protected readonly errMsg = signal('');
  protected readonly showCreate = signal(false);
  protected form = { month: new Date().getMonth() + 1, year: new Date().getFullYear() };

  protected readonly months = [
    { v: 1, label: 'Janvier' },
    { v: 2, label: 'Février' },
    { v: 3, label: 'Mars' },
    { v: 4, label: 'Avril' },
    { v: 5, label: 'Mai' },
    { v: 6, label: 'Juin' },
    { v: 7, label: 'Juillet' },
    { v: 8, label: 'Août' },
    { v: 9, label: 'Septembre' },
    { v: 10, label: 'Octobre' },
    { v: 11, label: 'Novembre' },
    { v: 12, label: 'Décembre' },
  ];

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      DRAFT: 'Brouillon',
      CALCULATED: 'Calculée',
      VALIDATED: 'Validée',
      LOCKED: 'Verrouillée',
      EXPORTED: 'Exportée',
    };
    return m[s] ?? s;
  }
  statusClass(s: string): string {
    if (s === 'DRAFT') return 'warn';
    if (s === 'CALCULATED') return 'info';
    if (s === 'VALIDATED' || s === 'LOCKED' || s === 'EXPORTED') return 'pos';
    return '';
  }

  openCreate() {
    this.form = { month: new Date().getMonth() + 1, year: new Date().getFullYear() };
    this.errMsg.set('');
    this.showCreate.set(true);
  }
  closeCreate() {
    this.showCreate.set(false);
  }

  submitCreate() {
    this.busy.set(true);
    this.errMsg.set('');
    const companyId = this.data.companies()[0]?.id;
    this.api.createPayrollPeriod(this.form.month, this.form.year, companyId).subscribe({
      next: period => {
        this.data.payrollPeriods.update(list => [period, ...list]);
        this.busy.set(false);
        this.showCreate.set(false);
      },
      error: () => {
        this.errMsg.set('Erreur lors de la création.');
        this.busy.set(false);
      },
    });
  }

  calculate(id: number) {
    this.busy.set(true);
    this.api.calculatePayroll(id).subscribe({
      next: () => {
        this.reloadPeriods();
      },
      error: () => this.busy.set(false),
    });
  }

  validate(id: number) {
    this.busy.set(true);
    this.api.validatePayroll(id).subscribe({
      next: () => {
        this.reloadPeriods();
      },
      error: () => this.busy.set(false),
    });
  }

  lock(id: number) {
    this.busy.set(true);
    this.api.lockPayroll(id).subscribe({
      next: () => {
        this.reloadPeriods();
      },
      error: () => this.busy.set(false),
    });
  }

  private reloadPeriods() {
    this.api.payrollPeriods().subscribe({
      next: periods => {
        this.data.payrollPeriods.set(periods);
        this.busy.set(false);
      },
      error: () => this.busy.set(false),
    });
  }
}
