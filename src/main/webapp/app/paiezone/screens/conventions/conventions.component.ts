import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { ApiService } from '../../core/api.service';
import type { ActivitySector, SectoralConvention, ConventionRule } from '../../core/types';

const RULE_META: Record<string, { icon: string; label: string; color: string; bg: string; hint: string; unit: string }> = {
  HOLIDAY: {
    icon: '📅',
    label: 'Jour férié',
    color: '#1d4ed8',
    bg: '#dbeafe',
    hint: 'Date spécifique au secteur, ajoutée au calcul de paie.',
    unit: 'date',
  },
  OVERTIME_25: {
    icon: '⏱️',
    label: 'HS jour (×)',
    color: '#059669',
    bg: '#d1fae5',
    hint: 'Coefficient HS jour. Ex: 1.35 = +35%.',
    unit: 'coeff',
  },
  OVERTIME_50: {
    icon: '🌙',
    label: 'HS nuit/férié (×)',
    color: '#7c3aed',
    bg: '#ede9fe',
    hint: 'Coefficient HS nuit ou férié. Ex: 1.65 = +65%.',
    unit: 'coeff',
  },
  PREMIUM: {
    icon: '💰',
    label: 'Prime fixe (TND)',
    color: '#b45309',
    bg: '#fef3c7',
    hint: 'Prime mensuelle obligatoire en dinars.',
    unit: 'tnd',
  },
  PREMIUM_PCT: {
    icon: '📊',
    label: 'Prime % brut',
    color: '#be185d',
    bg: '#fce7f3',
    hint: 'Prime calculée en % du salaire brut.',
    unit: 'pct',
  },
};

const RULE_TYPES = Object.keys(RULE_META);

const SECTOR_META: Record<string, { icon: string; color: string }> = {
  BANQUE: { icon: '🏦', color: '#2563eb' },
  TEXTILE: { icon: '🧵', color: '#7c3aed' },
  BTP: { icon: '🏗️', color: '#d97706' },
  HOTELLERIE: { icon: '🏨', color: '#0891b2' },
  COMMERCE: { icon: '🛒', color: '#16a34a' },
  TRANSPORT: { icon: '🚛', color: '#ea580c' },
  IT: { icon: '💻', color: '#6366f1' },
  SANTE: { icon: '🏥', color: '#dc2626' },
  EDUCATION: { icon: '🎓', color: '#0d9488' },
  GENERAL: { icon: '⚖️', color: '#64748b' },
};

@Component({
  selector: 'pz-conventions',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>Super Admin</strong> <span class="sep">/</span> Conventions Sectorielles</div>
          <h1>Conventions Sectorielles</h1>
        </div>
        <button class="pz-btn pz-primary" (click)="openCreateSector()">
          <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Nouveau secteur
        </button>
      </div>

      <div class="cv-layout">
        <!-- ── Sidebar secteurs ─────────────────────────── -->
        <aside class="cv-aside">
          <div class="cv-aside-title">Secteurs</div>
          @for (s of sectors(); track s.id) {
            <div
              class="cv-sector-item"
              [class.active]="selectedSector()?.id === s.id"
              [style.--sc]="sectorColor(s.code)"
              (click)="selectSector(s)"
            >
              <span class="cv-sector-emoji">{{ sectorIcon(s.code) }}</span>
              <div class="cv-sector-text">
                <div class="cv-sector-name">{{ s.label }}</div>
                <div class="cv-sector-sub">
                  {{ conventions().length && selectedSector()?.id === s.id ? conventions().length + ' convention(s)' : s.code }}
                </div>
              </div>
              <button class="cv-edit-btn" title="Modifier" (click)="$event.stopPropagation(); openEditSector(s)">
                <pz-icon name="Pencil" [size]="12" />
              </button>
            </div>
          }
          @if (sectors().length === 0) {
            <div class="cv-empty-sm">Aucun secteur configuré</div>
          }
        </aside>

        <!-- ── Zone principale ──────────────────────────── -->
        <main class="cv-main">
          @if (!selectedSector()) {
            <div class="cv-splash">
              <div class="cv-splash-icon">🏭</div>
              <div class="cv-splash-title">Conventions sectorielles</div>
              <p class="cv-splash-sub">
                Sélectionnez un secteur pour gérer ses conventions annuelles et ses règles spécifiques (jours fériés, primes, taux HS).
              </p>
            </div>
          } @else {
            <!-- Header secteur -->
            <div class="cv-header" [style.--sc]="sectorColor(selectedSector()!.code)">
              <span class="cv-header-icon">{{ sectorIcon(selectedSector()!.code) }}</span>
              <div class="cv-header-text">
                <h2>{{ selectedSector()!.label }}</h2>
                <p>{{ selectedSector()!.description ?? 'Aucune description' }}</p>
              </div>
              <button class="pz-btn pz-primary cv-header-btn" (click)="openCreateConvention()">
                <pz-icon name="Plus" [size]="14" /> Nouvelle convention
              </button>
            </div>

            <!-- Conventions (accordion) -->
            @if (conventions().length === 0) {
              <div class="cv-empty">
                <pz-icon name="FolderOpen" [size]="32" />
                <p>Aucune convention pour ce secteur.</p>
                <button class="pz-btn pz-primary pz-sm" (click)="openCreateConvention()">Créer la première</button>
              </div>
            }

            @for (c of conventions(); track c.id) {
              <div class="cv-conv" [class.open]="selectedConvention()?.id === c.id">
                <!-- En-tête de convention -->
                <div class="cv-conv-head" (click)="selectConvention(c)">
                  <div class="cv-conv-year">{{ c.year }}</div>
                  <div class="cv-conv-info">
                    <span class="cv-conv-label">{{ c.label }}</span>
                    <span class="cv-conv-from">{{ c.effectiveFrom ? 'Depuis ' + c.effectiveFrom : '' }}</span>
                  </div>
                  <div class="cv-conv-meta">
                    @if (ruleCountFor(c.id) > 0) {
                      <span class="cv-badge-rules">{{ ruleCountFor(c.id) }} règle{{ ruleCountFor(c.id) > 1 ? 's' : '' }}</span>
                    }
                    <span class="pz-pill" [class]="c.active ? 'pos' : 'neg'" style="font-size:11px">{{
                      c.active ? 'Active' : 'Inactive'
                    }}</span>
                    <pz-icon
                      [name]="selectedConvention()?.id === c.id ? 'ChevronUp' : 'ChevronDown'"
                      [size]="16"
                      style="color:var(--pz-muted)"
                    />
                  </div>
                </div>

                <!-- Corps règles -->
                @if (selectedConvention()?.id === c.id) {
                  <div class="cv-rules-body">
                    <div class="cv-rules-top">
                      <span style="font-size:12px;font-weight:600;color:var(--pz-muted);text-transform:uppercase;letter-spacing:.05em"
                        >Règles {{ c.year }}</span
                      >
                      <button class="pz-btn pz-sm pz-primary" (click)="openCreateRule(c.id)">
                        <pz-icon name="Plus" [size]="13" /> Ajouter
                      </button>
                    </div>

                    @if (rulesLoading()) {
                      <div class="cv-loading">Chargement…</div>
                    } @else if (rules().length === 0) {
                      <div class="cv-rules-empty">
                        <pz-icon name="Inbox" [size]="28" />
                        <span>Aucune règle — ajoutez des jours fériés, primes ou taux.</span>
                      </div>
                    } @else {
                      @for (type of ruleTypes; track type) {
                        @if (rulesByType(type).length > 0) {
                          <div class="cv-rule-group">
                            <div class="cv-rule-group-hd" [style.color]="ruleMeta(type).color" [style.background]="ruleMeta(type).bg">
                              {{ ruleMeta(type).icon }} {{ ruleMeta(type).label }}
                            </div>
                            @for (r of rulesByType(type); track r.id) {
                              <div class="cv-rule-row">
                                <span class="cv-rule-dot" [style.background]="ruleMeta(type).color"></span>
                                <span class="cv-rule-lbl">{{ r.label }}</span>
                                <span class="cv-rule-val" [style.background]="ruleMeta(type).bg" [style.color]="ruleMeta(type).color">
                                  @if (type === 'HOLIDAY') {
                                    {{ formatDate(r.value) }}
                                  } @else if (type === 'PREMIUM') {
                                    {{ r.value }} TND
                                  } @else if (type === 'PREMIUM_PCT') {
                                    {{ r.value }} %
                                  } @else {
                                    × {{ r.value }}
                                  }
                                </span>
                                <div class="cv-rule-actions">
                                  <button class="pz-btn pz-sm" (click)="openEditRule(r)"><pz-icon name="Pencil" [size]="11" /></button>
                                  <button class="pz-btn pz-sm pz-danger" (click)="deleteRule(r.id)">
                                    <pz-icon name="Trash2" [size]="11" />
                                  </button>
                                </div>
                              </div>
                            }
                          </div>
                        }
                      }
                    }
                  </div>
                }
              </div>
            }
          }
        </main>
      </div>
    </div>

    <!-- ── Modal Secteur ─────────────────────────────────────── -->
    @if (showSectorModal()) {
      <div class="pz-overlay" (click)="closeSectorModal()">
        <div class="pz-modal pz-modal-sm" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>{{ editSectorId() ? 'Modifier le secteur' : 'Nouveau secteur' }}</span>
            <button class="pz-modal-close" (click)="closeSectorModal()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="cv-form-field">
              <label>Code *</label>
              <input
                type="text"
                [(ngModel)]="sectorForm.code"
                placeholder="ex: BANQUE"
                maxlength="30"
                style="text-transform:uppercase;font-family:monospace;font-size:14px;font-weight:700;letter-spacing:.05em"
              />
            </div>
            <div class="cv-form-field">
              <label>Libellé *</label>
              <input type="text" [(ngModel)]="sectorForm.label" placeholder="ex: Secteur bancaire" />
            </div>
            <div class="cv-form-field">
              <label>Description</label>
              <input type="text" [(ngModel)]="sectorForm.description" placeholder="Banques, assurances, établissements financiers…" />
            </div>
            @if (errMsg()) {
              <div class="cv-err">{{ errMsg() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeSectorModal()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="busy()" (click)="submitSector()">
              @if (busy()) {
                …
              } @else {
                {{ editSectorId() ? 'Enregistrer' : 'Créer' }}
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ── Modal Convention ──────────────────────────────────── -->
    @if (showConventionModal()) {
      <div class="pz-overlay" (click)="closeConventionModal()">
        <div class="pz-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:24px">{{ sectorIcon(selectedSector()!.code) }}</span>
              <div>
                <div style="font-size:15px;font-weight:700">Nouvelle convention</div>
                <div style="font-size:12px;color:var(--pz-muted)">{{ selectedSector()?.label }}</div>
              </div>
            </div>
            <button class="pz-modal-close" (click)="closeConventionModal()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="cv-form-field">
              <label>Année *</label>
              <div class="cv-year-pills">
                @for (y of convYears; track y) {
                  <button
                    type="button"
                    class="cv-year-pill"
                    [class.active]="convForm.year === y"
                    (click)="convForm.year = y; convForm.label = defaultConvLabel()"
                  >
                    {{ y }}
                  </button>
                }
              </div>
            </div>
            <div class="cv-form-field">
              <label>Libellé *</label>
              <input
                type="text"
                [(ngModel)]="convForm.label"
                [placeholder]="'Convention ' + (selectedSector()?.label ?? '') + ' ' + convForm.year"
              />
            </div>
            <div class="cv-form-field">
              <label>Date d'entrée en vigueur <small>(optionnel)</small></label>
              <input
                type="date"
                [(ngModel)]="convForm.effectiveFrom"
                style="color-scheme:light"
                [min]="convForm.year + '-01-01'"
                [max]="convForm.year + '-12-31'"
              />
            </div>
            @if (errMsg()) {
              <div class="cv-err">{{ errMsg() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeConventionModal()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="busy()" (click)="submitConvention()">
              @if (busy()) {
                …
              } @else {
                <pz-icon name="Plus" [size]="14" /> Créer {{ convForm.year }}
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ── Modal Règle ───────────────────────────────────────── -->
    @if (showRuleModal()) {
      <div class="pz-overlay" (click)="closeRuleModal()">
        <div class="pz-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>{{ editRuleId() ? 'Modifier la règle' : 'Nouvelle règle' }}</span>
            <button class="pz-modal-close" (click)="closeRuleModal()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <!-- Sélecteur de type en cards -->
            @if (!editRuleId()) {
              <div class="cv-form-field">
                <label>Type *</label>
                <div class="cv-type-grid">
                  @for (t of ruleTypes; track t) {
                    <div
                      class="cv-type-card"
                      [class.active]="ruleForm.ruleType === t"
                      [style.--tc]="ruleMeta(t).color"
                      [style.--tb]="ruleMeta(t).bg"
                      (click)="ruleForm.ruleType = t"
                    >
                      <span class="cv-type-icon">{{ ruleMeta(t).icon }}</span>
                      <span class="cv-type-lbl">{{ ruleMeta(t).label }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Hint contextuel -->
            <div
              class="cv-hint"
              [style.border-color]="ruleMeta(ruleForm.ruleType).color + '44'"
              [style.background]="ruleMeta(ruleForm.ruleType).bg"
            >
              <span>{{ ruleMeta(ruleForm.ruleType).icon }}</span>
              <span style="color:#374151">{{ ruleMeta(ruleForm.ruleType).hint }}</span>
            </div>

            <div class="cv-form-field">
              <label>Libellé *</label>
              <input type="text" [(ngModel)]="ruleForm.label" [placeholder]="rulePlaceholder()" />
            </div>

            <div class="cv-form-field">
              <label>Valeur *</label>
              @if (ruleForm.ruleType === 'HOLIDAY') {
                <input type="date" [(ngModel)]="ruleForm.value" style="color-scheme:light" />
              } @else if (ruleForm.ruleType === 'OVERTIME_25' || ruleForm.ruleType === 'OVERTIME_50') {
                <div style="position:relative">
                  <input
                    type="number"
                    [(ngModel)]="ruleForm.value"
                    step="0.05"
                    min="1"
                    max="3"
                    style="padding-right:60px"
                    placeholder="1.35"
                  />
                  <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:12px;color:var(--pz-muted)">
                    × salaire
                  </span>
                </div>
              } @else if (ruleForm.ruleType === 'PREMIUM') {
                <div style="position:relative">
                  <input type="number" [(ngModel)]="ruleForm.value" step="10" min="0" style="padding-right:50px" placeholder="500" />
                  <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:12px;color:var(--pz-muted)"
                    >TND</span
                  >
                </div>
              } @else {
                <div style="position:relative">
                  <input
                    type="number"
                    [(ngModel)]="ruleForm.value"
                    step="0.5"
                    min="0"
                    max="100"
                    style="padding-right:40px"
                    placeholder="5"
                  />
                  <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:12px;color:var(--pz-muted)"
                    >%</span
                  >
                </div>
              }
            </div>

            @if (errMsg()) {
              <div class="cv-err">{{ errMsg() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeRuleModal()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="busy()" (click)="submitRule()">
              @if (busy()) {
                …
              } @else {
                {{ editRuleId() ? 'Enregistrer' : 'Ajouter la règle' }}
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

      /* ── Layout ──────────────────────────────────────── */
      .cv-layout {
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 20px;
        align-items: start;
      }

      /* ── Sidebar ─────────────────────────────────────── */
      .cv-aside {
        background: var(--pz-surface);
        border: 1px solid var(--pz-line);
        border-radius: 16px;
        padding: 14px;
        position: sticky;
        top: 16px;
      }
      .cv-aside-title {
        font-size: 10.5px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--pz-muted);
        padding: 0 6px 10px;
        border-bottom: 1px solid var(--pz-line);
        margin-bottom: 8px;
      }
      .cv-sector-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 10px;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.12s;
        border-left: 3px solid transparent;
        margin-bottom: 2px;
      }
      .cv-sector-item:hover {
        background: var(--pz-surface-3);
      }
      .cv-sector-item.active {
        background: color-mix(in srgb, var(--sc) 8%, transparent);
        border-left-color: var(--sc);
      }
      .cv-sector-emoji {
        font-size: 20px;
        width: 28px;
        text-align: center;
      }
      .cv-sector-text {
        flex: 1;
        min-width: 0;
      }
      .cv-sector-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--pz-ink);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cv-sector-sub {
        font-size: 11px;
        color: var(--pz-muted);
      }
      .cv-edit-btn {
        opacity: 0;
        background: none;
        border: 1px solid var(--pz-line);
        border-radius: 6px;
        padding: 3px 5px;
        cursor: pointer;
        color: var(--pz-muted);
        transition: opacity 0.1s;
        display: flex;
        align-items: center;
      }
      .cv-sector-item:hover .cv-edit-btn {
        opacity: 1;
      }
      .cv-empty-sm {
        color: var(--pz-muted);
        font-size: 12px;
        text-align: center;
        padding: 16px;
      }

      /* ── Main ────────────────────────────────────────── */
      .cv-splash {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 340px;
        gap: 12px;
        background: var(--pz-surface);
        border: 1px dashed var(--pz-line);
        border-radius: 16px;
        padding: 40px;
      }
      .cv-splash-icon {
        font-size: 52px;
      }
      .cv-splash-title {
        font-size: 18px;
        font-weight: 700;
        color: var(--pz-ink);
      }
      .cv-splash-sub {
        font-size: 13px;
        color: var(--pz-muted);
        text-align: center;
        max-width: 340px;
        line-height: 1.6;
      }

      /* ── Header secteur ──────────────────────────────── */
      .cv-header {
        display: flex;
        align-items: center;
        gap: 16px;
        background: color-mix(in srgb, var(--sc) 6%, var(--pz-surface));
        border: 1px solid color-mix(in srgb, var(--sc) 25%, transparent);
        border-radius: 16px;
        padding: 18px 22px;
        margin-bottom: 18px;
      }
      .cv-header-icon {
        font-size: 40px;
      }
      .cv-header-text {
        flex: 1;
      }
      .cv-header-text h2 {
        font-size: 18px;
        font-weight: 700;
        margin: 0 0 2px;
      }
      .cv-header-text p {
        font-size: 12px;
        color: var(--pz-muted);
        margin: 0;
      }
      .cv-header-btn {
        margin-left: auto;
        white-space: nowrap;
      }

      /* ── Vide ────────────────────────────────────────── */
      .cv-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 40px;
        color: var(--pz-muted);
        text-align: center;
        background: var(--pz-surface);
        border: 1px dashed var(--pz-line);
        border-radius: 14px;
      }

      /* ── Convention card ─────────────────────────────── */
      .cv-conv {
        background: var(--pz-surface);
        border: 1.5px solid var(--pz-line);
        border-radius: 14px;
        margin-bottom: 10px;
        overflow: hidden;
        transition:
          border-color 0.15s,
          box-shadow 0.15s;
      }
      .cv-conv.open {
        border-color: var(--pz-primary);
        box-shadow: 0 4px 16px rgba(99, 102, 241, 0.1);
      }
      .cv-conv-head {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 18px;
        cursor: pointer;
        transition: background 0.1s;
      }
      .cv-conv-head:hover {
        background: var(--pz-surface-3);
      }
      .cv-conv-year {
        background: var(--pz-primary);
        color: #fff;
        border-radius: 10px;
        padding: 5px 14px;
        font-size: 16px;
        font-weight: 800;
        min-width: 68px;
        text-align: center;
      }
      .cv-conv.open .cv-conv-year {
        background: var(--pz-primary);
      }
      .cv-conv-info {
        flex: 1;
      }
      .cv-conv-label {
        font-size: 14px;
        font-weight: 600;
        display: block;
      }
      .cv-conv-from {
        font-size: 11px;
        color: var(--pz-muted);
      }
      .cv-conv-meta {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .cv-badge-rules {
        font-size: 11px;
        background: var(--pz-primary-soft);
        color: var(--pz-primary);
        border-radius: 10px;
        padding: 2px 8px;
        font-weight: 600;
      }

      /* ── Règles body ─────────────────────────────────── */
      .cv-rules-body {
        border-top: 1px solid var(--pz-line);
        padding: 16px 20px;
        background: var(--pz-surface-3);
      }
      .cv-rules-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .cv-loading,
      .cv-rules-empty {
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: center;
        color: var(--pz-muted);
        font-size: 13px;
        padding: 24px;
      }
      .cv-rule-group {
        margin-bottom: 14px;
      }
      .cv-rule-group-hd {
        font-size: 11px;
        font-weight: 700;
        border-radius: 6px;
        padding: 3px 10px;
        display: inline-block;
        margin-bottom: 7px;
      }
      .cv-rule-row {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--pz-surface);
        border: 1px solid var(--pz-line);
        border-radius: 9px;
        padding: 8px 12px;
        margin-bottom: 5px;
      }
      .cv-rule-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .cv-rule-lbl {
        flex: 1;
        font-size: 13px;
        color: var(--pz-ink);
      }
      .cv-rule-val {
        font-size: 12px;
        font-weight: 700;
        border-radius: 6px;
        padding: 3px 10px;
        white-space: nowrap;
      }
      .cv-rule-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.1s;
      }
      .cv-rule-row:hover .cv-rule-actions {
        opacity: 1;
      }

      /* ── Formulaires ─────────────────────────────────── */
      .cv-form-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-bottom: 2px;
      }
      .cv-form-field label {
        font-size: 12px;
        font-weight: 500;
        color: var(--pz-muted);
      }
      .cv-form-field label small {
        font-weight: 400;
      }
      .cv-form-field input,
      .cv-form-field select {
        border: 1px solid var(--pz-line);
        border-radius: 9px;
        padding: 9px 13px;
        font: inherit;
        font-size: 13px;
        background: var(--pz-surface);
        color: var(--pz-ink);
        outline: none;
        width: 100%;
        box-sizing: border-box;
        transition: border-color 0.12s;
      }
      .cv-form-field input:focus,
      .cv-form-field select:focus {
        border-color: var(--pz-primary);
      }
      .cv-err {
        color: #b91c1c;
        font-size: 12px;
        background: #fee2e2;
        border-radius: 8px;
        padding: 8px 12px;
      }
      .cv-hint {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        border-radius: 8px;
        padding: 9px 12px;
        font-size: 12px;
        border: 1px solid;
        margin-bottom: 2px;
      }

      /* ── Pills année ─────────────────────────────────── */
      .cv-year-pills {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .cv-year-pill {
        padding: 6px 18px;
        border-radius: 20px;
        border: 1.5px solid var(--pz-line);
        background: var(--pz-surface);
        color: var(--pz-muted);
        cursor: pointer;
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.12s;
      }
      .cv-year-pill:hover {
        border-color: var(--pz-primary);
        color: var(--pz-primary);
      }
      .cv-year-pill.active {
        background: var(--pz-primary);
        border-color: var(--pz-primary);
        color: #fff;
      }

      /* ── Type cards ──────────────────────────────────── */
      .cv-type-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .cv-type-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 10px 8px;
        border-radius: 10px;
        cursor: pointer;
        border: 1.5px solid var(--pz-line);
        background: var(--pz-surface);
        transition: all 0.12s;
        text-align: center;
      }
      .cv-type-card:hover {
        border-color: var(--tc);
        background: var(--tb);
      }
      .cv-type-card.active {
        border-color: var(--tc);
        background: var(--tb);
      }
      .cv-type-icon {
        font-size: 20px;
      }
      .cv-type-lbl {
        font-size: 11px;
        font-weight: 600;
        color: var(--pz-ink);
        line-height: 1.2;
      }
      .cv-type-card.active .cv-type-lbl {
        color: var(--tc);
      }

      /* ── Boutons danger ──────────────────────────────── */
      .pz-btn.pz-danger {
        color: #b91c1c;
        border-color: #fecaca;
      }
      .pz-btn.pz-danger:hover {
        background: #fee2e2;
      }

      /* ── Overlay & Modal (popup centré) ─────────────── */
      .pz-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1200;
        padding: 16px;
      }
      .pz-modal {
        background: var(--pz-surface, #fff);
        border-radius: 18px;
        width: 520px;
        max-width: 95vw;
        max-height: 88vh;
        overflow: hidden;
        box-shadow: 0 24px 72px rgba(0, 0, 0, 0.22);
        display: flex;
        flex-direction: column;
        animation: popIn 0.18s ease-out;
      }
      .pz-modal-sm {
        width: 400px;
      }
      @keyframes popIn {
        from {
          opacity: 0;
          transform: scale(0.94) translateY(8px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      .pz-modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px 16px;
        font-weight: 700;
        font-size: 15px;
        border-bottom: 1px solid var(--pz-line, #e5e7eb);
        flex-shrink: 0;
      }
      .pz-modal-close {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--pz-muted, #9ca3af);
        display: flex;
        border-radius: 8px;
        padding: 5px;
        transition: background 0.1s;
      }
      .pz-modal-close:hover {
        background: var(--pz-surface-3, #f3f4f6);
      }
      .pz-modal-body {
        padding: 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        overflow-y: auto;
      }
      .pz-modal-foot {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 14px 24px;
        border-top: 1px solid var(--pz-line, #e5e7eb);
        flex-shrink: 0;
        background: var(--pz-surface, #fff);
      }
    `,
  ],
})
export default class ConventionsComponent {
  private readonly api = inject(ApiService);

  protected readonly sectors = signal<ActivitySector[]>([]);
  protected readonly selectedSector = signal<ActivitySector | null>(null);
  protected readonly conventions = signal<SectoralConvention[]>([]);
  protected readonly selectedConvention = signal<SectoralConvention | null>(null);
  protected readonly rules = signal<ConventionRule[]>([]);
  protected readonly rulesLoading = signal(false);
  protected readonly busy = signal(false);
  protected readonly errMsg = signal('');

  protected readonly showSectorModal = signal(false);
  protected readonly editSectorId = signal<number | null>(null);
  protected sectorForm = { code: '', label: '', description: '' };

  protected readonly showConventionModal = signal(false);
  protected readonly convYears = [2024, 2025, 2026, 2027, 2028];
  protected convForm = { year: new Date().getFullYear(), label: '', effectiveFrom: '' };

  protected readonly showRuleModal = signal(false);
  protected readonly editRuleId = signal<number | null>(null);
  protected currentConventionId = 0;
  protected ruleForm = { ruleType: 'HOLIDAY', label: '', value: '' };
  protected readonly ruleTypes = RULE_TYPES;

  private rulesCache = new Map<number, ConventionRule[]>();

  constructor() {
    this.api.activitySectors().subscribe({ next: s => this.sectors.set(s) });
  }

  sectorIcon(code: string): string {
    return SECTOR_META[code]?.icon ?? '🏢';
  }
  sectorColor(code: string): string {
    return SECTOR_META[code]?.color ?? '#6366f1';
  }
  ruleMeta(type: string) {
    return RULE_META[type] ?? RULE_META['HOLIDAY'];
  }

  rulesByType(t: string): ConventionRule[] {
    return this.rules().filter(r => r.ruleType === t);
  }

  ruleCountFor(id: number): number {
    return this.rulesCache.get(id)?.length ?? (this.selectedConvention()?.id === id ? this.rules().length : 0);
  }

  rulePlaceholder(): string {
    const t = this.ruleForm.ruleType;
    if (t === 'HOLIDAY') return 'ex: Fete sectorielle';
    if (t === 'PREMIUM') return 'ex: Prime de rendement';
    if (t === 'PREMIUM_PCT') return 'ex: Prime de transport';
    return 'ex: Taux HS secteur';
  }

  defaultConvLabel(): string {
    const s = this.selectedSector();
    return s ? `Convention ${s.label} ${this.convForm.year}` : '';
  }

  formatDate(d: string): string {
    if (!d || !d.includes('-')) return d;
    const [, m, day] = d.split('-');
    return `${day}/${m}`;
  }

  selectSector(s: ActivitySector) {
    this.selectedSector.set(s);
    this.selectedConvention.set(null);
    this.rules.set([]);
    this.api.sectoralConventions(s.id).subscribe({ next: c => this.conventions.set(c) });
  }

  selectConvention(c: SectoralConvention) {
    if (this.selectedConvention()?.id === c.id) {
      this.selectedConvention.set(null);
      return;
    }
    this.selectedConvention.set(c);
    if (this.rulesCache.has(c.id)) {
      this.rules.set(this.rulesCache.get(c.id)!);
      return;
    }
    this.rulesLoading.set(true);
    this.api.conventionRules(c.id).subscribe({
      next: r => {
        this.rules.set(r);
        this.rulesCache.set(c.id, r);
        this.rulesLoading.set(false);
      },
      error: () => this.rulesLoading.set(false),
    });
  }

  openCreateSector() {
    this.editSectorId.set(null);
    this.sectorForm = { code: '', label: '', description: '' };
    this.errMsg.set('');
    this.showSectorModal.set(true);
  }
  openEditSector(s: ActivitySector) {
    this.editSectorId.set(s.id);
    this.sectorForm = { code: s.code, label: s.label, description: s.description ?? '' };
    this.errMsg.set('');
    this.showSectorModal.set(true);
  }
  closeSectorModal() {
    this.showSectorModal.set(false);
  }

  submitSector() {
    if (!this.sectorForm.label.trim()) {
      this.errMsg.set('Le libellé est obligatoire.');
      return;
    }
    this.busy.set(true);
    const dto = {
      code: this.sectorForm.code.trim().toUpperCase(),
      label: this.sectorForm.label.trim(),
      description: this.sectorForm.description.trim() || null,
      active: true,
    };
    const id = this.editSectorId();
    (id ? this.api.updateActivitySector(id, dto) : this.api.createActivitySector(dto as any)).subscribe({
      next: s => {
        if (id) this.sectors.update(l => l.map(x => (x.id === id ? s : x)));
        else this.sectors.update(l => [...l, s]);
        this.busy.set(false);
        this.closeSectorModal();
      },
      error: (e: any) => {
        this.errMsg.set(e?.error?.detail ?? 'Erreur.');
        this.busy.set(false);
      },
    });
  }

  openCreateConvention() {
    this.convForm = { year: new Date().getFullYear(), label: this.defaultConvLabel(), effectiveFrom: '' };
    this.errMsg.set('');
    this.showConventionModal.set(true);
  }
  closeConventionModal() {
    this.showConventionModal.set(false);
  }

  submitConvention() {
    if (!this.convForm.label.trim()) {
      this.errMsg.set('Le libellé est obligatoire.');
      return;
    }
    const s = this.selectedSector();
    if (!s) return;
    this.busy.set(true);
    this.api
      .createSectoralConvention({
        sectorId: s.id,
        year: this.convForm.year,
        label: this.convForm.label.trim(),
        effectiveFrom: this.convForm.effectiveFrom || undefined,
      })
      .subscribe({
        next: c => {
          this.conventions.update(l => [c, ...l]);
          this.busy.set(false);
          this.closeConventionModal();
        },
        error: (e: any) => {
          this.errMsg.set(e?.error?.detail ?? 'Erreur.');
          this.busy.set(false);
        },
      });
  }

  openCreateRule(conventionId: number) {
    this.editRuleId.set(null);
    this.currentConventionId = conventionId;
    this.ruleForm = { ruleType: 'HOLIDAY', label: '', value: '' };
    this.errMsg.set('');
    this.showRuleModal.set(true);
  }
  openEditRule(r: ConventionRule) {
    this.editRuleId.set(r.id);
    this.currentConventionId = r.convention.id;
    this.ruleForm = { ruleType: r.ruleType, label: r.label, value: r.value };
    this.errMsg.set('');
    this.showRuleModal.set(true);
  }
  closeRuleModal() {
    this.showRuleModal.set(false);
    this.editRuleId.set(null);
  }

  submitRule() {
    if (!this.ruleForm.label.trim() || !this.ruleForm.value) {
      this.errMsg.set('Libellé et valeur sont obligatoires.');
      return;
    }
    this.busy.set(true);
    const id = this.editRuleId();
    (id
      ? this.api.updateConventionRule(id, { label: this.ruleForm.label, value: String(this.ruleForm.value) })
      : this.api.createConventionRule({
          conventionId: this.currentConventionId,
          ruleType: this.ruleForm.ruleType,
          label: this.ruleForm.label,
          value: String(this.ruleForm.value),
        })
    ).subscribe({
      next: r => {
        if (id) this.rules.update(l => l.map(x => (x.id === id ? r : x)));
        else this.rules.update(l => [...l, r]);
        this.rulesCache.set(this.currentConventionId, this.rules());
        this.busy.set(false);
        this.closeRuleModal();
      },
      error: (e: any) => {
        this.errMsg.set(e?.error?.detail ?? 'Erreur.');
        this.busy.set(false);
      },
    });
  }

  deleteRule(id: number) {
    if (!confirm('Supprimer cette règle ?')) return;
    this.api.deleteConventionRule(id).subscribe({
      next: () => {
        this.rules.update(l => l.filter(r => r.id !== id));
        this.rulesCache.set(this.currentConventionId, this.rules());
      },
    });
  }
}
