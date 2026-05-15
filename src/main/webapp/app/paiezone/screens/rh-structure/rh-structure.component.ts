import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { Employee, JobPosition } from '../../core/types';

@Component({
  selector: 'pz-rh-structure',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>RH</strong> <span class="sep">/</span> Structure</div>
          <h1>Structure organisationnelle</h1>
          <div class="pz-muted">{{ data.departments().length }} département(s) · {{ data.employees().length }} collaborateurs</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="pz-btn" (click)="openCreatePos()"><pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Nouveau poste</button>
          <button class="pz-btn pz-primary" (click)="openCreate()">
            <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Nouveau département
          </button>
        </div>
      </div>

      <!-- Départements -->
      <div class="section-label">Départements</div>
      <div class="dept-grid">
        @if (data.departments().length === 0) {
          @for (dept of empByDept(); track dept.name) {
            <div class="pz-card dept-card">
              <div class="dept-head">
                <div class="dept-icon"><pz-icon name="Briefcase" /></div>
                <div>
                  <div class="dept-name">{{ dept.name }}</div>
                  <div class="dept-count pz-muted">{{ dept.emps.length }} collaborateur(s)</div>
                </div>
              </div>
              <div class="dept-emps">
                @for (e of dept.emps.slice(0, 4); track e.id) {
                  <div class="dept-emp">
                    <div class="pz-avatar sm" [attr.data-bg]="data.empBgIdx(e.id)">{{ data.initials(e) }}</div>
                    <div>
                      <div style="font-size:12.5px;font-weight:500">{{ data.fullName(e) }}</div>
                      <div style="font-size:11.5px;color:var(--pz-muted)">{{ e.role }}</div>
                    </div>
                  </div>
                }
                @if (dept.emps.length > 4) {
                  <div style="font-size:12px;color:var(--pz-muted);padding:6px 0">+ {{ dept.emps.length - 4 }} autre(s)</div>
                }
              </div>
            </div>
          }
        } @else {
          @for (d of data.departments(); track d.id) {
            <div class="pz-card dept-card">
              <div class="dept-head">
                <div class="dept-icon"><pz-icon name="Briefcase" /></div>
                <div>
                  <div class="dept-name">{{ d.name }}</div>
                  <div class="dept-count pz-muted">{{ empByDeptId(d.id).length }} collaborateur(s)</div>
                </div>
              </div>
              <div class="dept-emps">
                @for (e of empByDeptId(d.id).slice(0, 4); track e.id) {
                  <div class="dept-emp">
                    <div class="pz-avatar sm" [attr.data-bg]="data.empBgIdx(e.id)">{{ data.initials(e) }}</div>
                    <div>
                      <div style="font-size:12.5px;font-weight:500">{{ data.fullName(e) }}</div>
                      <div style="font-size:11.5px;color:var(--pz-muted)">{{ e.role }}</div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>

      <!-- Postes -->
      <div class="section-label" style="margin-top:28px">Postes / Fonctions</div>
      <div class="pz-card">
        <table class="pz-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Intitulé</th>
              <th>Grille salariale</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @if (posLoading()) {
              <tr>
                <td colspan="5" style="text-align:center;padding:32px;color:var(--pz-muted)">Chargement…</td>
              </tr>
            } @else if (positions().length === 0) {
              <tr>
                <td colspan="5" style="text-align:center;padding:32px;color:var(--pz-muted)">Aucun poste défini</td>
              </tr>
            } @else {
              @for (p of positions(); track p.id) {
                <tr>
                  <td>
                    <span class="pz-tag">{{ p.code }}</span>
                  </td>
                  <td>
                    <strong>{{ p.title }}</strong>
                    @if (p.description) {
                      <div style="font-size:11.5px;color:var(--pz-muted)">{{ p.description }}</div>
                    }
                  </td>
                  <td class="pz-mono" style="font-size:12px">
                    @if (p.minSalary !== null || p.maxSalary !== null) {
                      {{ p.minSalary != null ? data.fmtTND(p.minSalary) : '?' }} –
                      {{ p.maxSalary != null ? data.fmtTND(p.maxSalary) : '?' }}
                    } @else {
                      —
                    }
                  </td>
                  <td>
                    <span class="pz-pill" [class]="p.active ? 'pos' : 'neg'">{{ p.active ? 'Actif' : 'Inactif' }}</span>
                  </td>
                  <td>
                    <button class="pz-btn pz-sm pz-danger" (click)="deletePos(p.id)">
                      <pz-icon name="Trash2" [size]="13" />
                    </button>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Nouveau département -->
    @if (showCreate()) {
      <div class="pz-overlay" (click)="closeCreate()">
        <div class="pz-modal pz-modal-sm" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Nouveau département</span>
            <button class="pz-modal-close" (click)="closeCreate()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="pz-field">
              <label>Code</label>
              <input type="text" [(ngModel)]="form.code" placeholder="ex: IT, RH, FIN" maxlength="20" />
            </div>
            <div class="pz-field">
              <label>Nom du département</label>
              <input type="text" [(ngModel)]="form.name" placeholder="ex: Informatique" maxlength="100" />
            </div>
            <div class="pz-field">
              <label>Info / Description</label>
              <input type="text" [(ngModel)]="form.description" placeholder="Description optionnelle" maxlength="255" />
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

    <!-- Modal Nouveau poste -->
    @if (showCreatePos()) {
      <div class="pz-overlay" (click)="closeCreatePos()">
        <div class="pz-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Nouveau poste / Fonction</span>
            <button class="pz-modal-close" (click)="closeCreatePos()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="pz-field-row">
              <div class="pz-field" style="flex:0 0 120px">
                <label>Code *</label>
                <input type="text" [(ngModel)]="posForm.code" placeholder="ex: DEV, DIR" maxlength="20" style="text-transform:uppercase" />
              </div>
              <div class="pz-field">
                <label>Intitulé *</label>
                <input type="text" [(ngModel)]="posForm.title" placeholder="ex: Développeur Full Stack" maxlength="150" />
              </div>
            </div>
            <div class="pz-field">
              <label>Description</label>
              <input type="text" [(ngModel)]="posForm.description" placeholder="Description optionnelle" maxlength="500" />
            </div>
            <div class="pz-field-row">
              <div class="pz-field">
                <label>Salaire min (TND)</label>
                <input type="number" [(ngModel)]="posForm.minSalary" min="0" step="50" placeholder="ex: 1200" />
              </div>
              <div class="pz-field">
                <label>Salaire max (TND)</label>
                <input type="number" [(ngModel)]="posForm.maxSalary" min="0" step="50" placeholder="ex: 3500" />
              </div>
            </div>
            @if (posErrMsg()) {
              <div class="pz-err">{{ posErrMsg() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeCreatePos()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="busy()" (click)="submitCreatePos()">
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
      .section-label {
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--pz-muted);
        margin-bottom: 10px;
      }
      .dept-grid {
        display: grid;
        gap: var(--pz-gap);
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
      .dept-card {
        padding: 0;
      }
      .dept-head {
        padding: 16px 18px 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        border-bottom: 1px solid var(--pz-line);
      }
      .dept-icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: var(--pz-primary-soft);
        color: var(--pz-primary);
        display: grid;
        place-items: center;
        flex-shrink: 0;
      }
      .dept-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--pz-ink);
      }
      .dept-count {
        font-size: 12px;
        margin-top: 2px;
      }
      .dept-emps {
        padding: 12px 18px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .dept-emp {
        display: flex;
        align-items: center;
        gap: 10px;
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
        padding: 11px 16px;
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
      }
      .pz-modal-sm {
        width: 360px;
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
export default class RhStructureComponent {
  protected readonly data = inject(DataService);
  protected readonly api = inject(ApiService);
  protected readonly busy = signal(false);
  protected readonly errMsg = signal('');
  protected readonly posErrMsg = signal('');
  protected readonly showCreate = signal(false);
  protected readonly showCreatePos = signal(false);
  protected readonly positions = signal<JobPosition[]>([]);
  protected readonly posLoading = signal(false);
  protected form = { code: '', name: '', description: '' };
  protected posForm = { code: '', title: '', description: '', minSalary: null as number | null, maxSalary: null as number | null };

  constructor() {
    this.loadPositions();
  }

  private loadPositions() {
    this.posLoading.set(true);
    this.api.jobPositions().subscribe({
      next: list => {
        this.positions.set(list);
        this.posLoading.set(false);
      },
      error: () => this.posLoading.set(false),
    });
  }

  protected empByDept = computed(() => {
    const result: { name: string; emps: Employee[] }[] = [];
    const seen = new Map<string, number>();
    for (const e of this.data.employees()) {
      const key = e.dept || 'Sans département';
      if (!seen.has(key)) {
        seen.set(key, result.length);
        result.push({ name: key, emps: [] });
      }
      result[seen.get(key)!].emps.push(e);
    }
    return result;
  });

  protected empByDeptId(deptId: number) {
    const dept = this.data.departments().find(d => d.id === deptId);
    if (!dept) return [];
    return this.data.employees().filter(e => e.dept === dept.name);
  }

  openCreate() {
    this.form = { code: '', name: '', description: '' };
    this.errMsg.set('');
    this.showCreate.set(true);
  }
  closeCreate() {
    this.showCreate.set(false);
  }

  openCreatePos() {
    this.posForm = { code: '', title: '', description: '', minSalary: null, maxSalary: null };
    this.posErrMsg.set('');
    this.showCreatePos.set(true);
  }
  closeCreatePos() {
    this.showCreatePos.set(false);
  }

  submitCreate() {
    if (!this.form.code.trim() || !this.form.name.trim()) {
      this.errMsg.set('Le code et le nom sont obligatoires.');
      return;
    }
    this.busy.set(true);
    this.errMsg.set('');
    const doCreate = (companyId: number) => {
      this.api
        .createDepartment(this.form.code.trim().toUpperCase(), this.form.name.trim(), companyId, this.form.description.trim())
        .subscribe({
          next: dept => {
            this.data.departments.update(list => [...list, dept]);
            this.busy.set(false);
            this.closeCreate();
          },
          error: () => {
            this.errMsg.set('Erreur lors de la création. Code déjà utilisé ?');
            this.busy.set(false);
          },
        });
    };
    const cached = this.data.companies()[0];
    if (cached) {
      doCreate(cached.id);
    } else {
      this.api.companies().subscribe({
        next: companies => {
          if (!companies.length) {
            this.errMsg.set('Aucune société trouvée.');
            this.busy.set(false);
            return;
          }
          this.data.companies.set(companies);
          doCreate(companies[0].id);
        },
        error: () => {
          this.errMsg.set('Impossible de charger les sociétés.');
          this.busy.set(false);
        },
      });
    }
  }

  submitCreatePos() {
    const code = this.posForm.code.trim().toUpperCase();
    const title = this.posForm.title.trim();
    if (!code || !title) {
      this.posErrMsg.set("Le code et l'intitulé sont obligatoires.");
      return;
    }
    this.busy.set(true);
    this.posErrMsg.set('');
    this.api
      .createJobPosition({
        code,
        title,
        description: this.posForm.description.trim() || undefined,
        active: true,
      })
      .subscribe({
        next: pos => {
          this.positions.update(list => [...list, pos]);
          this.busy.set(false);
          this.closeCreatePos();
        },
        error: (err: any) => {
          const msg = err?.error?.detail ?? err?.error?.title ?? 'Erreur lors de la création.';
          this.posErrMsg.set(msg);
          this.busy.set(false);
        },
      });
  }

  deletePos(id: number) {
    if (!confirm('Supprimer ce poste ?')) return;
    this.api.deleteJobPosition(id).subscribe({
      next: () => this.positions.update(list => list.filter(p => p.id !== id)),
      error: (err: any) => alert(err?.error?.detail ?? 'Ce poste est utilisé par des employés.'),
    });
  }
}
