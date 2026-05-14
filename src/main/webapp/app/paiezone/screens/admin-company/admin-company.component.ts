import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'pz-admin-company',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>Administration</strong> <span class="sep">/</span> Mon entreprise</div>
          <h1>{{ company()?.name ?? 'Mon entreprise' }}</h1>
          <div class="pz-muted">{{ company()?.city ?? '—' }} · Informations et configuration</div>
        </div>
        <button class="pz-btn pz-primary" (click)="openEdit()"><pz-icon name="Edit" [size]="14" /> Modifier</button>
      </div>

      <div class="grid">
        <div class="pz-card">
          <div class="card-head"><div class="card-title">Informations générales</div></div>
          <div class="card-body">
            <div class="logo-row">
              <div class="logo">{{ initials() }}</div>
              <div>
                <div class="co-name">{{ company()?.name ?? '—' }}</div>
                <div class="pz-muted co-sub">{{ company()?.tradeName ?? '' }}</div>
              </div>
            </div>
            <div class="info-rows">
              <div class="info-row">
                <span class="pz-muted small">Matricule fiscal</span><span class="pz-mono small">{{ company()?.taxId ?? '—' }}</span>
              </div>
              <div class="info-row">
                <span class="pz-muted small">Ville</span><span class="small">{{ company()?.city ?? '—' }}</span>
              </div>
              <div class="info-row">
                <span class="pz-muted small">Effectif</span><span class="small">{{ data.employees().length }} collaborateurs</span>
              </div>
              <div class="info-row">
                <span class="pz-muted small">Schéma DB</span><span class="pz-mono small">{{ company()?.schema ?? '—' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pz-card">
          <div class="card-head"><div class="card-title">Abonnement</div></div>
          <div class="card-body">
            @if (company()) {
              <div class="sub-badge">
                <span class="pz-pill primary">{{ company()!.plan }}</span>
                <span class="pz-pill" [class.pos]="company()!.status === 'ACTIVE'" [class.warn]="company()!.status === 'TRIAL'">{{
                  company()!.status
                }}</span>
              </div>
              <div class="info-rows" style="margin-top:14px">
                <div class="info-row">
                  <span class="pz-muted small">Prix mensuel HT</span><strong class="pz-mono">{{ data.fmtTND(company()!.priceHT) }}</strong>
                </div>
                <div class="info-row">
                  <span class="pz-muted small">Renouvellement</span><span class="small">{{ company()!.renewal }}</span>
                </div>
                <div class="info-row">
                  <span class="pz-muted small">Employés max</span
                  ><span class="small">{{ data.planLimits[company()!.plan]?.maxEmployees ?? '—' }}</span>
                </div>
              </div>
            } @else {
              <div class="pz-muted" style="padding:20px 0;text-align:center">Aucune donnée d'abonnement</div>
            }
          </div>
        </div>

        <div class="pz-card">
          <div class="card-head"><div class="card-title">Données réglementaires applicables</div></div>
          <div class="card-body">
            @for (r of data.regulatoryParams(); track r.id) {
              <div class="info-row">
                <span class="pz-muted small">{{ r.paramLabel }}</span>
                <span
                  ><strong class="pz-mono">{{ r.numericValue ?? r.stringValue }}</strong></span
                >
              </div>
            }
            @if (data.regulatoryParams().length === 0) {
              <div class="pz-muted small" style="padding:12px 0">Aucun paramètre réglementaire chargé</div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Modifier -->
    @if (showEdit()) {
      <div class="pz-overlay" (click)="closeEdit()">
        <div class="pz-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Modifier l'entreprise</span>
            <button class="pz-modal-close" (click)="closeEdit()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="pz-field">
              <label>Raison sociale *</label>
              <input type="text" [(ngModel)]="editForm.name" placeholder="Raison sociale" />
            </div>
            <div class="pz-field">
              <label>Nom commercial</label>
              <input type="text" [(ngModel)]="editForm.tradeName" placeholder="Nom commercial" />
            </div>
            <div class="pz-field-row">
              <div class="pz-field">
                <label>Matricule fiscal *</label>
                <input type="text" [(ngModel)]="editForm.taxId" placeholder="ex: 1234567A/P/M/000" />
              </div>
              <div class="pz-field">
                <label>Ville</label>
                <input type="text" [(ngModel)]="editForm.city" placeholder="ex: Tunis" />
              </div>
            </div>
            <div class="pz-field">
              <label>Adresse</label>
              <input type="text" [(ngModel)]="editForm.address" placeholder="Adresse complète" />
            </div>
            <div class="pz-field-row">
              <div class="pz-field">
                <label>Téléphone</label>
                <input type="text" [(ngModel)]="editForm.phone" placeholder="+216 XX XXX XXX" />
              </div>
              <div class="pz-field">
                <label>Email</label>
                <input type="email" [(ngModel)]="editForm.email" placeholder="contact@entreprise.tn" />
              </div>
            </div>
            @if (errMsg()) {
              <div class="pz-err">{{ errMsg() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeEdit()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="busy()" (click)="submitEdit()">
              @if (busy()) {
                Enregistrement…
              } @else {
                Enregistrer
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
      .grid {
        display: grid;
        gap: var(--pz-gap);
        grid-template-columns: 1fr 1fr;
      }
      .card-head {
        padding: 16px 20px 12px;
      }
      .card-title {
        font-size: 14px;
        font-weight: 600;
      }
      .card-body {
        padding: 0 20px 20px;
      }
      .logo-row {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 16px;
      }
      .logo {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--pz-primary), #7c3aed);
        color: #fff;
        display: grid;
        place-items: center;
        font-weight: 700;
        font-size: 18px;
      }
      .co-name {
        font-size: 15px;
        font-weight: 600;
      }
      .co-sub {
        font-size: 12px;
        margin-top: 2px;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--pz-line);
        font-size: 13px;
      }
      .info-row:last-child {
        border-bottom: 0;
      }
      .small {
        font-size: 12.5px;
      }
      .sub-badge {
        display: flex;
        gap: 8px;
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
        max-height: 65vh;
        overflow-y: auto;
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
export default class AdminCompanyComponent {
  protected readonly data = inject(DataService);
  protected readonly api = inject(ApiService);
  protected readonly busy = signal(false);
  protected readonly errMsg = signal('');
  protected readonly showEdit = signal(false);

  protected readonly company = computed(() => this.data.companies()[0]);
  protected readonly initials = computed(() => {
    const n = this.company()?.name ?? '';
    return (
      n
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase() || 'CO'
    );
  });

  protected editForm = { name: '', tradeName: '', taxId: '', city: '', address: '', phone: '', email: '' };

  openEdit() {
    const c = this.company();
    if (!c) return;
    this.editForm = {
      name: c.name,
      tradeName: c.tradeName ?? '',
      taxId: c.taxId,
      city: c.city ?? '',
      address: '',
      phone: '',
      email: '',
    };
    this.errMsg.set('');
    this.showEdit.set(true);
  }

  closeEdit() {
    this.showEdit.set(false);
  }

  submitEdit() {
    const c = this.company();
    if (!c) return;
    if (!this.editForm.name.trim() || !this.editForm.taxId.trim()) {
      this.errMsg.set('La raison sociale et le matricule fiscal sont obligatoires.');
      return;
    }
    this.busy.set(true);
    this.errMsg.set('');
    this.api
      .updateCompany(c.id, {
        name: this.editForm.name.trim(),
        tradeName: this.editForm.tradeName.trim() || null,
        taxId: this.editForm.taxId.trim(),
        city: this.editForm.city.trim() || null,
        address: this.editForm.address.trim() || null,
        phone: this.editForm.phone.trim() || null,
        email: this.editForm.email.trim() || null,
        active: true,
      })
      .subscribe({
        next: updated => {
          this.data.companies.update(list => list.map(co => (co.id === c.id ? updated : co)));
          this.closeEdit();
          this.busy.set(false);
        },
        error: () => {
          this.errMsg.set('Erreur lors de la mise à jour.');
          this.busy.set(false);
        },
      });
  }
}
