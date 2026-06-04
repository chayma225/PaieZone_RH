import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { RegulatoryParam } from '../../core/types';

interface ParamForm {
  paramKey: string;
  paramLabel: string;
  category: string;
  numericValue: string;
  stringValue: string;
  effectiveFrom: string;
  effectiveTo: string;
  legalReference: string;
  description: string;
  active: boolean;
}
const EMPTY_FORM: ParamForm = {
  paramKey: '',
  paramLabel: '',
  category: '',
  numericValue: '',
  stringValue: '',
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: '',
  legalReference: '',
  description: '',
  active: true,
};

interface IrppForm {
  from: string;
  to: string;
  rate: string;
  effectiveFrom: string;
  legalReference: string;
  paramKey: string;
}
const EMPTY_IRPP: IrppForm = {
  from: '',
  to: '',
  rate: '',
  effectiveFrom: new Date().toISOString().slice(0, 10),
  legalReference: '',
  paramKey: '',
};

// Default LF-2026 brackets to seed the DB
const DEFAULT_IRPP_SEED = [
  { from: 0, to: 5000, rate: 0, label: 'Tranche exonérée (0 – 5 000 TND)' },
  { from: 5000, to: 10000, rate: 15, label: 'Tranche 15% (5 000 – 10 000 TND)' },
  { from: 10000, to: 20000, rate: 25, label: 'Tranche 25% (10 000 – 20 000 TND)' },
  { from: 20000, to: 30000, rate: 30, label: 'Tranche 30% (20 000 – 30 000 TND)' },
  { from: 30000, to: 40000, rate: 33, label: 'Tranche 33% (30 000 – 40 000 TND)' },
  { from: 40000, to: 50000, rate: 36, label: 'Tranche 36% (40 000 – 50 000 TND)' },
  { from: 50000, to: 70000, rate: 38, label: 'Tranche 38% (50 000 – 70 000 TND)' },
  { from: 70000, to: null, rate: 40, label: 'Tranche 40% (> 70 000 TND)' },
];

@Component({
  selector: 'pz-regulatory',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>SaaS</strong> <span class="sep">/</span> Réglementaire</div>
          <h1>Paramètres réglementaires</h1>
          <div class="pz-muted">{{ activeParams().length }} paramètre(s) actif(s) · {{ irppParamsInDb().length }} tranche(s) IRPP</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="pz-btn" (click)="openArchiveModal()">
            <pz-icon name="Archive" [size]="14" [strokeWidth]="1.6" /> Préparer exercice {{ nextYear() }}
          </button>
          <button class="pz-btn pz-primary" (click)="openCreate()">
            <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Nouveau paramètre
          </button>
        </div>
      </div>

      <!-- ── Snapshots d'exercices ───────────────────────────────────────── -->
      @if (snapshotYears().length > 0) {
        <div class="pz-card">
          <div class="card-head">
            <pz-icon name="CalendarRange" [size]="16" [strokeWidth]="1.5" style="color:var(--pz-primary)" />
            <div class="card-title">Snapshots d'exercices</div>
            <span style="font-size:12px;color:var(--pz-muted)">Restaurez tous les paramètres d'une année passée en un clic</span>
          </div>
          <table class="pz-table">
            <thead>
              <tr>
                <th>Exercice</th>
                <th>Paramètres</th>
                <th>Aperçu des taux</th>
                <th style="width:120px"></th>
              </tr>
            </thead>
            <tbody>
              @for (snap of snapshotYears(); track snap.year) {
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px">
                      <span class="year-badge" [class.current]="snap.year === currentYear()">{{ snap.year }}</span>
                      @if (snap.year === currentYear()) {
                        <span class="pz-pill pos" style="font-size:10px">En cours</span>
                      }
                    </div>
                  </td>
                  <td style="font-size:13px">{{ snap.params.length }} paramètre(s)</td>
                  <td style="font-size:12px;color:var(--pz-muted)">
                    <div class="snap-preview">
                      @for (p of snap.params.slice(0, 3); track p.id) {
                        <span class="snap-tag">
                          {{ p.paramKey }}&nbsp;=&nbsp;<strong>{{
                            p.numericValue !== null ? p.numericValue + ' %' : p.stringValue || '—'
                          }}</strong>
                        </span>
                      }
                      @if (snap.params.length > 3) {
                        <span class="snap-more">+{{ snap.params.length - 3 }} autres</span>
                      }
                    </div>
                  </td>
                  <td>
                    @if (snap.year !== currentYear()) {
                      <button class="pz-btn pz-sm pz-primary" (click)="openApplySnapshot(snap)">
                        <pz-icon name="RotateCcw" [size]="12" /> Appliquer
                      </button>
                    } @else {
                      <span style="font-size:12px;color:var(--pz-muted)">Exercice actif</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- ── Paramètres par catégorie (hors IRPP) ──────────────────────── -->
      @if (activeParams().length === 0 && snapshotYears().length === 0) {
        <div class="pz-card empty-state">
          <pz-icon name="Shield" [size]="36" [strokeWidth]="1.2" />
          <div class="empty-title">Aucun paramètre réglementaire</div>
          <div class="empty-sub">Créez votre premier paramètre (CNSS, CAVIS, CSS…)</div>
          <button class="pz-btn pz-primary" style="margin-top:14px" (click)="openCreate()">
            <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Créer un paramètre
          </button>
        </div>
      }

      @for (cat of categories(); track cat) {
        <div class="pz-card">
          <div class="card-head">
            <div class="card-title">{{ cat || 'Général' }}</div>
            <span class="cat-cnt">{{ activeParamsByCategory(cat).length }}</span>
            <button class="pz-btn pz-sm pz-ghost" style="margin-left:auto" (click)="openCreateForCat(cat)">
              <pz-icon name="Plus" [size]="13" /> Ajouter
            </button>
          </div>
          <table class="pz-table">
            <thead>
              <tr>
                <th>Clé</th>
                <th>Libellé</th>
                <th>Valeur</th>
                <th>Référence légale</th>
                <th>En vigueur depuis</th>
                <th>Statut</th>
                <th style="width:110px"></th>
              </tr>
            </thead>
            <tbody>
              @for (p of activeParamsByCategory(cat); track p.id) {
                <tr>
                  <td class="pz-mono" style="font-size:11.5px;color:var(--pz-muted)">{{ p.paramKey }}</td>
                  <td style="font-weight:500;font-size:13px">{{ p.paramLabel }}</td>
                  <td>
                    @if (p.numericValue !== null) {
                      <strong class="pz-mono" style="color:var(--pz-primary);font-size:14px">{{ p.numericValue }} %</strong>
                    } @else if (p.stringValue) {
                      <span class="pz-mono" style="font-size:12.5px">{{ p.stringValue }}</span>
                    } @else {
                      <span class="pz-muted">—</span>
                    }
                  </td>
                  <td style="font-size:12px;color:var(--pz-muted)">{{ p.legalReference ?? '—' }}</td>
                  <td class="pz-mono" style="font-size:12px;color:var(--pz-muted)">{{ p.effectiveFrom }}</td>
                  <td>
                    <span class="pz-pill" [class.pos]="p.active" [class.warn]="!p.active">
                      {{ p.active ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>
                  <td>
                    <div style="display:flex;gap:5px">
                      <button class="pz-btn pz-sm" (click)="openHistory(p)" title="Historique">
                        <pz-icon name="History" [size]="13" />
                      </button>
                      <button class="pz-btn pz-sm" (click)="openEdit(p)" title="Modifier">
                        <pz-icon name="Edit" [size]="13" />
                      </button>
                      <button class="pz-btn pz-sm" style="color:var(--pz-danger-ink)" (click)="confirmDelete(p)" title="Supprimer">
                        <pz-icon name="Trash" [size]="13" />
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- ── Barème IRPP (dynamique) ────────────────────────────────────── -->
      <div class="pz-card irpp-card">
        <div class="card-head">
          <div class="card-title">Barème IRPP</div>
          @if (irppParamsInDb().length === 0) {
            <span class="pz-pill warn">Valeurs LF 2026 — par défaut</span>
            <button class="pz-btn pz-sm" style="margin-left:auto" (click)="initDefaultIrpp()">
              <pz-icon name="Download" [size]="13" /> Initialiser dans la base
            </button>
          } @else {
            <span class="pz-pill pos" style="font-size:10.5px">{{ irppParamsInDb().length }} tranches en base</span>
            <button class="pz-btn pz-sm pz-primary" style="margin-left:auto" (click)="openCreateIrpp()">
              <pz-icon name="Plus" [size]="13" /> Ajouter une tranche
            </button>
          }
        </div>
        <table class="pz-table">
          <thead>
            <tr>
              <th>Tranche annuelle (TND)</th>
              <th>Taux marginal</th>
              <th>Référence légale</th>
              <th>En vigueur depuis</th>
              @if (irppParamsInDb().length > 0) {
                <th style="width:90px"></th>
              }
            </tr>
          </thead>
          <tbody>
            @for (b of data.irppBrackets(); track b.from) {
              @let dbEntry = irppByFrom(b.from);
              <tr>
                <td class="pz-mono" style="font-size:12.5px">
                  {{ b.from.toLocaleString('fr-FR') }} → {{ b.to ? b.to.toLocaleString('fr-FR') : '∞' }}
                </td>
                <td>
                  <span class="rate-chip" [class.zero]="b.rate === 0" [class.high]="b.rate >= 38">{{ b.rate }} %</span>
                </td>
                <td style="font-size:12px;color:var(--pz-muted)">
                  {{ dbEntry?.legalReference ?? '—' }}
                </td>
                <td class="pz-mono" style="font-size:12px;color:var(--pz-muted)">
                  {{ dbEntry?.effectiveFrom ?? 'Défaut LF 2026' }}
                </td>
                @if (irppParamsInDb().length > 0 && dbEntry) {
                  <td>
                    <div style="display:flex;gap:5px">
                      <button class="pz-btn pz-sm" (click)="openEditIrpp(dbEntry)" title="Modifier">
                        <pz-icon name="Edit" [size]="13" />
                      </button>
                      <button
                        class="pz-btn pz-sm"
                        style="color:var(--pz-danger-ink)"
                        (click)="confirmDeleteIrpp(dbEntry)"
                        title="Supprimer"
                      >
                        <pz-icon name="Trash" [size]="13" />
                      </button>
                    </div>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Modal IRPP : Ajouter / Modifier tranche ───────────────────────── -->
    @if (irppModalOpen()) {
      <div class="modal-backdrop" (click)="closeIrppModal()">
        <div class="modal-panel" style="max-width:480px" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <div class="modal-title">{{ irppEditId() ? 'Modifier la tranche IRPP' : 'Nouvelle tranche IRPP' }}</div>
            <button class="pz-icon-btn" (click)="closeIrppModal()"><pz-icon name="X" [size]="18" /></button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Clé (ex: IRPP_T01)</label>
              <input class="pz-input pz-mono" [(ngModel)]="irppForm.paramKey" placeholder="IRPP_T01" [disabled]="!!irppEditId()" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>De (TND) <span class="req">*</span></label>
                <input class="pz-input pz-mono" type="number" [(ngModel)]="irppForm.from" min="0" step="1000" placeholder="ex: 5000" />
              </div>
              <div class="form-group">
                <label>À (TND) — vide si illimité</label>
                <input class="pz-input pz-mono" type="number" [(ngModel)]="irppForm.to" min="0" step="1000" placeholder="∞" />
              </div>
            </div>
            <div class="form-group">
              <label>Taux marginal (%) <span class="req">*</span></label>
              <input class="pz-input pz-mono" type="number" [(ngModel)]="irppForm.rate" min="0" max="100" step="0.5" placeholder="ex: 25" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>En vigueur depuis <span class="req">*</span></label>
                <input class="pz-input" type="date" [(ngModel)]="irppForm.effectiveFrom" />
              </div>
              <div class="form-group">
                <label>Référence légale</label>
                <input class="pz-input" [(ngModel)]="irppForm.legalReference" placeholder="ex: LF 2026 Art. 12" />
              </div>
            </div>
            @if (irppErr()) {
              <div class="form-error">{{ irppErr() }}</div>
            }
          </div>
          <div class="modal-foot">
            <button class="pz-btn" (click)="closeIrppModal()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="saving()" (click)="saveIrpp()">
              @if (saving()) {
                <span class="spinner"></span> Enregistrement…
              } @else {
                <pz-icon name="Check" [size]="14" /> {{ irppEditId() ? 'Enregistrer' : 'Créer' }}
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ── Modal : Préparer exercice ─────────────────────────────────────── -->
    @if (archiveModalOpen()) {
      <div class="modal-backdrop" (click)="archiveModalOpen.set(false)">
        <div class="modal-panel" style="max-width:480px" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <div>
              <div class="modal-title">Préparer l'exercice {{ archiveYearValue }}</div>
              <div style="font-size:12px;color:var(--pz-muted);margin-top:2px">
                Copies des paramètres actifs + tranches IRPP en brouillon
              </div>
            </div>
            <button class="pz-icon-btn" (click)="archiveModalOpen.set(false)"><pz-icon name="X" [size]="18" /></button>
          </div>
          <div class="modal-body">
            <div class="apply-banner">
              <pz-icon name="Info" [size]="15" />
              <span
                >{{ allActiveForArchive().length }} paramètre(s) (dont tranches IRPP) seront copiés en <em>brouillon</em>. Ajustez les
                valeurs avant d'activer.</span
              >
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Exercice à préparer</label>
                <input class="pz-input" type="number" [(ngModel)]="archiveYearValue" min="2020" max="2040" step="1" />
              </div>
              <div class="form-group">
                <label>Date d'entrée en vigueur</label>
                <input class="pz-input" type="date" [(ngModel)]="archiveEffectiveFrom" />
              </div>
            </div>
            @if (snapshotErr()) {
              <div class="form-error">{{ snapshotErr() }}</div>
            }
          </div>
          <div class="modal-foot">
            <button class="pz-btn" (click)="archiveModalOpen.set(false)">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="snapshotBusy()" (click)="prepareExercice()">
              @if (snapshotBusy()) {
                <span class="spinner"></span> Création…
              } @else {
                <pz-icon name="Archive" [size]="14" /> Créer les brouillons
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ── Modal : Appliquer snapshot ───────────────────────────────────── -->
    @if (applyTarget()) {
      <div class="modal-backdrop" (click)="applyTarget.set(null)">
        <div class="modal-panel" style="max-width:640px" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <div>
              <div class="modal-title">Appliquer les paramètres de {{ applyTarget()!.year }}</div>
              <div style="font-size:12px;color:var(--pz-muted);margin-top:2px">
                {{ applyTarget()!.params.length }} paramètre(s) recréés en vigueur à partir d'aujourd'hui
              </div>
            </div>
            <button class="pz-icon-btn" (click)="applyTarget.set(null)"><pz-icon name="X" [size]="18" /></button>
          </div>
          <div class="modal-body" style="padding:0">
            <div style="padding:14px 20px 8px">
              <div class="apply-banner">
                <pz-icon name="Info" [size]="15" />
                <span
                  >De nouveaux paramètres actifs seront créés avec les valeurs de {{ applyTarget()!.year }}. Les entrées existantes restent
                  dans l'historique.</span
                >
              </div>
            </div>
            <table class="pz-table">
              <thead>
                <tr>
                  <th>Clé</th>
                  <th>Libellé</th>
                  <th>Valeur {{ applyTarget()!.year }}</th>
                  <th>Catégorie</th>
                </tr>
              </thead>
              <tbody>
                @for (p of applyTarget()!.params; track p.id) {
                  <tr>
                    <td class="pz-mono" style="font-size:11.5px;color:var(--pz-muted)">{{ p.paramKey }}</td>
                    <td style="font-size:13px">{{ p.paramLabel }}</td>
                    <td>
                      @if (p.numericValue !== null) {
                        <strong class="pz-mono" style="color:var(--pz-primary)">{{ p.numericValue }} %</strong>
                      } @else {
                        <span class="pz-mono">{{ p.stringValue || '—' }}</span>
                      }
                    </td>
                    <td style="font-size:12px;color:var(--pz-muted)">{{ p.category ?? 'Général' }}</td>
                  </tr>
                }
              </tbody>
            </table>
            @if (snapshotErr()) {
              <div style="padding:12px 20px">
                <div class="form-error">{{ snapshotErr() }}</div>
              </div>
            }
          </div>
          <div class="modal-foot">
            <button class="pz-btn" (click)="applyTarget.set(null)">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="snapshotBusy()" (click)="confirmApplySnapshot()">
              @if (snapshotBusy()) {
                <span class="spinner"></span> Application…
              } @else {
                <pz-icon name="RotateCcw" [size]="14" /> Appliquer {{ applyTarget()!.year }}
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ── Modal Historique par paramètre ───────────────────────────────── -->
    @if (historyKey()) {
      <div class="modal-backdrop" (click)="closeHistory()">
        <div class="modal-panel" style="max-width:680px" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <div>
              <div class="modal-title">
                Historique — <span class="pz-mono" style="font-size:13px">{{ historyKey() }}</span>
              </div>
              <div style="font-size:12px;color:var(--pz-muted);margin-top:2px">{{ historyLabel() }}</div>
            </div>
            <button class="pz-icon-btn" (click)="closeHistory()"><pz-icon name="X" [size]="18" /></button>
          </div>
          <div class="modal-body" style="padding:0">
            <table class="pz-table">
              <thead>
                <tr>
                  <th>En vigueur depuis</th>
                  <th>Jusqu'au</th>
                  <th>Valeur</th>
                  <th>Référence légale</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (h of historyEntries(); track h.id) {
                  <tr [class.hist-current]="h.active">
                    <td class="pz-mono" style="font-size:12px">{{ h.effectiveFrom }}</td>
                    <td class="pz-mono" style="font-size:12px;color:var(--pz-muted)">{{ h.effectiveTo ?? '∞' }}</td>
                    <td>
                      @if (h.numericValue !== null) {
                        <strong class="pz-mono" style="color:var(--pz-primary)">{{ h.numericValue }} %</strong>
                      } @else if (h.stringValue) {
                        <span class="pz-mono" style="font-size:12.5px">{{ h.stringValue }}</span>
                      } @else {
                        <span class="pz-muted">—</span>
                      }
                    </td>
                    <td style="font-size:12px;color:var(--pz-muted)">{{ h.legalReference ?? '—' }}</td>
                    <td>
                      <span class="pz-pill" [class.pos]="h.active" [class.warn]="!h.active">
                        {{ h.active ? 'Actif' : 'Inactif' }}
                      </span>
                    </td>
                    <td>
                      @if (!h.active) {
                        <button class="pz-btn pz-sm pz-primary" style="font-size:11.5px;white-space:nowrap" (click)="applyHistorical(h)">
                          <pz-icon name="RotateCcw" [size]="12" /> Appliquer
                        </button>
                      } @else {
                        <span style="font-size:11.5px;color:var(--pz-muted);padding:4px 8px">Actuelle</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
            @if (!historyEntries().length) {
              <div style="padding:32px;text-align:center;color:var(--pz-muted);font-size:13px">Aucun historique disponible</div>
            }
          </div>
          <div class="modal-foot"><button class="pz-btn" (click)="closeHistory()">Fermer</button></div>
        </div>
      </div>
    }

    <!-- ── Modal Création / Édition paramètre ───────────────────────────── -->
    @if (modalOpen()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-panel" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <div class="modal-title">
              @if (applyingFrom()) {
                Appliquer les valeurs de {{ applyingFrom() }}
              } @else {
                {{ editingId() ? 'Modifier le paramètre' : 'Nouveau paramètre réglementaire' }}
              }
            </div>
            <button class="pz-icon-btn" (click)="closeModal()"><pz-icon name="X" [size]="18" /></button>
          </div>
          <div class="modal-body">
            @if (applyingFrom()) {
              <div class="apply-banner">
                <pz-icon name="Info" [size]="15" /> Un nouveau paramètre sera créé en vigueur à partir de la date ci-dessous.
              </div>
            }
            <div class="form-row">
              <div class="form-group">
                <label>Clé technique <span class="req">*</span></label>
                <input
                  class="pz-input"
                  [(ngModel)]="form.paramKey"
                  placeholder="ex: CNSS_SAL"
                  [disabled]="!!editingId() || !!applyingFrom()"
                />
              </div>
              <div class="form-group">
                <label>Catégorie</label>
                <input class="pz-input" [(ngModel)]="form.category" placeholder="ex: COTISATIONS_SOCIALES" list="cat-list" />
                <datalist id="cat-list">
                  @for (cat of categories(); track cat) {
                    <option [value]="cat">{{ cat }}</option>
                  }
                </datalist>
              </div>
            </div>
            <div class="form-group">
              <label>Libellé <span class="req">*</span></label>
              <input class="pz-input" [(ngModel)]="form.paramLabel" placeholder="ex: CNSS salarié (base)" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Valeur numérique (%)</label>
                <input class="pz-input pz-mono" type="number" step="0.001" [(ngModel)]="form.numericValue" placeholder="ex: 9.18" />
              </div>
              <div class="form-group">
                <label>Valeur texte</label>
                <input class="pz-input" [(ngModel)]="form.stringValue" placeholder="si non numérique" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>En vigueur depuis <span class="req">*</span></label>
                <input class="pz-input" type="date" [(ngModel)]="form.effectiveFrom" />
              </div>
              <div class="form-group">
                <label>En vigueur jusqu'au</label>
                <input class="pz-input" type="date" [(ngModel)]="form.effectiveTo" />
              </div>
            </div>
            <div class="form-group">
              <label>Référence légale</label>
              <input class="pz-input" [(ngModel)]="form.legalReference" placeholder="ex: JORT n°3-2026" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea class="pz-input" rows="2" [(ngModel)]="form.description" placeholder="Description optionnelle…"></textarea>
            </div>
            <div class="form-check">
              <input type="checkbox" id="active-chk" [(ngModel)]="form.active" />
              <label for="active-chk">Paramètre actif</label>
            </div>
            @if (saveError()) {
              <div class="form-error">{{ saveError() }}</div>
            }
          </div>
          <div class="modal-foot">
            <button class="pz-btn" (click)="closeModal()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="saving()" (click)="save()">
              @if (saving()) {
                <span class="spinner"></span> Enregistrement…
              } @else {
                <pz-icon name="Check" [size]="14" [strokeWidth]="1.8" />
                {{ applyingFrom() ? 'Créer le nouveau paramètre' : editingId() ? 'Enregistrer' : 'Créer' }}
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ── Confirmation suppression paramètre ───────────────────────────── -->
    @if (deleteTarget()) {
      <div class="modal-backdrop" (click)="deleteTarget.set(null)">
        <div class="modal-panel confirm-panel" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <div class="modal-title" style="color:var(--pz-danger-ink)">Supprimer le paramètre</div>
            <button class="pz-icon-btn" (click)="deleteTarget.set(null)"><pz-icon name="X" [size]="18" /></button>
          </div>
          <div class="modal-body">
            <p style="font-size:13.5px">
              Voulez-vous vraiment supprimer <strong>{{ deleteTarget()!.paramLabel }}</strong> (<span class="pz-mono">{{
                deleteTarget()!.paramKey
              }}</span
              >) ?
            </p>
            <p style="font-size:12.5px;color:var(--pz-danger-ink);margin-top:8px">Cette action est irréversible.</p>
          </div>
          <div class="modal-foot">
            <button class="pz-btn" (click)="deleteTarget.set(null)">Annuler</button>
            <button
              class="pz-btn"
              style="background:var(--pz-danger);color:#fff;border-color:var(--pz-danger)"
              [disabled]="saving()"
              (click)="doDelete()"
            >
              @if (saving()) {
                Suppression…
              } @else {
                <pz-icon name="Trash" [size]="14" /> Supprimer
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
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px;
        text-align: center;
      }
      .empty-title {
        font-size: 15px;
        font-weight: 600;
        margin-top: 14px;
        color: var(--pz-ink);
      }
      .empty-sub {
        font-size: 13px;
        color: var(--pz-muted);
        margin-top: 4px;
      }

      .card-head {
        padding: 14px 20px 8px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .card-title {
        font-size: 14px;
        font-weight: 600;
      }
      .cat-cnt {
        background: var(--pz-primary-soft);
        color: var(--pz-primary-ink);
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 999px;
      }

      .year-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 26px;
        border-radius: 7px;
        background: var(--pz-surface-3);
        color: var(--pz-ink);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.02em;
      }
      .year-badge.current {
        background: var(--pz-primary-soft);
        color: var(--pz-primary);
      }
      .snap-preview {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .snap-tag {
        display: inline-block;
        font-size: 11.5px;
        background: var(--pz-surface-3);
        padding: 2px 8px;
        border-radius: 5px;
      }
      .snap-more {
        font-size: 11.5px;
        color: var(--pz-muted);
        padding: 2px 0;
      }

      .pz-table {
        width: 100%;
        border-collapse: collapse;
      }
      .pz-table th {
        text-align: left;
        font-size: 11px;
        font-weight: 600;
        color: var(--pz-muted);
        padding: 8px 16px;
        border-bottom: 1px solid var(--pz-line);
        text-transform: uppercase;
        letter-spacing: 0.05em;
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
      .hist-current td {
        background: #f0fdf4 !important;
      }

      .irpp-card .card-head {
        border-bottom: 1px solid var(--pz-line);
      }
      .rate-chip {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 13px;
        background: var(--pz-surface-3);
      }
      .rate-chip.zero {
        background: var(--pz-pos-soft);
        color: var(--pz-pos-ink);
      }
      .rate-chip.high {
        background: #fee2e2;
        color: #b91c1c;
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        backdrop-filter: blur(2px);
      }
      .modal-panel {
        background: var(--pz-surface);
        border-radius: var(--pz-radius-lg);
        box-shadow: var(--pz-shadow-xl);
        width: 100%;
        max-width: 620px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        animation: pzSlideUp 0.18s ease-out;
      }
      .confirm-panel {
        max-width: 420px;
      }
      .modal-head {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 18px 20px 14px;
        border-bottom: 1px solid var(--pz-line);
      }
      .modal-title {
        font-size: 15px;
        font-weight: 600;
        flex: 1;
      }
      .modal-body {
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .modal-foot {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 14px 20px 18px;
        border-top: 1px solid var(--pz-line);
      }

      .apply-banner {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        background: #eff6ff;
        color: #1d4ed8;
        border: 1px solid #bfdbfe;
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 12.5px;
        line-height: 1.5;
      }
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .form-group label {
        font-size: 12.5px;
        font-weight: 500;
        color: var(--pz-ink-2);
      }
      .req {
        color: var(--pz-danger);
      }
      .pz-input {
        height: 36px;
        padding: 0 10px;
        border: 1px solid var(--pz-line-2);
        border-radius: 8px;
        font: inherit;
        font-size: 13.5px;
        color: var(--pz-ink);
        background: var(--pz-surface);
        outline: none;
        width: 100%;
        box-sizing: border-box;
        transition: border-color 0.12s;
      }
      .pz-input:focus {
        border-color: var(--pz-primary);
        box-shadow: 0 0 0 3px var(--pz-primary-soft);
      }
      .pz-input[disabled] {
        background: var(--pz-surface-3);
        color: var(--pz-muted);
        cursor: not-allowed;
      }
      textarea.pz-input {
        height: auto;
        padding: 8px 10px;
        resize: vertical;
      }
      .form-check {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13.5px;
      }
      .form-check input[type='checkbox'] {
        width: 16px;
        height: 16px;
        accent-color: var(--pz-primary);
        cursor: pointer;
      }
      .form-error {
        background: #fee2e2;
        color: #b91c1c;
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 13px;
      }
      .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        display: inline-block;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      @keyframes pzSlideUp {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .pz-ghost {
        background: transparent;
        border-color: var(--pz-line);
      }
      .pz-ghost:hover {
        background: var(--pz-surface-3);
      }
      .pz-icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--pz-muted);
        display: flex;
        align-items: center;
        padding: 4px;
        border-radius: 6px;
        flex-shrink: 0;
      }
      .pz-icon-btn:hover {
        background: var(--pz-surface-3);
      }
    `,
  ],
})
export default class RegulatoryComponent {
  protected readonly data = inject(DataService);
  private readonly api = inject(ApiService);

  // ── Standard param signals ───────────────────────────────────────────────
  protected readonly modalOpen = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly applyingFrom = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly saveError = signal('');
  protected readonly deleteTarget = signal<RegulatoryParam | null>(null);
  protected readonly historyKey = signal<string | null>(null);
  protected readonly historyLabel = signal('');
  protected form: ParamForm = { ...EMPTY_FORM };

  // ── IRPP signals ─────────────────────────────────────────────────────────
  protected readonly irppModalOpen = signal(false);
  protected readonly irppEditId = signal<number | null>(null);
  protected readonly irppErr = signal('');
  protected irppForm: IrppForm = { ...EMPTY_IRPP };
  protected readonly deleteIrppTarget = signal<RegulatoryParam | null>(null);

  // ── Snapshot signals ─────────────────────────────────────────────────────
  protected readonly archiveModalOpen = signal(false);
  protected readonly snapshotBusy = signal(false);
  protected readonly snapshotErr = signal('');
  protected readonly applyTarget = signal<{ year: number; params: RegulatoryParam[] } | null>(null);
  protected archiveYearValue = new Date().getFullYear() + 1;
  protected archiveEffectiveFrom = `${new Date().getFullYear() + 1}-01-01`;

  // ── Computed ─────────────────────────────────────────────────────────────
  protected readonly currentYear = computed(() => new Date().getFullYear());
  protected readonly nextYear = computed(() => new Date().getFullYear() + 1);

  protected readonly irppParamsInDb = computed(() =>
    this.data.regulatoryParams().filter(p => (p.category ?? '').toUpperCase() === 'IRPP' && p.active),
  );

  protected readonly activeParams = computed(() =>
    this.data.regulatoryParams().filter(p => p.active && (p.category ?? '').toUpperCase() !== 'IRPP'),
  );

  protected readonly categories = computed(() => {
    const cats = [...new Set(this.activeParams().map(p => p.category ?? ''))];
    return cats.sort();
  });

  protected readonly allActiveForArchive = computed(() => this.data.regulatoryParams().filter(p => p.active));

  protected readonly snapshotYears = computed(() => {
    const byYear = new Map<number, RegulatoryParam[]>();
    for (const p of this.data.regulatoryParams()) {
      const year = parseInt(p.effectiveFrom.slice(0, 4), 10);
      if (!isNaN(year)) {
        if (!byYear.has(year)) byYear.set(year, []);
        byYear.get(year)!.push(p);
      }
    }
    return [...byYear.entries()].sort((a, b) => b[0] - a[0]).map(([year, params]) => ({ year, params }));
  });

  protected readonly historyEntries = computed(() => {
    const key = this.historyKey();
    if (!key) return [];
    return this.data
      .regulatoryParams()
      .filter(p => p.paramKey === key)
      .sort((a, b) => (b.effectiveFrom > a.effectiveFrom ? 1 : -1));
  });

  // ── IRPP helpers ─────────────────────────────────────────────────────────
  protected irppByFrom(from: number): RegulatoryParam | undefined {
    return this.irppParamsInDb().find(p => {
      const parts = (p.stringValue ?? '').split('|');
      return parseFloat(parts[0] ?? '0') === from;
    });
  }

  protected openCreateIrpp(): void {
    this.irppEditId.set(null);
    this.irppForm = { ...EMPTY_IRPP };
    this.irppErr.set('');
    this.irppModalOpen.set(true);
  }

  protected openEditIrpp(p: RegulatoryParam): void {
    const parts = (p.stringValue ?? '0|').split('|');
    this.irppForm = {
      paramKey: p.paramKey,
      from: parts[0] ?? '',
      to: parts[1] ?? '',
      rate: p.numericValue != null ? String(p.numericValue) : '',
      effectiveFrom: p.effectiveFrom,
      legalReference: p.legalReference ?? '',
    };
    this.irppErr.set('');
    this.irppEditId.set(p.id);
    this.irppModalOpen.set(true);
  }

  protected closeIrppModal(): void {
    this.irppModalOpen.set(false);
    this.irppEditId.set(null);
  }

  protected saveIrpp(): void {
    const from = parseFloat(this.irppForm.from);
    const rate = parseFloat(this.irppForm.rate);
    if (isNaN(from) || isNaN(rate)) {
      this.irppErr.set('Le champ « De » et le taux sont obligatoires.');
      return;
    }
    const to = this.irppForm.to ? parseFloat(this.irppForm.to) : null;
    const stringValue = to != null ? `${from}|${to}` : `${from}|`;
    const paramKey = this.irppForm.paramKey.trim() || `IRPP_T_${from}`;
    const paramLabel =
      to != null ? `${from.toLocaleString('fr-FR')} – ${to.toLocaleString('fr-FR')} TND` : `> ${from.toLocaleString('fr-FR')} TND`;

    const dto: Partial<RegulatoryParam> = {
      paramKey,
      paramLabel,
      category: 'IRPP',
      numericValue: rate,
      stringValue,
      effectiveFrom: this.irppForm.effectiveFrom || new Date().toISOString().slice(0, 10),
      legalReference: this.irppForm.legalReference.trim() || null,
      active: true,
    };

    this.saving.set(true);
    this.irppErr.set('');
    const id = this.irppEditId();
    const call = id ? this.api.updateRegulatoryParam(id, dto) : this.api.createRegulatoryParam(dto);
    call.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeIrppModal();
        this.reload();
      },
      error: err => {
        this.saving.set(false);
        this.irppErr.set(err?.error?.detail ?? 'Erreur lors de la sauvegarde.');
      },
    });
  }

  protected confirmDeleteIrpp(p: RegulatoryParam): void {
    this.deleteIrppTarget.set(p);
  }

  protected initDefaultIrpp(): void {
    const today = new Date().toISOString().slice(0, 10);
    const calls = DEFAULT_IRPP_SEED.map(b =>
      this.api.createRegulatoryParam({
        paramKey: `IRPP_T_${b.from}`,
        paramLabel: b.label,
        category: 'IRPP',
        numericValue: b.rate,
        stringValue: b.to != null ? `${b.from}|${b.to}` : `${b.from}|`,
        effectiveFrom: today,
        legalReference: 'LF 2026 Art. 12',
        active: true,
      }),
    );
    this.snapshotBusy.set(true);
    forkJoin(calls).subscribe({
      next: () => {
        this.snapshotBusy.set(false);
        this.reload();
      },
      error: () => this.snapshotBusy.set(false),
    });
  }

  // ── Standard param CRUD ──────────────────────────────────────────────────
  protected activeParamsByCategory(cat: string): RegulatoryParam[] {
    return this.activeParams().filter(p => (p.category ?? '') === cat);
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.applyingFrom.set(null);
    this.form = { ...EMPTY_FORM };
    this.saveError.set('');
    this.modalOpen.set(true);
  }
  protected openCreateForCat(cat: string): void {
    this.openCreate();
    this.form.category = cat;
  }

  protected openEdit(p: RegulatoryParam): void {
    this.editingId.set(p.id);
    this.applyingFrom.set(null);
    this.form = {
      paramKey: p.paramKey,
      paramLabel: p.paramLabel,
      category: p.category ?? '',
      numericValue: p.numericValue != null ? String(p.numericValue) : '',
      stringValue: p.stringValue ?? '',
      effectiveFrom: p.effectiveFrom,
      effectiveTo: p.effectiveTo ?? '',
      legalReference: p.legalReference ?? '',
      description: p.description ?? '',
      active: p.active,
    };
    this.saveError.set('');
    this.modalOpen.set(true);
  }

  protected openHistory(p: RegulatoryParam): void {
    this.historyKey.set(p.paramKey);
    this.historyLabel.set(p.paramLabel);
    this.reload();
  }
  protected closeHistory(): void {
    this.historyKey.set(null);
  }

  protected applyHistorical(h: RegulatoryParam): void {
    this.closeHistory();
    this.editingId.set(null);
    this.applyingFrom.set(h.effectiveFrom);
    this.form = {
      paramKey: h.paramKey,
      paramLabel: h.paramLabel,
      category: h.category ?? '',
      numericValue: h.numericValue != null ? String(h.numericValue) : '',
      stringValue: h.stringValue ?? '',
      effectiveFrom: new Date().toISOString().slice(0, 10),
      effectiveTo: '',
      legalReference: h.legalReference ?? '',
      description: h.description ?? '',
      active: true,
    };
    this.saveError.set('');
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
    this.editingId.set(null);
    this.applyingFrom.set(null);
  }

  protected save(): void {
    if (!this.form.paramKey.trim() || !this.form.paramLabel.trim() || !this.form.effectiveFrom) {
      this.saveError.set('Les champs Clé, Libellé et Date de début sont obligatoires.');
      return;
    }
    this.saving.set(true);
    this.saveError.set('');
    const dto: Partial<RegulatoryParam> = {
      paramKey: this.form.paramKey.trim(),
      paramLabel: this.form.paramLabel.trim(),
      category: this.form.category.trim() || null,
      numericValue: this.form.numericValue ? +this.form.numericValue : null,
      stringValue: this.form.stringValue.trim() || null,
      effectiveFrom: this.form.effectiveFrom,
      effectiveTo: this.form.effectiveTo || null,
      legalReference: this.form.legalReference.trim() || null,
      description: this.form.description.trim() || null,
      active: this.form.active,
    };
    const id = this.editingId();
    (id ? this.api.updateRegulatoryParam(id, dto) : this.api.createRegulatoryParam(dto)).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.reload();
      },
      error: err => {
        this.saving.set(false);
        this.saveError.set(err?.error?.detail ?? err?.error?.title ?? 'Erreur serveur');
      },
    });
  }

  protected confirmDelete(p: RegulatoryParam): void {
    this.deleteTarget.set(p);
  }
  protected doDelete(): void {
    const p = this.deleteTarget() ?? this.deleteIrppTarget();
    if (!p) return;
    this.saving.set(true);
    this.api.deleteRegulatoryParam(p.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.deleteTarget.set(null);
        this.deleteIrppTarget.set(null);
        this.reload();
      },
      error: () => {
        this.saving.set(false);
        this.deleteTarget.set(null);
        this.deleteIrppTarget.set(null);
      },
    });
  }

  // ── Snapshot ─────────────────────────────────────────────────────────────
  protected openArchiveModal(): void {
    this.archiveYearValue = new Date().getFullYear() + 1;
    this.archiveEffectiveFrom = `${this.archiveYearValue}-01-01`;
    this.snapshotErr.set('');
    this.archiveModalOpen.set(true);
  }

  protected prepareExercice(): void {
    const src = this.allActiveForArchive();
    if (!src.length) {
      this.snapshotErr.set('Aucun paramètre actif à copier.');
      return;
    }
    const effectiveFrom = this.archiveEffectiveFrom || `${this.archiveYearValue}-01-01`;
    this.snapshotBusy.set(true);
    this.snapshotErr.set('');
    forkJoin(
      src.map(p =>
        this.api.createRegulatoryParam({
          paramKey: p.paramKey,
          paramLabel: p.paramLabel,
          category: p.category,
          numericValue: p.numericValue,
          stringValue: p.stringValue,
          effectiveFrom,
          effectiveTo: null,
          legalReference: p.legalReference,
          description: p.description,
          active: false,
        }),
      ),
    ).subscribe({
      next: () => {
        this.snapshotBusy.set(false);
        this.archiveModalOpen.set(false);
        this.reload();
      },
      error: () => {
        this.snapshotBusy.set(false);
        this.snapshotErr.set('Erreur lors de la création des brouillons.');
      },
    });
  }

  protected openApplySnapshot(snap: { year: number; params: RegulatoryParam[] }): void {
    this.snapshotErr.set('');
    this.applyTarget.set(snap);
  }

  protected confirmApplySnapshot(): void {
    const target = this.applyTarget();
    if (!target) return;
    const today = new Date().toISOString().slice(0, 10);
    this.snapshotBusy.set(true);
    this.snapshotErr.set('');
    forkJoin(
      target.params.map(p =>
        this.api.createRegulatoryParam({
          paramKey: p.paramKey,
          paramLabel: p.paramLabel,
          category: p.category,
          numericValue: p.numericValue,
          stringValue: p.stringValue,
          effectiveFrom: today,
          effectiveTo: null,
          legalReference: p.legalReference,
          description: p.description,
          active: true,
        }),
      ),
    ).subscribe({
      next: () => {
        this.snapshotBusy.set(false);
        this.applyTarget.set(null);
        this.reload();
      },
      error: () => {
        this.snapshotBusy.set(false);
        this.snapshotErr.set("Erreur lors de l'application du snapshot.");
      },
    });
  }

  private reload(): void {
    this.api.regulatoryParams().subscribe({ next: v => this.data.regulatoryParams.set(v), error: () => {} });
  }
}
