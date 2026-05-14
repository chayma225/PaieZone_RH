import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { Employee } from '../../core/types';

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
          <button class="pz-btn pz-primary" (click)="openCreate()">
            <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Nouveau département
          </button>
        </div>
      </div>

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
      .pz-field label {
        font-size: 12px;
        font-weight: 500;
        color: var(--pz-muted);
      }
      .pz-field input {
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
      .pz-field input:focus {
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
  protected readonly showCreate = signal(false);
  protected form = { code: '', name: '' };

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
    this.form = { code: '', name: '' };
    this.errMsg.set('');
    this.showCreate.set(true);
  }

  closeCreate() {
    this.showCreate.set(false);
  }

  submitCreate() {
    if (!this.form.code.trim() || !this.form.name.trim()) {
      this.errMsg.set('Le code et le nom sont obligatoires.');
      return;
    }
    const companyId = this.data.companies()[0]?.id;
    if (!companyId) {
      this.errMsg.set('Aucune société trouvée.');
      return;
    }
    this.busy.set(true);
    this.errMsg.set('');
    this.api.createDepartment(this.form.code.trim().toUpperCase(), this.form.name.trim(), companyId).subscribe({
      next: dept => {
        this.data.departments.update(list => [...list, dept]);
        this.busy.set(false);
        this.closeCreate();
      },
      error: () => {
        this.errMsg.set('Erreur lors de la création.');
        this.busy.set(false);
      },
    });
  }
}
