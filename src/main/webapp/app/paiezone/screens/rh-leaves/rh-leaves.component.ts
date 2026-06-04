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
              <label>Nombre de jours ouvrables</label>
              <input type="number" [(ngModel)]="form.days" min="1" />
            </div>
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
  protected form = { leaveTypeId: 0, employeeId: 0, startDate: '', endDate: '', days: 1, comment: '' };

  // Leave type management
  protected readonly leaveTypeList = signal<LeaveType[]>([]);
  protected readonly typesLoading = signal(false);
  protected readonly showTypeModal = signal(false);
  protected readonly editTypeId = signal<number | null>(null);
  protected readonly typeErrMsg = signal('');
  protected typeForm = { code: '', label: '', maxDaysPerYear: 30, paid: true, requiresApproval: true, active: true, description: '' };

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
    this.form = { leaveTypeId: 0, employeeId: 0, startDate: '', endDate: '', days: 1, comment: '' };
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
    if (!this.form.leaveTypeId || !this.form.employeeId || !this.form.startDate || !this.form.endDate || this.form.days < 1) {
      this.errMsg.set('Veuillez sélectionner un employé, un type de congé, les dates et le nombre de jours.');
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
        numberOfDays: this.form.days,
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
