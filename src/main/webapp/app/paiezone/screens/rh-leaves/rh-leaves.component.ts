import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { LeaveType } from '../../core/types';

type Tab = 'demandes' | 'types';

@Component({
  selector: 'pz-rh-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>RH</strong> <span class="sep">/</span> Congés</div>
          <h1>Gestion des congés</h1>
          <div class="pz-muted">{{ filtered().length }} demande(s) · {{ pendingCount() }} en attente de validation</div>
        </div>
        <div style="display:flex;gap:8px">
          @if (activeTab() === 'demandes') {
            <button class="pz-btn pz-primary" (click)="openCreate()">
              <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Nouvelle demande
            </button>
          }
          @if (activeTab() === 'types') {
            <button class="pz-btn pz-primary" (click)="openCreateType()">
              <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Nouveau type
            </button>
          }
        </div>
      </div>

      <!-- Tabs -->
      <div class="pz-tabs">
        <button class="pz-tab" [class.active]="activeTab() === 'demandes'" (click)="activeTab.set('demandes')">
          <pz-icon name="Calendar" [size]="14" /> Demandes
          <span class="cnt">{{ data.leaves().length }}</span>
        </button>
        <button class="pz-tab" [class.active]="activeTab() === 'types'" (click)="setTypesTab()">
          <pz-icon name="Tag" [size]="14" /> Types de congé
          <span class="cnt">{{ leaveTypeList().length }}</span>
        </button>
      </div>

      <!-- ── TAB: Demandes ─────────────────────────────────────────────────── -->
      @if (activeTab() === 'demandes') {
        <div class="filters">
          <div class="pz-topbar-search" style="width:260px">
            <pz-icon name="Search" [size]="14" [strokeWidth]="1.6" />
            <input placeholder="Rechercher un employé…" [value]="q()" (input)="q.set($any($event.target).value)" />
          </div>
          <div class="filter-tabs">
            @for (s of statuses; track s.key) {
              <button class="filter-tab" [class.active]="statusFilter() === s.key" (click)="statusFilter.set(s.key)">
                {{ s.label }}
                @if (s.count() > 0) {
                  <span class="cnt">{{ s.count() }}</span>
                }
              </button>
            }
          </div>
        </div>

        <!-- Layout : table + mini-calendrier -->
        <div class="leaves-layout">
          <div class="leaves-table-col">
            <div class="pz-card">
              <table class="pz-table">
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Type</th>
                    <th>Du</th>
                    <th>Au</th>
                    <th>Jours</th>
                    <th>Soumis le</th>
                    <th>Statut</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @if (filtered().length === 0) {
                    <tr>
                      <td colspan="8" style="text-align:center;padding:40px;color:var(--pz-muted)">Aucune demande trouvée</td>
                    </tr>
                  }
                  @for (l of filtered(); track l.id) {
                    @let e = data.empById(l.empId);
                    <tr>
                      <td>
                        <div style="display:flex;align-items:center;gap:10px">
                          @if (e) {
                            <div class="pz-avatar sm" [attr.data-bg]="data.empBgIdx(e.id)">{{ data.initials(e) }}</div>
                            <div>
                              <div style="font-weight:500;font-size:13px">{{ data.fullName(e) }}</div>
                              <div style="font-size:11.5px;color:var(--pz-muted)">{{ e.dept }}</div>
                            </div>
                          } @else {
                            <span class="pz-muted">—</span>
                          }
                        </div>
                      </td>
                      <td>
                        <span class="pz-pill info">{{ l.type }}</span>
                      </td>
                      <td class="pz-mono" style="font-size:12px">{{ l.from }}</td>
                      <td class="pz-mono" style="font-size:12px">{{ l.to }}</td>
                      <td>
                        <strong>{{ l.days }}</strong>
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
                      <td>
                        @if (l.status === 'pending') {
                          <div style="display:flex;gap:6px">
                            <button
                              class="pz-btn pz-sm"
                              style="background:var(--pz-pos);color:#fff;border-color:var(--pz-pos)"
                              [disabled]="busy()"
                              (click)="approve(l.id)"
                              title="Approuver"
                            >
                              <pz-icon name="Check" [size]="13" [strokeWidth]="1.8" />
                            </button>
                            <button
                              class="pz-btn pz-sm"
                              style="color:var(--pz-danger-ink)"
                              [disabled]="busy()"
                              (click)="openReject(l.id)"
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
          <!-- /leaves-table-col -->

          <!-- ── Mini-Calendrier d'équipe ─────────────────────── -->
          <aside class="mini-cal">
            <!-- Header inline pour garantir la visibilité -->
            <div
              style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:16px 14px 12px;display:flex;align-items:center;justify-content:space-between;border-radius:18px 18px 0 0"
            >
              <button
                (click)="prevMonth(); $event.stopPropagation()"
                style="background:rgba(255,255,255,.2);border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:20px;font-weight:700;display:grid;place-items:center;transition:background .15s"
              >
                ‹
              </button>
              <div style="text-align:center">
                <div style="color:#fff;font-size:14px;font-weight:800;text-transform:capitalize;letter-spacing:.01em">
                  {{ calMonthName() }}
                </div>
                <div style="color:rgba(255,255,255,.7);font-size:11px;font-weight:500">{{ calYearNum() }}</div>
              </div>
              <button
                (click)="nextMonth(); $event.stopPropagation()"
                style="background:rgba(255,255,255,.2);border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:20px;font-weight:700;display:grid;place-items:center;transition:background .15s"
              >
                ›
              </button>
            </div>

            <!-- Stats -->
            <div
              style="display:flex;align-items:center;justify-content:center;padding:10px 14px;border-bottom:1px solid var(--pz-line);background:linear-gradient(135deg,#eef2ff,#f5f3ff)"
            >
              <div style="display:flex;flex-direction:column;align-items:center;flex:1">
                <span style="font-size:20px;font-weight:800;color:#4f46e5;line-height:1">{{ calMonthLeaves().length }}</span>
                <span style="font-size:10px;color:var(--pz-muted);margin-top:2px">absences</span>
              </div>
              <div style="width:1px;height:32px;background:var(--pz-line)"></div>
              <div style="display:flex;flex-direction:column;align-items:center;flex:1">
                <span style="font-size:20px;font-weight:800;color:#f59e0b;line-height:1">{{ pendingCount() }}</span>
                <span style="font-size:10px;color:var(--pz-muted);margin-top:2px">en attente</span>
              </div>
            </div>

            <!-- Jours semaine -->
            <div class="mc-dows">
              @for (h of ['L', 'M', 'M', 'J', 'V', 'S', 'D']; track $index) {
                <span>{{ h }}</span>
              }
            </div>

            <!-- Grille — clic sur un jour ouvre la saisie d'absence -->
            <div class="mc-grid">
              @for (day of calDays(); track day.dateStr) {
                <div
                  class="mc-cell"
                  [class.mc-other]="!day.isCurrentMonth"
                  [class.mc-today]="day.isToday"
                  [class.mc-weekend]="day.isWeekend"
                  [class.mc-has-leave]="day.leaves.length > 0"
                  [title]="'Saisir une absence le ' + day.dateStr"
                  (click)="openCalLeave(day.dateStr)"
                >
                  <span class="mc-num">{{ day.day }}</span>
                  @if (day.leaves.length > 0) {
                    <div class="mc-dots">
                      @for (lv of day.leaves.slice(0, 3); track lv.empId) {
                        <span class="mc-dot" [style.background]="lv.color"></span>
                      }
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Légende -->
            <div class="mc-legend">
              <span class="mc-ldot" style="background:#059669"></span><span class="mc-ltxt">Congé payé</span>
              <span class="mc-ldot" style="background:#d97706"></span><span class="mc-ltxt">Maladie</span>
              <span class="mc-ldot" style="background:#6366f1"></span><span class="mc-ltxt">Autre</span>
            </div>

            <!-- Absences du mois -->
            <div class="mc-section-title">Absences ce mois</div>
            <div class="mc-list">
              @if (calMonthLeaves().length === 0) {
                <div class="mc-empty">✓ Aucune absence</div>
              }
              @for (lv of calMonthLeaves().slice(0, 5); track lv.id) {
                <div class="mc-row">
                  <div class="pz-avatar xs" [attr.data-bg]="data.empBgIdx($any(lv.emp?.id))">
                    {{ data.initials($any(lv.emp)) }}
                  </div>
                  <div class="mc-row-info">
                    <div class="mc-row-name">{{ data.fullName($any(lv.emp)) }}</div>
                    <div class="mc-row-dates">{{ lv.from }} → {{ lv.to }}</div>
                  </div>
                  <span class="mc-row-dot" [style.background]="leaveColorOf(lv.type)"></span>
                </div>
              }
              @if (calMonthLeaves().length > 5) {
                <div class="mc-more">+{{ calMonthLeaves().length - 5 }} autres</div>
              }
            </div>
          </aside>

          <!-- ── Modal saisie absence NON JUSTIFIÉE ─────────────── -->
          @if (showCalLeaveModal()) {
            <div class="pz-overlay" (click)="closeCalLeave()">
              <div class="pz-modal pz-modal-sm" (click)="$event.stopPropagation()" style="width:420px">
                <div class="pz-modal-head">
                  <div style="display:flex;align-items:center;gap:10px">
                    <span style="font-size:20px">🚫</span>
                    <div>
                      <div style="font-size:14px;font-weight:700">Absence non justifiée</div>
                      <div style="font-size:11px;color:var(--pz-muted)">{{ calLeaveForm.startDate }}</div>
                    </div>
                  </div>
                  <button class="pz-modal-close" (click)="closeCalLeave()"><pz-icon name="X" [size]="16" /></button>
                </div>
                <div class="pz-modal-body">
                  <div class="pz-field">
                    <label>Employé *</label>
                    <select [(ngModel)]="calLeaveForm.employeeId">
                      <option [value]="0">— Sélectionner —</option>
                      @for (e of data.employees(); track e.id) {
                        <option [value]="e.id">{{ data.fullName(e) }}</option>
                      }
                    </select>
                  </div>
                  <div class="pz-field">
                    <label>Jusqu'au</label>
                    <input
                      type="date"
                      [(ngModel)]="calLeaveForm.endDate"
                      [min]="calLeaveForm.startDate"
                      style="color-scheme:light"
                      (change)="calRecalcDays()"
                    />
                  </div>
                  <div class="pz-field">
                    <label>Motif / Remarque</label>
                    <input type="text" [(ngModel)]="calLeaveForm.comment" placeholder="ex: absence sans notification préalable" />
                  </div>
                  @if (calLeaveErr()) {
                    <div class="pz-err">{{ calLeaveErr() }}</div>
                  }
                  <div style="font-size:11.5px;color:var(--pz-muted);background:var(--pz-surface-3);border-radius:8px;padding:8px 12px">
                    ⚠️ L'absence sera automatiquement enregistrée comme approuvée et déduira du salaire du mois concerné.
                  </div>
                </div>
                <div class="pz-modal-foot">
                  <button class="pz-btn" (click)="closeCalLeave()">Annuler</button>
                  <button class="pz-btn pz-danger" [disabled]="calLeaveBusy()" (click)="submitCalLeave()">
                    @if (calLeaveBusy()) {
                      …
                    } @else {
                      Enregistrer l'absence
                    }
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
        <!-- /leaves-layout -->
      }

      <!-- ── TAB: Types de congé ──────────────────────────────────────────── -->
      @if (activeTab() === 'types') {
        @if (typesLoading()) {
          <div class="pz-card" style="padding:40px;text-align:center;color:var(--pz-muted)">Chargement…</div>
        } @else if (leaveTypeList().length === 0) {
          <div class="pz-card" style="padding:60px;text-align:center">
            <pz-icon name="Calendar" [size]="36" [strokeWidth]="1.2" style="color:var(--pz-muted)" />
            <div style="font-size:15px;font-weight:600;margin-top:14px">Aucun type de congé</div>
            <div style="font-size:13px;color:var(--pz-muted);margin-top:4px">Créez les types de congé de votre entreprise</div>
            <button class="pz-btn pz-primary" style="margin-top:16px" (click)="openCreateType()">
              <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Créer le premier type
            </button>
          </div>
        } @else {
          <div class="pz-card">
            <table class="pz-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Libellé</th>
                  <th>Max jours/an</th>
                  <th>Payé</th>
                  <th>Approbation</th>
                  <th>Statut</th>
                  <th style="width:100px"></th>
                </tr>
              </thead>
              <tbody>
                @for (t of leaveTypeList(); track t.id) {
                  <tr [style.opacity]="t.active ? 1 : 0.55">
                    <td>
                      <span class="pz-mono" style="font-size:12px;color:var(--pz-muted)">{{ t.code || '—' }}</span>
                    </td>
                    <td style="font-weight:500;font-size:13px">{{ t.label }}</td>
                    <td>
                      <strong class="pz-mono">{{ t.maxDaysPerYear }}</strong> j
                    </td>
                    <td>
                      <span class="pz-pill" [class.pos]="t.paid" [class.warn]="!t.paid">
                        {{ t.paid ? 'Payé' : 'Non payé' }}
                      </span>
                    </td>
                    <td>
                      <span class="pz-pill" [class.pos]="t.requiresApproval" [class.info]="!t.requiresApproval">
                        {{ t.requiresApproval ? 'Oui' : 'Non' }}
                      </span>
                    </td>
                    <td>
                      <span class="pz-pill" [class.pos]="t.active" [class.warn]="!t.active">
                        {{ t.active ? 'Actif' : 'Inactif' }}
                      </span>
                    </td>
                    <td>
                      <div style="display:flex;gap:5px">
                        <button class="pz-btn pz-sm" (click)="openEditType(t)" title="Modifier">
                          <pz-icon name="Edit" [size]="13" />
                        </button>
                        <button class="pz-btn pz-sm" style="color:var(--pz-danger-ink)" (click)="deleteType(t.id)" title="Supprimer">
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
      }
    </div>

    <!-- Modal Nouveau / Modifier type de congé -->
    @if (showTypeModal()) {
      <div class="pz-overlay" (click)="closeTypeModal()">
        <div class="pz-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>{{ editTypeId() ? 'Modifier le type de congé' : 'Nouveau type de congé' }}</span>
            <button class="pz-modal-close" (click)="closeTypeModal()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="pz-field-row">
              <div class="pz-field">
                <label>Code technique</label>
                <input class="pz-mono" [(ngModel)]="typeForm.code" placeholder="ex: CONGE_ANNUEL" [disabled]="!!editTypeId()" />
              </div>
              <div class="pz-field">
                <label>Libellé *</label>
                <input [(ngModel)]="typeForm.label" placeholder="ex: Congé annuel payé" />
              </div>
            </div>
            <div class="pz-field">
              <label>Nombre de jours maximum par an *</label>
              <input type="number" [(ngModel)]="typeForm.maxDaysPerYear" min="1" max="365" />
            </div>
            <div class="pz-field">
              <label>Description</label>
              <textarea [(ngModel)]="typeForm.description" rows="2" placeholder="Description optionnelle…"></textarea>
            </div>
            <div style="display:flex;gap:18px;flex-wrap:wrap">
              <div class="pz-field" style="flex-direction:row;align-items:center;gap:8px">
                <input type="checkbox" [(ngModel)]="typeForm.paid" id="chk-paid" style="width:auto" />
                <label for="chk-paid" style="font-size:13px;color:var(--pz-ink)">Congé payé</label>
              </div>
              <div class="pz-field" style="flex-direction:row;align-items:center;gap:8px">
                <input type="checkbox" [(ngModel)]="typeForm.requiresApproval" id="chk-approbation" style="width:auto" />
                <label for="chk-approbation" style="font-size:13px;color:var(--pz-ink)">Approbation requise</label>
              </div>
              <div class="pz-field" style="flex-direction:row;align-items:center;gap:8px">
                <input type="checkbox" [(ngModel)]="typeForm.active" id="chk-type-active" style="width:auto" />
                <label for="chk-type-active" style="font-size:13px;color:var(--pz-ink)">Actif</label>
              </div>
            </div>
            @if (typeErrMsg()) {
              <div class="pz-err">{{ typeErrMsg() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeTypeModal()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="busy()" (click)="submitTypeForm()">
              @if (busy()) {
                Enregistrement…
              } @else {
                <pz-icon name="Check" [size]="14" /> {{ editTypeId() ? 'Enregistrer' : 'Créer' }}
              }
            </button>
          </div>
        </div>
      </div>
    }

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
              <label>Employé</label>
              <select [(ngModel)]="form.employeeId">
                <option [value]="0">— Sélectionner —</option>
                @for (e of data.employees(); track e.id) {
                  <option [value]="e.id">{{ data.fullName(e) }} ({{ e.matricule }})</option>
                }
              </select>
            </div>
            <div class="pz-field">
              <label>Type de congé</label>
              <select [(ngModel)]="form.leaveTypeId">
                <option [value]="0">— Sélectionner —</option>
                @for (lt of leaveTypes(); track lt.id) {
                  <option [value]="lt.id">{{ lt.name }}</option>
                }
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
            @if (form.startDate && form.startDate < today) {
              <div class="pz-warn-past">
                <pz-icon name="AlertTriangle" [size]="14" />
                Date de début dans le passé — la demande sera automatiquement refusée.
              </div>
            }
            <div class="pz-field">
              <label>Commentaire (optionnel)</label>
              <textarea [(ngModel)]="form.comment" rows="2" placeholder="Motif…"></textarea>
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
              <label>Commentaire</label>
              <textarea [(ngModel)]="rejectComment" rows="3" placeholder="Expliquez le motif du refus…"></textarea>
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
      .pz-tabs {
        display: flex;
        gap: 4px;
        border-bottom: 1px solid var(--pz-line);
        padding: 0 4px;
        margin-bottom: 0;
      }
      .pz-tab {
        height: 38px;
        padding: 0 14px;
        border: none;
        background: transparent;
        font: inherit;
        font-size: 13px;
        color: var(--pz-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
      }
      .pz-tab:hover {
        color: var(--pz-ink);
      }
      .pz-tab.active {
        color: var(--pz-primary);
        border-bottom-color: var(--pz-primary);
        font-weight: 600;
      }
      .pz-tab .cnt {
        background: var(--pz-surface-3);
        color: var(--pz-muted);
        font-size: 10.5px;
        font-weight: 600;
        padding: 1px 6px;
        border-radius: 999px;
      }
      .pz-tab.active .cnt {
        background: var(--pz-primary-soft);
        color: var(--pz-primary);
      }
      .filters {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .pz-topbar-search {
        height: 36px;
        background: var(--pz-surface);
        border: 1px solid var(--pz-line);
        border-radius: 8px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--pz-muted);
      }
      .pz-topbar-search input {
        border: 0;
        outline: 0;
        background: transparent;
        flex: 1;
        min-width: 0;
        color: var(--pz-ink);
        font: inherit;
      }
      .filter-tabs {
        display: flex;
        gap: 4px;
      }
      .filter-tab {
        height: 34px;
        padding: 0 14px;
        border-radius: 8px;
        border: 1px solid transparent;
        background: transparent;
        font: inherit;
        font-size: 13px;
        color: var(--pz-ink-3);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .filter-tab:hover {
        background: var(--pz-surface-3);
      }
      .filter-tab.active {
        background: var(--pz-primary-soft);
        color: var(--pz-primary-ink);
        border-color: var(--pz-primary-soft);
      }
      .cnt {
        background: var(--pz-warn);
        color: #fff;
        font-size: 10.5px;
        font-weight: 600;
        padding: 1px 5px;
        border-radius: 999px;
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
        background: var(--pz-danger-soft, #fee2e2);
        color: var(--pz-danger-ink, #b91c1c);
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
      .pz-pill.info {
        background: #eff6ff;
        color: #1d4ed8;
      }
      .pz-warn-past {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 12.5px;
        color: #92400e;
        background: #fef3c7;
        border-radius: 8px;
        padding: 8px 12px;
        margin-bottom: 4px;
      }

      /* ── Layout demandes + mini-cal ──────────────────────────── */
      .leaves-layout {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 18px;
        align-items: start;
      }
      .leaves-table-col {
        min-width: 0;
      }

      /* ── Mini-Calendrier ──────────────────────────────────────── */
      .mini-cal {
        border-radius: 18px;
        overflow: hidden;
        box-shadow:
          0 8px 32px rgba(79, 70, 229, 0.13),
          0 2px 8px rgba(0, 0, 0, 0.07);
        background: var(--pz-surface);
        border: 1px solid var(--pz-line);
        animation: mcFadeIn 0.3s ease-out;
        position: sticky;
        top: 16px;
      }
      @keyframes mcFadeIn {
        from {
          opacity: 0;
          transform: translateX(12px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      /* Header gradient */
      .mc-hd {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        padding: 16px 14px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .mc-nav {
        background: rgba(255, 255, 255, 0.18);
        border: none;
        color: #fff;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        display: grid;
        place-items: center;
        transition:
          background 0.15s,
          transform 0.1s;
      }
      .mc-nav:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }
      .mc-hd-center {
        text-align: center;
      }
      .mc-hd-month {
        color: #fff;
        font-size: 14px;
        font-weight: 800;
        text-transform: capitalize;
        letter-spacing: 0.01em;
      }
      .mc-hd-year {
        color: rgba(255, 255, 255, 0.7);
        font-size: 11px;
        font-weight: 500;
      }

      /* Stats */
      .mc-stats {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        padding: 10px 14px;
        border-bottom: 1px solid var(--pz-line);
        background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%);
      }
      .mc-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
      }
      .mc-stat-n {
        font-size: 18px;
        font-weight: 800;
        color: #4f46e5;
        line-height: 1;
      }
      .mc-stat-l {
        font-size: 10px;
        color: var(--pz-muted);
        margin-top: 2px;
      }
      .mc-stat-sep {
        width: 1px;
        height: 32px;
        background: var(--pz-line);
      }

      /* Jours semaine */
      .mc-dows {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        padding: 8px 8px 2px;
      }
      .mc-dows span {
        text-align: center;
        font-size: 9.5px;
        font-weight: 700;
        color: var(--pz-muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      /* Grille */
      .mc-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        padding: 0 8px 8px;
        gap: 1px;
      }
      .mc-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 3px 1px;
        border-radius: 7px;
        cursor: default;
        transition: background 0.12s;
        min-height: 36px;
      }
      .mc-cell:hover {
        background: var(--pz-surface-3);
      }
      .mc-num {
        font-size: 11px;
        font-weight: 600;
        color: var(--pz-ink);
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.15s;
      }
      .mc-other .mc-num {
        color: var(--pz-muted);
        opacity: 0.35;
      }
      .mc-weekend .mc-num {
        color: #7c3aed;
      }
      .mc-today .mc-num {
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        color: #fff;
        box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4);
      }
      .mc-has-leave {
        background: rgba(79, 70, 229, 0.04);
        border-radius: 7px;
      }
      .mc-dots {
        display: flex;
        gap: 2px;
        justify-content: center;
        margin-top: 1px;
      }
      .mc-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        transition: transform 0.15s;
      }
      .mc-cell:hover .mc-dot {
        transform: scale(1.3);
      }

      /* Légende */
      .mc-legend {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 6px 10px;
        border-top: 1px solid var(--pz-line);
        border-bottom: 1px solid var(--pz-line);
        background: var(--pz-surface-3);
      }
      .mc-ldot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        display: inline-block;
        flex-shrink: 0;
      }
      .mc-ltxt {
        font-size: 9.5px;
        color: var(--pz-muted);
        margin-left: 3px;
      }

      /* Section absences */
      .mc-section-title {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--pz-muted);
        padding: 10px 12px 4px;
      }
      .mc-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 0 10px 12px;
      }
      .mc-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        border-radius: 9px;
        background: var(--pz-surface-3);
        border: 1px solid var(--pz-line);
        transition:
          transform 0.12s,
          box-shadow 0.12s;
      }
      .mc-row:hover {
        transform: translateX(2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }
      .mc-row-info {
        flex: 1;
        min-width: 0;
      }
      .mc-row-name {
        font-size: 11px;
        font-weight: 600;
        color: var(--pz-ink);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .mc-row-dates {
        font-size: 9.5px;
        color: var(--pz-muted);
      }
      .mc-row-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .mc-empty {
        font-size: 11.5px;
        color: var(--pz-muted);
        text-align: center;
        padding: 12px 8px;
      }
      .mc-more {
        font-size: 11px;
        color: var(--pz-primary);
        text-align: center;
        padding: 4px;
        font-weight: 600;
      }
    `,
  ],
})
export default class RhLeavesComponent {
  protected readonly data = inject(DataService);
  protected readonly api = inject(ApiService);
  protected readonly q = signal('');
  protected readonly activeTab = signal<Tab>('demandes');
  protected readonly statusFilter = signal<string>('all');
  protected readonly busy = signal(false);
  protected readonly errMsg = signal('');
  protected readonly showCreate = signal(false);
  protected readonly rejectId = signal<string | null>(null);
  protected rejectComment = '';

  protected leaveTypes = signal<{ id: number; name: string }[]>([]);
  protected readonly today = new Date().toISOString().slice(0, 10);
  protected form = { leaveTypeId: 0, employeeId: 0, startDate: '', endDate: '', comment: '' };

  // Leave type management
  protected readonly leaveTypeList = signal<LeaveType[]>([]);
  protected readonly typesLoading = signal(false);
  protected readonly showTypeModal = signal(false);
  protected readonly editTypeId = signal<number | null>(null);
  protected readonly typeErrMsg = signal('');
  protected typeForm = { code: '', label: '', maxDaysPerYear: 30, paid: true, requiresApproval: true, active: true, description: '' };

  // ── Calendrier d'équipe ──────────────────────────────────────────────────
  protected readonly calViewDate = signal(new Date());
  protected readonly calDowHeaders = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  protected readonly calMonthLabel = computed(() => {
    const d = this.calViewDate();
    return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  });
  protected readonly calMonthName = computed(() => this.calViewDate().toLocaleDateString('fr-FR', { month: 'long' }));
  protected readonly calYearNum = computed(() => this.calViewDate().getFullYear());

  private readonly calApproved = computed(() => this.data.leaves().filter(l => l.status === 'approved'));

  protected readonly calDays = computed(() => {
    const d = this.calViewDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const dow0 = firstDay.getDay(); // 0=Sun
    const startOffset = dow0 === 0 ? 6 : dow0 - 1;
    const start = new Date(firstDay);
    start.setDate(start.getDate() - startOffset);

    const todayStr = new Date().toISOString().slice(0, 10);
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = date.toISOString().slice(0, 10);
      const leaves = this.calApproved()
        .filter(l => this.toIso(l.from) <= dateStr && this.toIso(l.to) >= dateStr)
        .map(l => {
          const emp = this.data.empById(l.empId);
          return emp ? { empId: l.empId, emp, type: l.type, color: this.leaveColorOf(l.type) } : null;
        })
        .filter((x): x is { empId: any; emp: any; type: string; color: string } => x !== null);
      days.push({
        dateStr,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: dateStr === todayStr,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        leaves,
      });
    }
    return days;
  });

  protected readonly calMonthLeaves = computed(() => {
    const d = this.calViewDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const mStart = new Date(year, month, 1).toISOString().slice(0, 10);
    const mEnd = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    return this.calApproved()
      .filter(l => this.toIso(l.from) <= mEnd && this.toIso(l.to) >= mStart)
      .map(l => ({ ...l, emp: this.data.empById(l.empId) }))
      .filter((l): l is typeof l & { emp: NonNullable<typeof l.emp> } => l.emp !== undefined);
  });

  leaveColorOf(type: string): string {
    const t = (type ?? '').toLowerCase();
    if (t.includes('maladie') || t.includes('sick')) return '#d97706';
    if (t.includes('pay') || t.includes('annuel') || t.includes('conge') || t.includes('congé')) return '#059669';
    return '#6366f1';
  }

  private toIso(s: string): string {
    if (!s) return '';
    if (s.includes('/')) {
      const [d, m, y] = s.split('/');
      return `${y}-${m}-${d}`;
    }
    return s.slice(0, 10);
  }

  prevMonth() {
    const d = new Date(this.calViewDate());
    d.setMonth(d.getMonth() - 1);
    this.calViewDate.set(d);
  }
  nextMonth() {
    const d = new Date(this.calViewDate());
    d.setMonth(d.getMonth() + 1);
    this.calViewDate.set(d);
  }

  // ── Modal saisie absence depuis calendrier ────────────────────────────
  protected readonly showCalLeaveModal = signal(false);
  protected readonly calLeaveBusy = signal(false);
  protected readonly calLeaveErr = signal('');
  protected calLeaveForm = { employeeId: 0, startDate: '', endDate: '', days: 1, comment: '' };

  openCalLeave(dateStr: string): void {
    this.calLeaveForm = { employeeId: 0, startDate: dateStr, endDate: dateStr, days: 1, comment: '' };
    this.calLeaveErr.set('');
    if (!this.leaveTypes().length) {
      this.api.leaveTypes().subscribe({ next: lt => this.leaveTypes.set(lt), error: () => {} });
    }
    this.showCalLeaveModal.set(true);
  }

  closeCalLeave(): void {
    this.showCalLeaveModal.set(false);
  }

  calRecalcDays(): void {
    const s = new Date(this.calLeaveForm.startDate);
    const e = new Date(this.calLeaveForm.endDate);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e >= s) {
      let days = 0;
      const cur = new Date(s);
      while (cur <= e) {
        const dow = cur.getDay();
        if (dow !== 0 && dow !== 6) days++;
        cur.setDate(cur.getDate() + 1);
      }
      this.calLeaveForm.days = Math.max(1, days);
    }
  }

  submitCalLeave(): void {
    const f = this.calLeaveForm;
    if (!f.employeeId) {
      this.calLeaveErr.set('Veuillez sélectionner un employé.');
      return;
    }

    this.calLeaveBusy.set(true);
    this.calLeaveErr.set('');
    this.api
      .createLeaveRequest({
        leaveTypeId: 0,
        employeeId: f.employeeId,
        startDate: f.startDate,
        endDate: f.endDate || f.startDate,
        numberOfDays: f.days,
        comment: f.comment || 'Absence non justifiée',
        status: 'APPROVED',
      })
      .subscribe({
        next: leave => {
          this.data.leaves.update(list => [leave, ...list]);
          this.calLeaveBusy.set(false);
          this.showCalLeaveModal.set(false);
        },
        error: () => {
          this.calLeaveErr.set("Erreur lors de l'enregistrement.");
          this.calLeaveBusy.set(false);
        },
      });
  }

  // ── Filtres demandes ──────────────────────────────────────────────────────
  protected readonly filtered = computed(() => {
    const q = this.q().toLowerCase();
    const sf = this.statusFilter();
    return this.data.leaves().filter(l => {
      const e = this.data.empById(l.empId);
      if (q && !this.data.fullName(e!).toLowerCase().includes(q)) return false;
      if (sf !== 'all' && l.status !== sf) return false;
      return true;
    });
  });

  protected pendingCount = computed(() => this.data.leaves().filter(l => l.status === 'pending').length);

  protected readonly statuses = [
    { key: 'all', label: 'Tous', count: computed(() => this.data.leaves().length) },
    { key: 'pending', label: 'En attente', count: this.pendingCount },
    { key: 'approved', label: 'Approuvés', count: computed(() => this.data.leaves().filter(l => l.status === 'approved').length) },
    { key: 'rejected', label: 'Refusés', count: computed(() => this.data.leaves().filter(l => l.status === 'rejected').length) },
  ];

  openCreate() {
    this.form = { leaveTypeId: 0, employeeId: 0, startDate: '', endDate: '', comment: '' };
    this.errMsg.set('');
    if (!this.leaveTypes().length) {
      this.api.leaveTypes().subscribe({ next: lt => this.leaveTypes.set(lt), error: () => {} });
    }
    this.showCreate.set(true);
  }
  closeCreate() {
    this.showCreate.set(false);
  }

  submitCreate() {
    if (!this.form.leaveTypeId || !this.form.employeeId || !this.form.startDate || !this.form.endDate) {
      this.errMsg.set('Veuillez sélectionner un employé, un type de congé et les dates.');
      return;
    }
    this.busy.set(true);
    this.errMsg.set('');
    this.api
      .createLeaveRequest({
        leaveTypeId: this.form.leaveTypeId,
        employeeId: this.form.employeeId,
        startDate: this.form.startDate,
        endDate: this.form.endDate,
        comment: this.form.comment || undefined,
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

  approve(id: string) {
    this.busy.set(true);
    this.api.approveLeave(+id).subscribe({
      next: updated => {
        this.data.leaves.update(list => list.map(l => (l.id === id ? updated : l)));
        this.busy.set(false);
      },
      error: () => this.busy.set(false),
    });
  }

  openReject(id: string) {
    this.rejectComment = '';
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
    this.api.rejectLeave(+id, this.rejectComment).subscribe({
      next: updated => {
        this.data.leaves.update(list => list.map(l => (l.id === id ? updated : l)));
        this.busy.set(false);
        this.rejectId.set(null);
      },
      error: () => {
        this.errMsg.set('Erreur lors du refus.');
        this.busy.set(false);
      },
    });
  }

  // ── Leave type management ─────────────────────────────────────────────────

  setTypesTab(): void {
    this.activeTab.set('types');
    if (!this.leaveTypeList().length) this.loadLeaveTypes();
  }

  private loadLeaveTypes(): void {
    this.typesLoading.set(true);
    this.api.leaveTypesFull().subscribe({
      next: list => {
        this.leaveTypeList.set(list);
        this.typesLoading.set(false);
      },
      error: () => this.typesLoading.set(false),
    });
  }

  openCreateType(): void {
    this.editTypeId.set(null);
    this.typeForm = { code: '', label: '', maxDaysPerYear: 30, paid: true, requiresApproval: true, active: true, description: '' };
    this.typeErrMsg.set('');
    this.showTypeModal.set(true);
  }

  openEditType(t: LeaveType): void {
    this.editTypeId.set(t.id);
    this.typeForm = {
      code: t.code,
      label: t.label,
      maxDaysPerYear: t.maxDaysPerYear,
      paid: t.paid,
      requiresApproval: t.requiresApproval,
      active: t.active,
      description: t.description,
    };
    this.typeErrMsg.set('');
    this.showTypeModal.set(true);
  }

  closeTypeModal(): void {
    this.showTypeModal.set(false);
    this.editTypeId.set(null);
  }

  submitTypeForm(): void {
    if (!this.typeForm.label.trim()) {
      this.typeErrMsg.set('Le libellé est obligatoire.');
      return;
    }
    if (!this.typeForm.maxDaysPerYear || this.typeForm.maxDaysPerYear < 1) {
      this.typeErrMsg.set('Le nombre de jours doit être ≥ 1.');
      return;
    }
    this.busy.set(true);
    this.typeErrMsg.set('');
    const dto = { ...this.typeForm, label: this.typeForm.label.trim(), code: this.typeForm.code.trim() };
    const editId = this.editTypeId();
    const call = editId ? this.api.updateLeaveType(editId, dto) : this.api.createLeaveType(dto);
    call.subscribe({
      next: t => {
        if (editId) {
          this.leaveTypeList.update(list => list.map(x => (x.id === editId ? t : x)));
        } else {
          this.leaveTypeList.update(list => [...list, t]);
          this.leaveTypes.update(list => [...list, { id: t.id, name: t.label }]);
        }
        this.busy.set(false);
        this.closeTypeModal();
      },
      error: (err: any) => {
        this.typeErrMsg.set(err?.error?.detail ?? 'Erreur lors de la sauvegarde.');
        this.busy.set(false);
      },
    });
  }

  deleteType(id: number): void {
    this.api.deleteLeaveType(id).subscribe({
      next: () => this.leaveTypeList.update(list => list.filter(t => t.id !== id)),
      error: () => {},
    });
  }
}
