import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { AccountPlan, AccountingEntry } from '../../core/types';

type Tab = 'plan' | 'ecritures' | 'conformite';

const ACCOUNT_TYPES = ['CHARGE', 'PRODUIT', 'BILAN', 'TRESORERIE', 'AUTRE'];
const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CHARGE: 'Charge',
  PRODUIT: 'Produit',
  BILAN: 'Bilan',
  TRESORERIE: 'Trésorerie',
  AUTRE: 'Autre',
};

const DEFAULT_PLAN: Omit<AccountPlan, 'id'>[] = [
  { accountCode: '641000', accountLabel: 'Salaires bruts', accountType: 'CHARGE', active: true },
  { accountCode: '641100', accountLabel: 'Charges patronales CNSS', accountType: 'CHARGE', active: true },
  { accountCode: '431000', accountLabel: 'CNSS salarié à payer', accountType: 'BILAN', active: true },
  { accountCode: '432000', accountLabel: 'IRPP retenu à la source', accountType: 'BILAN', active: true },
  { accountCode: '433000', accountLabel: 'CAVIS salarié', accountType: 'BILAN', active: true },
  { accountCode: '434000', accountLabel: 'CSS salarié', accountType: 'BILAN', active: true },
  { accountCode: '421000', accountLabel: 'Rémunérations dues (net à payer)', accountType: 'BILAN', active: true },
];

@Component({
  selector: 'pz-rh-accounting',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>RH</strong> <span class="sep">/</span> Comptabilité</div>
          <h1>Intégration comptable</h1>
          <div class="pz-muted">Plan comptable · écritures auto-générées · export SAGE</div>
        </div>
        <div style="display:flex;gap:8px">
          @if (activeTab() === 'plan') {
            @if (!accountPlans().length) {
              <button class="pz-btn" (click)="initDefaultPlan()" [disabled]="busy()">
                <pz-icon name="List" [size]="14" /> Initialiser plan tunisien
              </button>
            }
            <button class="pz-btn pz-primary" (click)="openCreate()">
              <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Nouveau compte
            </button>
          }
          @if (activeTab() === 'ecritures') {
            <button class="pz-btn pz-primary" [disabled]="!filteredEntries().length" (click)="exportSage()">
              <pz-icon name="Download" [size]="14" /> Exporter SAGE (.csv)
            </button>
          }
        </div>
      </div>

      <!-- Tabs -->
      <div class="pz-tabs">
        <button class="pz-tab" [class.active]="activeTab() === 'plan'" (click)="setTab('plan')">
          <pz-icon name="List" [size]="14" /> Plan comptable
          <span class="cnt">{{ accountPlans().length }}</span>
        </button>
        <button class="pz-tab" [class.active]="activeTab() === 'ecritures'" (click)="setTab('ecritures')">
          <pz-icon name="FileText" [size]="14" /> Écritures comptables
          <span class="cnt">{{ entries().length }}</span>
        </button>
        <button class="pz-tab" [class.active]="activeTab() === 'conformite'" (click)="setTab('conformite')">
          <pz-icon name="Shield" [size]="14" /> Conformité
        </button>
      </div>

      <!-- ── TAB : Plan comptable ───────────────────────────────────────────── -->
      @if (activeTab() === 'plan') {
        <div class="pz-card">
          <table class="pz-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Libellé</th>
                <th>Type</th>
                <th>Actif</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                <tr>
                  <td colspan="5" class="empty-cell">Chargement…</td>
                </tr>
              } @else if (!accountPlans().length) {
                <tr>
                  <td colspan="5" class="empty-cell">
                    Aucun compte défini. Cliquez sur <strong>Initialiser le plan tunisien</strong> pour démarrer.
                  </td>
                </tr>
              }
              @for (p of accountPlans(); track p.id) {
                <tr>
                  <td>
                    <span class="pz-mono code-pill">{{ p.accountCode }}</span>
                  </td>
                  <td>
                    <span class="strong">{{ p.accountLabel }}</span>
                  </td>
                  <td>
                    <span class="pz-pill" [class]="typePillClass(p.accountType)">
                      {{ typeLabel(p.accountType) }}
                    </span>
                  </td>
                  <td>
                    <span class="pz-pill" [class]="p.active ? 'pos' : 'warn'">
                      <span class="dot"></span>{{ p.active ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>
                  <td>
                    <div style="display:flex;gap:6px">
                      <button class="pz-btn pz-sm" (click)="openEdit(p)">
                        <pz-icon name="Edit" [size]="13" />
                      </button>
                      <button class="pz-btn pz-sm pz-danger" (click)="deletePlan(p.id)">
                        <pz-icon name="Trash2" [size]="13" />
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- ── TAB : Écritures comptables ────────────────────────────────────── -->
      @if (activeTab() === 'ecritures') {
        <div class="filters">
          <select class="pz-select" [value]="periodFilter()" (change)="periodFilter.set($any($event.target).value)">
            <option value="">Toutes les périodes</option>
            @for (p of periodOptions(); track p.id) {
              <option [value]="p.id">{{ p.label }}</option>
            }
          </select>
          <select class="pz-select" [value]="typeFilter()" (change)="typeFilter.set($any($event.target).value)">
            <option value="">Tous les types</option>
            <option value="SALARY">Salaire</option>
            <option value="CNSS">CNSS</option>
            <option value="IRPP">IRPP</option>
            <option value="ADVANCE">Avance</option>
          </select>
        </div>

        <div class="pz-card">
          <table class="pz-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Réf. journal</th>
                <th>Période</th>
                <th>Description</th>
                <th>Cpte débit</th>
                <th>Cpte crédit</th>
                <th class="num">Montant (TND)</th>
                <th>Exporté</th>
              </tr>
            </thead>
            <tbody>
              @if (loadingEntries()) {
                <tr>
                  <td colspan="8" class="empty-cell">Chargement…</td>
                </tr>
              } @else if (!filteredEntries().length) {
                <tr>
                  <td colspan="8" class="empty-cell">
                    Aucune écriture comptable. Les écritures sont générées automatiquement lors de la clôture d'une période de paie.
                  </td>
                </tr>
              }
              @for (e of filteredEntries(); track e.id) {
                <tr>
                  <td class="pz-mono" style="font-size:12px">{{ e.entryDate }}</td>
                  <td class="pz-mono" style="font-size:12px">{{ e.journalRef }}</td>
                  <td style="font-size:12px">{{ e.periodLabel ?? '—' }}</td>
                  <td style="font-size:12px">{{ e.description }}</td>
                  <td>
                    <span class="code-pill pz-mono">{{ e.debitAccount }}</span>
                  </td>
                  <td>
                    <span class="code-pill pz-mono">{{ e.creditAccount }}</span>
                  </td>
                  <td class="num pz-mono">{{ fmtTND(e.amount) }}</td>
                  <td>
                    @if (e.exportedAt) {
                      <span class="pz-pill pos"><span class="dot"></span>Exporté</span>
                    } @else {
                      <span class="pz-pill warn"><span class="dot"></span>En attente</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (filteredEntries().length) {
          <div class="summary-bar">
            <span>{{ filteredEntries().length }} écriture(s)</span>
            <span
              >Total : <strong class="pz-mono">{{ fmtTND(totalDebits()) }} TND</strong></span
            >
            <span style="flex:1"></span>
            <button class="pz-btn pz-primary pz-sm" (click)="exportSage()">
              <pz-icon name="Download" [size]="13" /> Exporter SAGE (.csv)
            </button>
          </div>
        }
      }

      <!-- ── TAB : Conformité ──────────────────────────────────────────────── -->
      @if (activeTab() === 'conformite') {
        <!-- Déclarations trimestrielles -->
        <div class="pz-card">
          <div class="card-head">
            <pz-icon name="ClipboardList" [size]="16" style="color:var(--pz-primary)" />
            <div class="card-title">Déclarations trimestrielles</div>
            <span style="font-size:12px;color:var(--pz-muted)">CNSS salarié · CNSS patronal · CAVIS</span>
          </div>
          @if (!conformiteQuarters().length) {
            <div style="padding:40px;text-align:center;color:var(--pz-muted);font-size:13px">
              Aucune période de paie. Créez des périodes dans l'onglet Paie.
            </div>
          } @else {
            <table class="pz-table">
              <thead>
                <tr>
                  <th>Exercice</th>
                  <th>Trimestre</th>
                  <th>Périodes incluses</th>
                  <th>CNSS Salarié</th>
                  <th>CNSS Patronal</th>
                  <th>CAVIS</th>
                </tr>
              </thead>
              <tbody>
                @for (q of conformiteQuarters(); track q.key) {
                  <tr>
                    <td>
                      <strong class="pz-mono">{{ q.year }}</strong>
                    </td>
                    <td>
                      <span class="q-badge">T{{ q.trimestre }}</span>
                    </td>
                    <td style="font-size:12px;color:var(--pz-muted)">{{ q.months }}</td>
                    <td>
                      <button class="pz-btn pz-sm" style="gap:5px" (click)="downloadDecl('cnss-sal', q.periodId, q)" [disabled]="dlBusy()">
                        <pz-icon name="Download" [size]="12" /> CNSS Salarié
                      </button>
                    </td>
                    <td>
                      <button class="pz-btn pz-sm" style="gap:5px" (click)="downloadDecl('cnss-pat', q.periodId, q)" [disabled]="dlBusy()">
                        <pz-icon name="Download" [size]="12" /> CNSS Patronal
                      </button>
                    </td>
                    <td>
                      <button class="pz-btn pz-sm" style="gap:5px" (click)="downloadDecl('cavis', q.periodId, q)" [disabled]="dlBusy()">
                        <pz-icon name="Download" [size]="12" /> CAVIS
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>

        <!-- Déclarations mensuelles -->
        <div class="pz-card">
          <div class="card-head">
            <pz-icon name="Receipt" [size]="16" style="color:var(--pz-primary)" />
            <div class="card-title">Déclarations mensuelles (CNSS)</div>
            <span style="font-size:12px;color:var(--pz-muted)">Récapitulatif CNSS par période de paie</span>
          </div>
          @if (!data.payrollPeriods().length) {
            <div style="padding:32px;text-align:center;color:var(--pz-muted);font-size:13px">Aucune période de paie.</div>
          } @else {
            <table class="pz-table">
              <thead>
                <tr>
                  <th>Période</th>
                  <th>Statut</th>
                  <th>Employés</th>
                  <th>Récapitulatif CNSS</th>
                </tr>
              </thead>
              <tbody>
                @for (p of data.payrollPeriods(); track p.id) {
                  <tr>
                    <td style="font-weight:500">{{ p.label }}</td>
                    <td>
                      <span
                        class="pz-pill"
                        [class.warn]="p.status === 'DRAFT'"
                        [class.pos]="p.status === 'LOCKED' || p.status === 'EXPORTED'"
                        [class.info]="p.status === 'CALCULATED' || p.status === 'VALIDATED'"
                      >
                        {{ periodStatusLabel(p.status) }}
                      </span>
                    </td>
                    <td class="pz-mono">{{ p.employees }}</td>
                    <td>
                      <button class="pz-btn pz-sm" style="gap:5px" (click)="downloadCnssRecap(p.id)" [disabled]="dlBusy()">
                        <pz-icon name="Download" [size]="12" /> Télécharger
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>

        <!-- Déclaration IRPP annuelle -->
        <div class="pz-card">
          <div class="card-head">
            <pz-icon name="FileCheck" [size]="16" style="color:var(--pz-primary)" />
            <div class="card-title">Déclaration IRPP annuelle</div>
            <span style="font-size:12px;color:var(--pz-muted)">Certificat de retenue à la source — art. 52 CIR</span>
          </div>
          <div style="padding:16px 20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:13px;color:var(--pz-ink-2)">Exercice :</span>
              <select class="pz-select" [(ngModel)]="irppYear">
                @for (y of irppYears(); track y) {
                  <option [value]="y">{{ y }}</option>
                }
              </select>
            </div>
            <button class="pz-btn pz-primary pz-sm" (click)="downloadIrppAnnuel()" [disabled]="dlBusy()">
              <pz-icon name="Download" [size]="13" /> Télécharger déclaration IRPP {{ irppYear }}
            </button>
          </div>
        </div>

        @if (dlErr()) {
          <div style="background:#fee2e2;color:#b91c1c;border-radius:8px;padding:10px 16px;font-size:13px">{{ dlErr() }}</div>
        }
      }
    </div>

    <!-- ── Modal créer / éditer compte ──────────────────────────────────────── -->
    @if (showForm()) {
      <div class="pz-modal-backdrop" (click)="closeForm()">
        <div class="pz-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <div class="pz-modal-title">{{ editId() ? 'Modifier le compte' : 'Nouveau compte' }}</div>
            <button class="pz-modal-close" (click)="closeForm()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="pz-field">
              <label>Code comptable <span class="req">*</span></label>
              <input [(ngModel)]="form.accountCode" placeholder="ex. 641000" maxlength="20" />
            </div>
            <div class="pz-field">
              <label>Libellé <span class="req">*</span></label>
              <input [(ngModel)]="form.accountLabel" placeholder="Salaires bruts…" maxlength="200" />
            </div>
            <div class="pz-field">
              <label>Type</label>
              <select [(ngModel)]="form.accountType">
                <option value="">— Sélectionner —</option>
                @for (t of accountTypes; track t) {
                  <option [value]="t">{{ typeLabel(t) }}</option>
                }
              </select>
            </div>
            <div class="pz-field-row">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
                <input type="checkbox" [(ngModel)]="form.active" />
                Compte actif
              </label>
            </div>
            @if (errMsg()) {
              <div class="pz-error">{{ errMsg() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeForm()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="busy()" (click)="submitForm()">
              {{ busy() ? '…' : editId() ? 'Enregistrer' : 'Créer' }}
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

      /* ── Tabs ── */
      .pz-tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--pz-line);
      }
      .pz-tab {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border: none;
        background: none;
        cursor: pointer;
        font: inherit;
        font-size: 13px;
        color: var(--pz-muted);
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        border-radius: 0;
        transition: color 0.15s;
      }
      .pz-tab.active {
        color: var(--pz-primary);
        border-bottom-color: var(--pz-primary);
        font-weight: 600;
      }
      .pz-tab:hover {
        color: var(--pz-ink);
      }
      .cnt {
        background: var(--pz-surface-2);
        border-radius: 10px;
        padding: 1px 7px;
        font-size: 11px;
        margin-left: 4px;
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
        background: var(--pz-surface-2);
      }
      .pz-table th.num,
      .pz-table td.num {
        text-align: right;
      }

      /* ── Modal ── */
      .pz-modal-backdrop {
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
        width: 480px;
        max-width: 95vw;
        max-height: 90vh;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
        display: flex;
        flex-direction: column;
      }
      .pz-modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 20px 14px;
        border-bottom: 1px solid var(--pz-line);
        flex-shrink: 0;
      }
      .pz-modal-title {
        font-size: 15px;
        font-weight: 600;
      }
      .pz-modal-close {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--pz-muted);
        display: flex;
      }
      .pz-modal-body {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 0;
        overflow-y: auto;
      }
      .pz-modal-foot {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 14px 20px;
        border-top: 1px solid var(--pz-line);
        flex-shrink: 0;
      }

      /* ── Form fields ── */
      .pz-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-bottom: 14px;
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
      .pz-field-row {
        display: flex;
        gap: 12px;
      }

      /* ── Misc ── */
      .pz-select {
        padding: 7px 12px;
        border: 1px solid var(--pz-line);
        border-radius: 8px;
        font: inherit;
        font-size: 13px;
        background: var(--pz-surface);
        color: var(--pz-ink);
        outline: none;
      }
      .pz-select:focus {
        border-color: var(--pz-primary);
      }
      .pz-btn.pz-danger {
        color: #b91c1c;
        border-color: #fecaca;
      }
      .pz-btn.pz-danger:hover {
        background: #fee2e2;
      }
      .code-pill {
        background: var(--pz-surface-2);
        padding: 2px 7px;
        border-radius: 4px;
        font-size: 12px;
      }
      .num {
        text-align: right;
      }
      .filters {
        display: flex;
        gap: 10px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      .empty-cell {
        text-align: center;
        padding: 40px;
        color: var(--pz-muted);
        font-size: 13px;
      }
      .summary-bar {
        display: flex;
        gap: 24px;
        padding: 10px 4px;
        font-size: 13px;
        color: var(--pz-muted);
        flex-wrap: wrap;
      }
      .req {
        color: var(--pz-danger);
      }
      .pz-error {
        color: var(--pz-danger);
        font-size: 12px;
        margin-top: 4px;
        background: var(--pz-danger-soft);
        border-radius: 6px;
        padding: 8px 12px;
      }
      .strong {
        font-weight: 500;
      }
      .card-head {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 20px 8px;
        border-bottom: 1px solid var(--pz-line);
      }
      .card-title {
        font-size: 14px;
        font-weight: 600;
      }
      .q-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        padding: 2px 8px;
        border-radius: 6px;
        background: var(--pz-primary-soft);
        color: var(--pz-primary);
        font-size: 13px;
        font-weight: 700;
      }
      .pz-pill.info {
        background: #eff6ff;
        color: #1d4ed8;
      }
    `,
  ],
})
export default class RhAccountingComponent {
  protected readonly data = inject(DataService);
  private readonly api = inject(ApiService);

  protected readonly activeTab = signal<Tab>('plan');
  protected readonly loading = signal(false);
  protected readonly loadingEntries = signal(false);
  protected readonly busy = signal(false);
  protected readonly errMsg = signal('');

  protected readonly accountPlans = signal<AccountPlan[]>([]);
  protected readonly entries = signal<AccountingEntry[]>([]);

  protected readonly periodFilter = signal('');
  protected readonly typeFilter = signal('');

  protected readonly showForm = signal(false);
  protected readonly editId = signal<number | null>(null);
  protected form = { accountCode: '', accountLabel: '', accountType: '', active: true };

  protected readonly accountTypes = ACCOUNT_TYPES;

  protected readonly filteredEntries = computed(() => {
    let list = this.entries();
    const p = this.periodFilter();
    const t = this.typeFilter();
    if (p) list = list.filter(e => String(e.periodId) === p);
    if (t) list = list.filter(e => e.entryType === t);
    return list;
  });

  protected readonly periodOptions = computed(() => {
    const seen = new Set<number>();
    const opts: { id: number; label: string }[] = [];
    for (const e of this.entries()) {
      if (e.periodId && !seen.has(e.periodId)) {
        seen.add(e.periodId);
        opts.push({ id: e.periodId, label: e.periodLabel ?? String(e.periodId) });
      }
    }
    return opts;
  });

  protected readonly totalDebits = computed(() => this.filteredEntries().reduce((s, e) => s + e.amount, 0));
  protected readonly totalCredits = computed(() => this.filteredEntries().reduce((s, e) => s + e.amount, 0));

  constructor() {
    this.loadPlans();
    this.loadEntries();
  }

  protected setTab(t: Tab): void {
    this.activeTab.set(t);
  }

  private loadPlans(): void {
    this.loading.set(true);
    this.api.accountPlans().subscribe({
      next: list => {
        this.accountPlans.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadEntries(): void {
    this.loadingEntries.set(true);
    this.api.accountingEntries().subscribe({
      next: list => {
        this.entries.set(list);
        this.loadingEntries.set(false);
      },
      error: () => this.loadingEntries.set(false),
    });
  }

  protected openCreate(): void {
    this.editId.set(null);
    this.form = { accountCode: '', accountLabel: '', accountType: '', active: true };
    this.errMsg.set('');
    this.showForm.set(true);
  }

  protected openEdit(p: AccountPlan): void {
    this.editId.set(p.id);
    this.form = { accountCode: p.accountCode, accountLabel: p.accountLabel, accountType: p.accountType ?? '', active: p.active };
    this.errMsg.set('');
    this.showForm.set(true);
  }

  protected closeForm(): void {
    this.showForm.set(false);
  }

  protected submitForm(): void {
    if (!this.form.accountCode.trim() || !this.form.accountLabel.trim()) {
      this.errMsg.set('Le code et le libellé sont obligatoires.');
      return;
    }
    this.busy.set(true);
    this.errMsg.set('');
    const companyId = this.data.companies()[0]?.id ?? 0;
    const dto = { ...this.form, accountType: this.form.accountType || null, companyId };
    const id = this.editId();
    const call = id ? this.api.updateAccountPlan(id, dto) : this.api.createAccountPlan(dto);
    call.subscribe({
      next: saved => {
        if (id) {
          this.accountPlans.update(list => list.map(p => (p.id === id ? saved : p)));
        } else {
          this.accountPlans.update(list => [saved, ...list]);
        }
        this.busy.set(false);
        this.showForm.set(false);
      },
      error: () => {
        this.errMsg.set("Erreur lors de l'enregistrement.");
        this.busy.set(false);
      },
    });
  }

  protected deletePlan(id: number): void {
    if (!confirm('Supprimer ce compte comptable ?')) return;
    this.api.deleteAccountPlan(id).subscribe({
      next: () => this.accountPlans.update(list => list.filter(p => p.id !== id)),
    });
  }

  protected initDefaultPlan(): void {
    const companyId = this.data.companies()[0]?.id ?? 0;
    this.busy.set(true);
    let done = 0;
    for (const plan of DEFAULT_PLAN) {
      this.api.createAccountPlan({ ...plan, companyId }).subscribe({
        next: saved => {
          this.accountPlans.update(list => [...list, saved]);
          done++;
          if (done === DEFAULT_PLAN.length) this.busy.set(false);
        },
        error: () => {
          done++;
          if (done === DEFAULT_PLAN.length) this.busy.set(false);
        },
      });
    }
  }

  protected exportSage(): void {
    const entries = this.filteredEntries();
    const rows = ['JO;DATE;COMPTE_DEBIT;COMPTE_CREDIT;LIBELLE;MONTANT'];
    for (const e of entries) {
      rows.push(`PAIE;${e.entryDate};${e.debitAccount};${e.creditAccount};${e.description.replace(/;/g, ' ')};${e.amount.toFixed(3)}`);
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-sage-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  protected typeLabel(t: string | null): string {
    return t ? (ACCOUNT_TYPE_LABELS[t] ?? t) : '—';
  }

  protected typePillClass(t: string | null): string {
    const map: Record<string, string> = { CHARGE: 'warn', PRODUIT: 'pos', BILAN: 'info', TRESORERIE: 'primary' };
    return `pz-pill ${t ? (map[t] ?? '') : ''}`;
  }

  protected fmtTND(v: number): string {
    return v.toLocaleString('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  }

  // ── Conformité ──────────────────────────────────────────────────────────────
  protected readonly dlBusy = signal(false);
  protected readonly dlErr = signal('');
  protected irppYear = new Date().getFullYear();

  protected readonly conformiteQuarters = computed(() => {
    const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const byQuarter = new Map<string, { year: number; trimestre: number; monthNums: number[]; periodId: number }>();
    for (const p of this.data.payrollPeriods()) {
      const t = Math.ceil(p.month / 3);
      const key = `${p.year}-T${t}`;
      if (!byQuarter.has(key)) byQuarter.set(key, { year: p.year, trimestre: t, monthNums: [], periodId: p.id });
      byQuarter.get(key)!.monthNums.push(p.month);
    }
    return [...byQuarter.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, v]) => ({
        key,
        year: v.year,
        trimestre: v.trimestre,
        months: v.monthNums
          .sort()
          .map(m => MONTH_NAMES[m - 1])
          .join(', '),
        periodId: v.periodId,
      }));
  });

  protected readonly irppYears = computed(() => {
    const years = [...new Set(this.data.payrollPeriods().map(p => p.year))].sort((a, b) => b - a);
    return years.length ? years : [new Date().getFullYear()];
  });

  protected periodStatusLabel(s: string): string {
    const m: Record<string, string> = {
      DRAFT: 'Brouillon',
      CALCULATED: 'Calculée',
      VALIDATED: 'Validée',
      LOCKED: 'Verrouillée',
      EXPORTED: 'Exportée',
    };
    return m[s] ?? s;
  }

  protected downloadDecl(type: 'cnss-sal' | 'cnss-pat' | 'cavis', periodId: number, q: { year: number; trimestre: number }): void {
    this.dlBusy.set(true);
    this.dlErr.set('');
    const call =
      type === 'cnss-sal'
        ? this.api.downloadDeclarationTrimestrielle(periodId)
        : type === 'cnss-pat'
          ? this.api.downloadCnssEmployeur(periodId)
          : this.api.downloadCavisDeclaration(periodId);
    const fname = `${type}-T${q.trimestre}-${q.year}.pdf`;
    call.subscribe({
      next: blob => {
        this.triggerDownload(blob, fname);
        this.dlBusy.set(false);
      },
      error: () => {
        this.dlErr.set(`Erreur lors du téléchargement de ${fname}. Vérifiez que des bulletins ont été générés pour cette période.`);
        this.dlBusy.set(false);
      },
    });
  }

  protected downloadCnssRecap(periodId: number): void {
    this.dlBusy.set(true);
    this.dlErr.set('');
    this.api.downloadCnssRecap(periodId).subscribe({
      next: blob => {
        this.triggerDownload(blob, `cnss-recap-period-${periodId}.pdf`);
        this.dlBusy.set(false);
      },
      error: () => {
        this.dlErr.set('Erreur lors du téléchargement du récapitulatif CNSS.');
        this.dlBusy.set(false);
      },
    });
  }

  protected downloadIrppAnnuel(): void {
    this.dlBusy.set(true);
    this.dlErr.set('');
    this.api.downloadIrppDeclaration(this.irppYear).subscribe({
      next: blob => {
        this.triggerDownload(blob, `declaration-irpp-${this.irppYear}.pdf`);
        this.dlBusy.set(false);
      },
      error: () => {
        this.dlErr.set('Erreur lors du téléchargement de la déclaration IRPP.');
        this.dlBusy.set(false);
      },
    });
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
