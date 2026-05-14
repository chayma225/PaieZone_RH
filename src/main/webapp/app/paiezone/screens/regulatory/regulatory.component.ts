import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
          <div class="pz-muted">{{ data.regulatoryParams().length }} paramètre(s) · gestion des taux légaux de paie</div>
        </div>
        <button class="pz-btn pz-primary" (click)="openCreate()">
          <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Nouveau paramètre
        </button>
      </div>

      @if (data.regulatoryParams().length === 0) {
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
            <span class="cat-cnt">{{ paramsByCategory(cat).length }}</span>
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
                <th style="width:90px"></th>
              </tr>
            </thead>
            <tbody>
              @for (p of paramsByCategory(cat); track p.id) {
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
                    <div style="display:flex;gap:6px">
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

      <div class="pz-card irpp-card">
        <div class="card-head">
          <div class="card-title">Barème IRPP 2026</div>
          <span class="pz-pill warn">LF 2026 Art. 12 — lecture seule</span>
        </div>
        <table class="pz-table">
          <thead>
            <tr>
              <th>Tranche annuelle (TND)</th>
              <th>Taux marginal</th>
            </tr>
          </thead>
          <tbody>
            @for (b of data.irppBrackets(); track b.from) {
              <tr>
                <td class="pz-mono" style="font-size:12px">
                  {{ b.from.toLocaleString('fr-FR') }} → {{ b.to ? b.to.toLocaleString('fr-FR') : '∞' }}
                </td>
                <td>
                  <span class="rate-chip" [class.zero]="b.rate === 0" [class.high]="b.rate >= 38">{{ b.rate }} %</span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Modal Création / Édition ─────────────────────────────────────── -->
    @if (modalOpen()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-panel" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <div class="modal-title">{{ editingId() ? 'Modifier le paramètre' : 'Nouveau paramètre réglementaire' }}</div>
            <button class="pz-icon-btn" (click)="closeModal()"><pz-icon name="X" [size]="18" /></button>
          </div>

          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>Clé technique <span class="req">*</span></label>
                <input class="pz-input" [(ngModel)]="form.paramKey" placeholder="ex: CNSS_SAL" [disabled]="!!editingId()" />
                <div class="form-hint">Identifiant unique, ne peut pas être changé après création</div>
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
                <label>Valeur numérique (taux en %)</label>
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
                <pz-icon name="Check" [size]="14" [strokeWidth]="1.8" /> {{ editingId() ? 'Enregistrer' : 'Créer' }}
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ── Confirmation de suppression ──────────────────────────────────── -->
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
            <p style="font-size:12.5px;color:var(--pz-danger-ink);margin-top:8px">
              Cette action est irréversible et peut impacter les calculs de paie.
            </p>
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
        padding: 16px 20px 8px;
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

      /* ── Modal ── */
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
        align-items: center;
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
      .form-hint {
        font-size: 11.5px;
        color: var(--pz-muted);
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
    `,
  ],
})
export default class RegulatoryComponent {
  protected readonly data = inject(DataService);
  private readonly api = inject(ApiService);

  protected readonly modalOpen = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly saving = signal(false);
  protected readonly saveError = signal('');
  protected readonly deleteTarget = signal<RegulatoryParam | null>(null);

  protected form: ParamForm = { ...EMPTY_FORM };

  protected readonly categories = computed(() => {
    const cats = [...new Set(this.data.regulatoryParams().map(p => p.category ?? ''))];
    return cats.sort();
  });

  protected paramsByCategory(cat: string): RegulatoryParam[] {
    return this.data.regulatoryParams().filter(p => (p.category ?? '') === cat);
  }

  protected openCreate(): void {
    this.editingId.set(null);
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

  protected closeModal(): void {
    this.modalOpen.set(false);
    this.editingId.set(null);
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
    const call = id ? this.api.updateRegulatoryParam(id, dto) : this.api.createRegulatoryParam(dto);

    call.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.reload();
      },
      error: err => {
        this.saving.set(false);
        const msg = err?.error?.detail ?? err?.error?.title ?? err?.message ?? 'Erreur serveur';
        this.saveError.set(msg);
      },
    });
  }

  protected confirmDelete(p: RegulatoryParam): void {
    this.deleteTarget.set(p);
  }

  protected doDelete(): void {
    const p = this.deleteTarget();
    if (!p) return;
    this.saving.set(true);
    this.api.deleteRegulatoryParam(p.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.deleteTarget.set(null);
        this.reload();
      },
      error: () => {
        this.saving.set(false);
        this.deleteTarget.set(null);
      },
    });
  }

  private reload(): void {
    this.api.regulatoryParams().subscribe({
      next: v => this.data.regulatoryParams.set(v),
      error: () => {},
    });
  }
}
