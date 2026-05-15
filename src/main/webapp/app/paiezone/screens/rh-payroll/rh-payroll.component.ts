import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { Bonus, Rubrique, PaySlip } from '../../core/types';

type Tab = 'periods' | 'bonuses' | 'rubriques';

const BONUS_TYPES = ['PERFORMANCE', 'TRANSPORT', 'MEAL', 'RAMADAN', 'END_OF_YEAR', 'SENIORITY', 'EXCEPTIONAL', 'OTHER'];
const BONUS_LABELS: Record<string, string> = {
  PERFORMANCE: 'Performance',
  TRANSPORT: 'Transport',
  MEAL: 'Repas',
  RAMADAN: 'Ramadan',
  END_OF_YEAR: "Fin d'année",
  SENIORITY: 'Ancienneté',
  EXCEPTIONAL: 'Exceptionnel',
  OTHER: 'Autre',
};
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

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
        </div>
        <div style="display:flex;gap:8px">
          @if (activeTab() === 'periods') {
            <button class="pz-btn pz-primary" (click)="openCreate()">
              <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Nouvelle période
            </button>
          }
          @if (activeTab() === 'bonuses') {
            <button class="pz-btn pz-primary" (click)="openCreateBonus()">
              <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Ajouter prime
            </button>
          }
          @if (activeTab() === 'rubriques') {
            <button class="pz-btn pz-primary" (click)="openCreateRubrique()">
              <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Nouvelle rubrique
            </button>
          }
        </div>
      </div>

      <!-- Tabs -->
      <div class="pz-tabs">
        <button class="pz-tab" [class.active]="activeTab() === 'periods'" (click)="setTab('periods')">
          <pz-icon name="Calendar" [size]="14" /> Périodes de paie
        </button>
        <button class="pz-tab" [class.active]="activeTab() === 'bonuses'" (click)="setTab('bonuses')">
          <pz-icon name="Gift" [size]="14" /> Primes
        </button>
        <button class="pz-tab" [class.active]="activeTab() === 'rubriques'" (click)="setTab('rubriques')">
          <pz-icon name="List" [size]="14" /> Rubriques
        </button>
      </div>

      <!-- TAB: Périodes -->
      @if (activeTab() === 'periods') {
        <div class="pz-card">
          <div class="card-head"><div class="card-title">Périodes de paie</div></div>
          <table class="pz-table">
            <thead>
              <tr>
                <th>Période</th>
                <th>Statut</th>
                <th>Validé le</th>
                <th>Verrouillé le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (data.payrollPeriods().length === 0) {
                <tr>
                  <td colspan="5" style="text-align:center;padding:40px;color:var(--pz-muted)">Aucune période de paie</td>
                </tr>
              }
              @for (p of data.payrollPeriods(); track p.id) {
                <tr>
                  <td>
                    <strong>{{ p.label }}</strong>
                  </td>
                  <td>
                    <span class="pz-pill" [class]="statusClass(p.status)">{{ statusLabel(p.status) }}</span>
                  </td>
                  <td style="color:var(--pz-muted);font-size:12px">{{ p.validatedAt ?? '—' }}</td>
                  <td style="color:var(--pz-muted);font-size:12px">{{ p.lockedAt ?? '—' }}</td>
                  <td>
                    <div style="display:flex;gap:6px;align-items:center">
                      <button class="pz-btn pz-sm" (click)="viewBulletins(p.id, p.label)">
                        <pz-icon name="FileText" [size]="13" /> Bulletins
                      </button>
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

        <!-- Barème IRPP -->
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
      }

      <!-- TAB: Primes -->
      @if (activeTab() === 'bonuses') {
        <div class="filter-bar">
          <div class="pz-field-row" style="align-items:flex-end;gap:10px">
            <div class="pz-field" style="flex:0 0 140px">
              <label>Mois</label>
              <select [(ngModel)]="bonusFilter.month" (change)="loadBonuses()">
                <option [value]="0">Tous les mois</option>
                @for (m of months; track m.v) {
                  <option [value]="m.v">{{ m.label }}</option>
                }
              </select>
            </div>
            <div class="pz-field" style="flex:0 0 100px">
              <label>Année</label>
              <input type="number" [(ngModel)]="bonusFilter.year" (change)="loadBonuses()" min="2020" max="2030" />
            </div>
            <div class="pz-field">
              <label>Employé</label>
              <select [(ngModel)]="bonusFilter.employeeId" (change)="loadBonuses()">
                <option [value]="0">Tous les employés</option>
                @for (e of data.employees(); track e.id) {
                  <option [value]="e.id">{{ data.fullName(e) }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        <div class="pz-card">
          <table class="pz-table">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Type</th>
                <th>Libellé</th>
                <th>Période</th>
                <th>Montant</th>
                <th>Imposable</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @if (bonusLoading()) {
                <tr>
                  <td colspan="7" style="text-align:center;padding:32px;color:var(--pz-muted)">Chargement…</td>
                </tr>
              } @else if (bonuses().length === 0) {
                <tr>
                  <td colspan="7" style="text-align:center;padding:32px;color:var(--pz-muted)">Aucune prime trouvée</td>
                </tr>
              } @else {
                @for (b of bonuses(); track b.id) {
                  <tr>
                    <td>{{ empName(b.employeeId) }}</td>
                    <td>
                      <span class="pz-tag">{{ bonusLabel(b.bonusType) }}</span>
                    </td>
                    <td>{{ b.label }}</td>
                    <td style="font-size:12px;color:var(--pz-muted)">{{ monthLabel(b.month) }} {{ b.year }}</td>
                    <td class="pz-mono">
                      <strong>{{ data.fmtTND(b.amount) }}</strong>
                    </td>
                    <td>
                      @if (b.taxable) {
                        <span class="pz-pill pos">Oui</span>
                      } @else {
                        <span class="pz-pill neg">Non</span>
                      }
                    </td>
                    <td>
                      <button class="pz-btn pz-sm pz-danger" (click)="deleteBonus(b.id)">
                        <pz-icon name="Trash2" [size]="13" />
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }

      <!-- TAB: Rubriques -->
      @if (activeTab() === 'rubriques') {
        <div class="pz-card">
          <table class="pz-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Libellé</th>
                <th>Type</th>
                <th>Base de calcul</th>
                <th>Valeur</th>
                <th>CNSS sal.</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @if (rubriqueLoading()) {
                <tr>
                  <td colspan="8" style="text-align:center;padding:32px;color:var(--pz-muted)">Chargement…</td>
                </tr>
              } @else if (rubriques().length === 0) {
                <tr>
                  <td colspan="8" style="text-align:center;padding:32px;color:var(--pz-muted)">Aucune rubrique définie</td>
                </tr>
              } @else {
                @for (r of rubriques(); track r.id) {
                  <tr>
                    <td>
                      <span class="pz-tag">{{ r.code }}</span>
                    </td>
                    <td>
                      <strong>{{ r.label }}</strong>
                    </td>
                    <td>
                      <span class="pz-pill" [class]="rubriqueTypeClass(r.rubriqueType)">{{ rubriqueTypeLabel(r.rubriqueType) }}</span>
                    </td>
                    <td style="font-size:12px;color:var(--pz-muted)">{{ baseLabel(r.base) }}</td>
                    <td class="pz-mono" style="font-size:12px">
                      @if (r.fixedAmount != null) {
                        {{ data.fmtTND(r.fixedAmount) }}
                      } @else if (r.rate != null) {
                        {{ r.rate }}%
                      } @else {
                        —
                      }
                    </td>
                    <td>
                      @if (r.cnssSalary) {
                        <pz-icon name="Check" [size]="14" style="color:var(--pz-success)" />
                      } @else {
                        <pz-icon name="X" [size]="14" style="color:var(--pz-muted)" />
                      }
                    </td>
                    <td>
                      <span class="pz-pill" [class]="r.active ? 'pos' : 'neg'">{{ r.active ? 'Active' : 'Inactive' }}</span>
                    </td>
                    <td>
                      <button class="pz-btn pz-sm pz-danger" (click)="deleteRubrique(r.id)">
                        <pz-icon name="Trash2" [size]="13" />
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Modal Bulletins -->
    @if (showBulletins()) {
      <div class="pz-overlay" (click)="closeBulletins()">
        <div class="pz-modal pz-modal-lg" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Bulletins — {{ bulletinPeriodLabel() }}</span>
            <button class="pz-modal-close" (click)="closeBulletins()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body" style="padding:0">
            <table class="pz-table">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Brut</th>
                  <th>CNSS sal.</th>
                  <th>IRPP</th>
                  <th>Net</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @if (bulletinsLoading()) {
                  <tr>
                    <td colspan="7" style="text-align:center;padding:32px;color:var(--pz-muted)">Chargement…</td>
                  </tr>
                } @else if (bulletins().length === 0) {
                  <tr>
                    <td colspan="7" style="text-align:center;padding:32px;color:var(--pz-muted)">
                      Aucun bulletin. Calculez d'abord la période.
                    </td>
                  </tr>
                } @else {
                  @for (b of bulletins(); track b.id) {
                    <tr>
                      <td>{{ empName(b.employeeId) }}</td>
                      <td class="pz-mono">{{ data.fmtTND(b.grossSalary) }}</td>
                      <td class="pz-mono" style="font-size:12px">{{ data.fmtTND(b.cnssSalaryAmount) }}</td>
                      <td class="pz-mono" style="font-size:12px">{{ data.fmtTND(b.irppAmount) }}</td>
                      <td class="pz-mono">
                        <strong>{{ data.fmtTND(b.netSalary) }}</strong>
                      </td>
                      <td>
                        <span class="pz-pill" [class]="statusClass(b.status)">{{ statusLabel(b.status) }}</span>
                      </td>
                      <td>
                        <a class="pz-btn pz-sm" [href]="'/api/pay-slips/' + b.id + '/pdf'" target="_blank">
                          <pz-icon name="Download" [size]="13" /> PDF
                        </a>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
          <div class="pz-modal-foot">
            @if (bulletins().length > 0) {
              <a class="pz-btn pz-primary" [href]="'/api/pay-slips/bulk-pdf/' + currentPeriodId()" target="_blank">
                <pz-icon name="Download" [size]="14" /> Télécharger tous (PDF)
              </a>
            }
            <button class="pz-btn" (click)="closeBulletins()">Fermer</button>
          </div>
        </div>
      </div>
    }

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

    <!-- Modal Ajouter prime -->
    @if (showCreateBonus()) {
      <div class="pz-overlay" (click)="closeCreateBonus()">
        <div class="pz-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Ajouter une prime</span>
            <button class="pz-modal-close" (click)="closeCreateBonus()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="pz-field">
              <label>Employé *</label>
              <select [(ngModel)]="bonusForm.employeeId">
                <option [value]="0">— Sélectionner —</option>
                @for (e of data.employees(); track e.id) {
                  <option [value]="e.id">{{ data.fullName(e) }}</option>
                }
              </select>
            </div>
            <div class="pz-field-row">
              <div class="pz-field">
                <label>Type</label>
                <select [(ngModel)]="bonusForm.bonusType">
                  @for (t of bonusTypes; track t) {
                    <option [value]="t">{{ bonusLabel(t) }}</option>
                  }
                </select>
              </div>
              <div class="pz-field">
                <label>Libellé *</label>
                <input type="text" [(ngModel)]="bonusForm.label" maxlength="150" />
              </div>
            </div>
            <div class="pz-field-row">
              <div class="pz-field">
                <label>Montant (TND) *</label>
                <input type="number" [(ngModel)]="bonusForm.amount" min="0" step="10" />
              </div>
              <div class="pz-field" style="flex:0 0 100px">
                <label>Mois *</label>
                <select [(ngModel)]="bonusForm.month">
                  @for (m of months; track m.v) {
                    <option [value]="m.v">{{ m.label }}</option>
                  }
                </select>
              </div>
              <div class="pz-field" style="flex:0 0 90px">
                <label>Année</label>
                <input type="number" [(ngModel)]="bonusForm.year" min="2020" max="2030" />
              </div>
            </div>
            <div class="pz-field" style="flex-direction:row;align-items:center;gap:10px">
              <input type="checkbox" [(ngModel)]="bonusForm.taxable" id="chk-taxable" style="width:auto" />
              <label for="chk-taxable" style="font-size:13px;color:var(--pz-ink)">Soumise à l'IRPP (imposable)</label>
            </div>
            @if (bonusErrMsg()) {
              <div class="pz-err">{{ bonusErrMsg() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeCreateBonus()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="busy()" (click)="submitCreateBonus()">
              @if (busy()) {
                Enregistrement…
              } @else {
                Ajouter
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Nouvelle rubrique -->
    @if (showCreateRubrique()) {
      <div class="pz-overlay" (click)="closeCreateRubrique()">
        <div class="pz-modal pz-modal-lg" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Nouvelle rubrique de paie</span>
            <button class="pz-modal-close" (click)="closeCreateRubrique()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="pz-field-row">
              <div class="pz-field" style="flex:0 0 120px">
                <label>Code *</label>
                <input type="text" [(ngModel)]="rubForm.code" maxlength="20" style="text-transform:uppercase" />
              </div>
              <div class="pz-field">
                <label>Libellé *</label>
                <input type="text" [(ngModel)]="rubForm.label" maxlength="150" />
              </div>
            </div>
            <div class="pz-field-row">
              <div class="pz-field">
                <label>Type</label>
                <select [(ngModel)]="rubForm.rubriqueType">
                  <option value="GAIN">Gain</option>
                  <option value="DEDUCTION">Déduction</option>
                  <option value="EMPLOYER_CHARGE">Charge patronale</option>
                  <option value="INFO">Information</option>
                </select>
              </div>
              <div class="pz-field">
                <label>Base de calcul</label>
                <select [(ngModel)]="rubForm.base">
                  <option value="FIXED">Montant fixe</option>
                  <option value="PERCENT_BRUT">% du Brut</option>
                  <option value="PERCENT_NET">% du Net</option>
                  <option value="HOURS">Horaire</option>
                  <option value="FORMULA">Formule</option>
                </select>
              </div>
            </div>
            <div class="pz-field-row">
              @if (rubForm.base === 'FIXED' || rubForm.base === 'HOURS') {
                <div class="pz-field">
                  <label>Montant fixe (TND)</label>
                  <input type="number" [(ngModel)]="rubForm.fixedAmount" min="0" step="10" />
                </div>
              }
              @if (rubForm.base === 'PERCENT_BRUT' || rubForm.base === 'PERCENT_NET') {
                <div class="pz-field">
                  <label>Taux (%)</label>
                  <input type="number" [(ngModel)]="rubForm.rate" min="0" max="100" step="0.01" />
                </div>
              }
              <div class="pz-field" style="flex:0 0 100px">
                <label>Ordre tri</label>
                <input type="number" [(ngModel)]="rubForm.sortOrder" min="0" />
              </div>
            </div>
            <div style="display:flex;gap:16px;flex-wrap:wrap">
              <label style="display:flex;align-items:center;gap:6px;font-size:13px">
                <input type="checkbox" [(ngModel)]="rubForm.taxable" style="width:auto" /> Imposable (IRPP)
              </label>
              <label style="display:flex;align-items:center;gap:6px;font-size:13px">
                <input type="checkbox" [(ngModel)]="rubForm.cnssSalary" style="width:auto" /> Base CNSS salariale
              </label>
            </div>
            @if (rubErrMsg()) {
              <div class="pz-err">{{ rubErrMsg() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeCreateRubrique()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="busy()" (click)="submitCreateRubrique()">
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
      .pz-tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--pz-line);
        padding-bottom: 0;
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
      .filter-bar {
        margin-bottom: 12px;
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
      .pz-tag {
        display: inline-block;
        font-size: 11px;
        font-weight: 700;
        background: var(--pz-primary-soft);
        color: var(--pz-primary);
        padding: 2px 8px;
        border-radius: 6px;
        letter-spacing: 0.04em;
      }
      .pz-btn.pz-danger {
        color: #b91c1c;
        border-color: #fecaca;
      }
      .pz-btn.pz-danger:hover {
        background: #fee2e2;
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
        width: 480px;
        max-width: 95vw;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
        display: flex;
        flex-direction: column;
        max-height: 90vh;
        overflow: auto;
      }
      .pz-modal-sm {
        width: 340px;
      }
      .pz-modal-lg {
        width: 640px;
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
        color: #b91c1c;
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
  protected readonly activeTab = signal<Tab>('periods');

  // Bulletins
  protected readonly showBulletins = signal(false);
  protected readonly bulletinsLoading = signal(false);
  protected readonly bulletins = signal<PaySlip[]>([]);
  protected readonly currentPeriodId = signal(0);
  protected readonly bulletinPeriodLabel = signal('');

  // Période creation
  protected readonly showCreate = signal(false);
  protected form = { month: new Date().getMonth() + 1, year: new Date().getFullYear() };

  // Bonus
  protected readonly showCreateBonus = signal(false);
  protected readonly bonuses = signal<Bonus[]>([]);
  protected readonly bonusLoading = signal(false);
  protected readonly bonusErrMsg = signal('');
  protected bonusFilter = { month: 0, year: new Date().getFullYear(), employeeId: 0 };
  protected bonusForm = {
    employeeId: 0,
    bonusType: 'OTHER',
    label: '',
    amount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    taxable: false,
  };
  protected readonly bonusTypes = BONUS_TYPES;

  // Rubriques
  protected readonly showCreateRubrique = signal(false);
  protected readonly rubriques = signal<Rubrique[]>([]);
  protected readonly rubriqueLoading = signal(false);
  protected readonly rubErrMsg = signal('');
  protected rubForm = {
    code: '',
    label: '',
    rubriqueType: 'GAIN' as Rubrique['rubriqueType'],
    base: 'FIXED' as Rubrique['base'],
    fixedAmount: null as number | null,
    rate: null as number | null,
    taxable: false,
    cnssSalary: false,
    sortOrder: 10,
  };

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

  setTab(tab: Tab) {
    this.activeTab.set(tab);
    if (tab === 'bonuses' && this.bonuses().length === 0) this.loadBonuses();
    if (tab === 'rubriques' && this.rubriques().length === 0) this.loadRubriques();
  }

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

  bonusLabel(type: string): string {
    return BONUS_LABELS[type] ?? type;
  }
  monthLabel(m: number): string {
    return MONTHS_FR[m - 1] ?? '';
  }
  empName(id: number): string {
    const e = this.data.employees().find(e => e.id === id);
    return e ? this.data.fullName(e) : `#${id}`;
  }

  rubriqueTypeLabel(t: string): string {
    const m: Record<string, string> = { GAIN: 'Gain', DEDUCTION: 'Déduction', EMPLOYER_CHARGE: 'Charge patronale', INFO: 'Info' };
    return m[t] ?? t;
  }
  rubriqueTypeClass(t: string): string {
    if (t === 'GAIN') return 'pos';
    if (t === 'DEDUCTION') return 'neg';
    if (t === 'EMPLOYER_CHARGE') return 'warn';
    return 'info';
  }
  baseLabel(b: string): string {
    const m: Record<string, string> = {
      FIXED: 'Montant fixe',
      PERCENT_BRUT: '% Brut',
      PERCENT_NET: '% Net',
      HOURS: 'Horaire',
      FORMULA: 'Formule',
    };
    return m[b] ?? b;
  }

  // Bulletins
  viewBulletins(periodId: number, label: string) {
    this.currentPeriodId.set(periodId);
    this.bulletinPeriodLabel.set(label);
    this.showBulletins.set(true);
    this.bulletinsLoading.set(true);
    this.bulletins.set([]);
    this.api.paySlips(periodId).subscribe({
      next: list => {
        this.bulletins.set(list);
        this.bulletinsLoading.set(false);
      },
      error: () => this.bulletinsLoading.set(false),
    });
  }
  closeBulletins() {
    this.showBulletins.set(false);
  }

  // Période creation
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
    this.api.calculatePayroll(id).subscribe({ next: () => this.reloadPeriods(), error: () => this.busy.set(false) });
  }
  validate(id: number) {
    this.busy.set(true);
    this.api.validatePayroll(id).subscribe({ next: () => this.reloadPeriods(), error: () => this.busy.set(false) });
  }
  lock(id: number) {
    this.busy.set(true);
    this.api.lockPayroll(id).subscribe({ next: () => this.reloadPeriods(), error: () => this.busy.set(false) });
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

  // Bonus
  loadBonuses() {
    this.bonusLoading.set(true);
    const f = this.bonusFilter;
    this.api
      .bonuses({
        employeeId: f.employeeId || undefined,
        month: f.month || undefined,
        year: f.year || undefined,
      })
      .subscribe({
        next: list => {
          this.bonuses.set(list);
          this.bonusLoading.set(false);
        },
        error: () => this.bonusLoading.set(false),
      });
  }

  openCreateBonus() {
    this.bonusForm = {
      employeeId: 0,
      bonusType: 'OTHER',
      label: '',
      amount: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      taxable: false,
    };
    this.bonusErrMsg.set('');
    this.showCreateBonus.set(true);
  }
  closeCreateBonus() {
    this.showCreateBonus.set(false);
  }
  submitCreateBonus() {
    if (!this.bonusForm.employeeId) {
      this.bonusErrMsg.set('Sélectionnez un employé.');
      return;
    }
    if (!this.bonusForm.label.trim()) {
      this.bonusErrMsg.set('Le libellé est obligatoire.');
      return;
    }
    if (!this.bonusForm.amount || this.bonusForm.amount <= 0) {
      this.bonusErrMsg.set('Le montant doit être supérieur à 0.');
      return;
    }
    this.busy.set(true);
    this.bonusErrMsg.set('');
    this.api
      .createBonus({
        bonusType: this.bonusForm.bonusType,
        label: this.bonusForm.label.trim(),
        amount: this.bonusForm.amount,
        taxable: this.bonusForm.taxable,
        month: this.bonusForm.month,
        year: this.bonusForm.year,
        notes: '',
        employeeId: this.bonusForm.employeeId,
      })
      .subscribe({
        next: b => {
          this.bonuses.update(list => [b, ...list]);
          this.busy.set(false);
          this.closeCreateBonus();
        },
        error: (err: any) => {
          this.bonusErrMsg.set(err?.error?.detail ?? 'Erreur lors de la création.');
          this.busy.set(false);
        },
      });
  }

  deleteBonus(id: number) {
    if (!confirm('Supprimer cette prime ?')) return;
    this.api.deleteBonus(id).subscribe({ next: () => this.bonuses.update(list => list.filter(b => b.id !== id)) });
  }

  // Rubriques
  loadRubriques() {
    this.rubriqueLoading.set(true);
    this.api.rubriques().subscribe({
      next: list => {
        this.rubriques.set(list);
        this.rubriqueLoading.set(false);
      },
      error: () => this.rubriqueLoading.set(false),
    });
  }

  openCreateRubrique() {
    this.rubForm = {
      code: '',
      label: '',
      rubriqueType: 'GAIN',
      base: 'FIXED',
      fixedAmount: null,
      rate: null,
      taxable: false,
      cnssSalary: false,
      sortOrder: 10,
    };
    this.rubErrMsg.set('');
    this.showCreateRubrique.set(true);
  }
  closeCreateRubrique() {
    this.showCreateRubrique.set(false);
  }
  submitCreateRubrique() {
    const code = this.rubForm.code.trim().toUpperCase();
    if (!code || !this.rubForm.label.trim()) {
      this.rubErrMsg.set('Le code et le libellé sont obligatoires.');
      return;
    }
    this.busy.set(true);
    this.rubErrMsg.set('');
    this.api
      .createRubrique({
        code,
        label: this.rubForm.label.trim(),
        rubriqueType: this.rubForm.rubriqueType,
        base: this.rubForm.base,
        fixedAmount: this.rubForm.fixedAmount,
        rate: this.rubForm.rate,
        taxable: this.rubForm.taxable,
        cnssSalary: this.rubForm.cnssSalary,
        sortOrder: this.rubForm.sortOrder,
        active: true,
      })
      .subscribe({
        next: r => {
          this.rubriques.update(list => [...list, r]);
          this.busy.set(false);
          this.closeCreateRubrique();
        },
        error: (err: any) => {
          this.rubErrMsg.set(err?.error?.detail ?? 'Erreur lors de la création.');
          this.busy.set(false);
        },
      });
  }

  deleteRubrique(id: number) {
    if (!confirm('Désactiver cette rubrique ?')) return;
    this.api.deleteRubrique(id).subscribe({ next: () => this.rubriques.update(list => list.filter(r => r.id !== id)) });
  }
}
