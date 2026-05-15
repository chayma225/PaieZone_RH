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
      <!-- ── En-tête ──────────────────────────────────────────────── -->
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>Administration</strong> <span class="sep">/</span> Mon entreprise</div>
          <h1>{{ company()?.name ?? 'Mon entreprise' }}</h1>
          <div class="pz-muted">{{ company()?.gouvernorat ?? company()?.city ?? '—' }} · Informations et configuration</div>
        </div>
        <button class="pz-btn pz-primary" (click)="openEdit()"><pz-icon name="Edit" [size]="14" /> Modifier</button>
      </div>

      <div class="layout">
        <!-- ── Colonne gauche — Identité, Fiscaux, Coordonnées ──────── -->
        <div class="col-left">
          <!-- Identité de l'entreprise -->
          <div class="pz-card">
            <div class="section-head">
              <pz-icon name="Building" [size]="15" class="section-ico" />
              <span class="section-title">Identité de l'entreprise</span>
            </div>
            <div class="section-body">
              <div class="info-rows">
                <div class="info-row">
                  <span class="lbl">Raison sociale</span>
                  <span class="val strong">{{ company()?.name || '—' }}</span>
                </div>
                <div class="info-row">
                  <span class="lbl">Nom commercial</span>
                  <span class="val">{{ company()?.tradeName || '—' }}</span>
                </div>
                <div class="info-row">
                  <span class="lbl">Forme juridique</span>
                  <span class="val">{{ company()?.legalForm || '—' }}</span>
                </div>
                <div class="info-row">
                  <span class="lbl">Capital social</span>
                  <span class="val pz-mono">
                    {{ company()?.capitalSocial != null ? (company()!.capitalSocial! | number: '1.0-0') + ' TND' : '—' }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="lbl">Activité principale</span>
                  <span class="val">{{ company()?.mainActivity || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Identifiants fiscaux & sociaux -->
          <div class="pz-card">
            <div class="section-head">
              <pz-icon name="FileText" [size]="15" class="section-ico" />
              <span class="section-title">Identifiants fiscaux &amp; sociaux</span>
            </div>
            <div class="section-body">
              <div class="info-rows">
                <div class="info-row">
                  <span class="lbl">Matricule fiscal</span>
                  <span class="val pz-mono">{{ company()?.taxId || '—' }}</span>
                </div>
                <div class="info-row">
                  <span class="lbl">Identifiant CNSS</span>
                  <span class="val pz-mono">{{ company()?.cnssId || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Coordonnées -->
          <div class="pz-card">
            <div class="section-head">
              <pz-icon name="MapPin" [size]="15" class="section-ico" />
              <span class="section-title">Coordonnées</span>
            </div>
            <div class="section-body">
              <div class="info-rows">
                <div class="info-row">
                  <span class="lbl">Adresse</span>
                  <span class="val">{{ company()?.address || '—' }}</span>
                </div>
                <div class="info-row">
                  <span class="lbl">Ville</span>
                  <span class="val">{{ company()?.city || '—' }}</span>
                </div>
                <div class="info-row">
                  <span class="lbl">Code postal</span>
                  <span class="val pz-mono">{{ company()?.postalCode || '—' }}</span>
                </div>
                <div class="info-row">
                  <span class="lbl">Gouvernorat</span>
                  <span class="val">{{ company()?.gouvernorat || '—' }}</span>
                </div>
                <div class="info-row">
                  <span class="lbl">Téléphone</span>
                  <span class="val">{{ company()?.phone || '—' }}</span>
                </div>
                <div class="info-row">
                  <span class="lbl">Email</span>
                  <span class="val">{{ company()?.email || '—' }}</span>
                </div>
                <div class="info-row">
                  <span class="lbl">Site web</span>
                  <span class="val">{{ company()?.website || '—' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Colonne droite — Logo, Abonnement, Données système ───── -->
        <div class="col-right">
          <!-- Logo -->
          <div class="pz-card logo-card">
            <div class="logo-avatar">{{ initials() }}</div>
            <div class="logo-info">
              <div class="co-name">{{ company()?.name ?? '—' }}</div>
              <div class="co-trade pz-muted">{{ company()?.tradeName || '—' }}</div>
            </div>
            <button class="pz-btn pz-sm upload-btn" disabled><pz-icon name="Upload" [size]="13" /> Changer le logo</button>
            <div class="pz-muted" style="font-size:11px;margin-top:4px">PNG, JPG ou SVG — max 2 Mo</div>
          </div>

          <!-- Abonnement -->
          <div class="pz-card">
            <div class="section-head">
              <pz-icon name="Wallet" [size]="15" class="section-ico" />
              <span class="section-title">Abonnement</span>
            </div>
            <div class="section-body">
              @if (company()) {
                <div class="sub-badges">
                  <span class="pz-pill primary">{{ company()!.plan }}</span>
                  <span
                    class="pz-pill"
                    [class.pos]="company()!.status === 'ACTIVE'"
                    [class.warn]="company()!.status === 'TRIAL'"
                    [class.danger]="company()!.status === 'SUSPENDED'"
                  >
                    {{ statusLabel(company()!.status) }}
                  </span>
                </div>
                <div class="info-rows" style="margin-top:14px">
                  <div class="info-row">
                    <span class="lbl">Prix mensuel HT</span>
                    <strong class="pz-mono">{{ data.fmtTND(company()!.priceHT) }}</strong>
                  </div>
                  <div class="info-row">
                    <span class="lbl">Renouvellement</span>
                    <span>{{ company()!.renewal || '—' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="lbl">Collaborateurs</span>
                    <span>{{ data.employees().length }} / {{ company()!.maxEmployees ?? '∞' }}</span>
                  </div>
                </div>
              } @else {
                <div class="pz-muted" style="padding:16px 0;text-align:center;font-size:13px">Aucun abonnement</div>
              }
            </div>
          </div>

          <!-- Données système -->
          <div class="pz-card">
            <div class="section-head">
              <pz-icon name="Settings" [size]="15" class="section-ico" />
              <span class="section-title">Données système</span>
            </div>
            <div class="section-body">
              <div class="info-rows">
                <div class="info-row">
                  <span class="lbl">Schéma BD</span>
                  <span class="pz-mono small">{{ company()?.schema || '—' }}</span>
                </div>
                <div class="info-row">
                  <span class="lbl">Région</span>
                  <span>Tunisie</span>
                </div>
                <div class="info-row">
                  <span class="lbl">Créée le</span>
                  <span class="small">{{ fmtDate(company()?.createdAt) }}</span>
                </div>
                <div class="info-row">
                  <span class="lbl">ID tenant</span>
                  <span class="pz-mono small">{{ company()?.id ?? '—' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Modal Modifier ──────────────────────────────────────────── -->
    @if (showEdit()) {
      <div class="pz-overlay" (click)="closeEdit()">
        <div class="pz-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Modifier l'entreprise</span>
            <button class="pz-modal-close" (click)="closeEdit()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="modal-section-label">Identité</div>
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
                <label>Forme juridique</label>
                <select [(ngModel)]="editForm.legalForm">
                  <option value="">— Sélectionner —</option>
                  <option>SARL</option>
                  <option>SA</option>
                  <option>SUARL</option>
                  <option>SNC</option>
                  <option>GIE</option>
                  <option>Association</option>
                  <option>Autre</option>
                </select>
              </div>
              <div class="pz-field">
                <label>Capital social (TND)</label>
                <input type="number" [(ngModel)]="editForm.capitalSocial" placeholder="ex: 10000" min="0" />
              </div>
            </div>
            <div class="pz-field">
              <label>Activité principale</label>
              <input type="text" [(ngModel)]="editForm.mainActivity" placeholder="ex: Développement logiciel" />
            </div>

            <div class="modal-section-label">Identifiants</div>
            <div class="pz-field-row">
              <div class="pz-field">
                <label>Matricule fiscal *</label>
                <input type="text" [(ngModel)]="editForm.taxId" placeholder="ex: 1234567A/P/M/000" />
              </div>
              <div class="pz-field">
                <label>Identifiant CNSS</label>
                <input type="text" [(ngModel)]="editForm.cnssId" placeholder="ex: 123456789" />
              </div>
            </div>

            <div class="modal-section-label">Coordonnées</div>
            <div class="pz-field">
              <label>Adresse</label>
              <input type="text" [(ngModel)]="editForm.address" placeholder="Adresse complète" />
            </div>
            <div class="pz-field-row">
              <div class="pz-field">
                <label>Ville</label>
                <input type="text" [(ngModel)]="editForm.city" placeholder="ex: Tunis" />
              </div>
              <div class="pz-field">
                <label>Code postal</label>
                <input type="text" [(ngModel)]="editForm.postalCode" placeholder="ex: 1000" />
              </div>
            </div>
            <div class="pz-field">
              <label>Gouvernorat</label>
              <input type="text" [(ngModel)]="editForm.gouvernorat" placeholder="ex: Tunis" />
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
            <div class="pz-field">
              <label>Site web</label>
              <input type="url" [(ngModel)]="editForm.website" placeholder="https://www.entreprise.tn" />
            </div>

            @if (errMsg()) {
              <div class="pz-err">{{ errMsg() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeEdit()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="busy()" (click)="submitEdit()">
              {{ busy() ? 'Enregistrement…' : 'Enregistrer' }}
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

      .layout {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: var(--pz-gap);
        align-items: start;
      }
      .col-left,
      .col-right {
        display: flex;
        flex-direction: column;
        gap: var(--pz-gap);
      }

      /* Logo card */
      .logo-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px 20px;
        text-align: center;
        gap: 8px;
      }
      .logo-avatar {
        width: 72px;
        height: 72px;
        border-radius: 16px;
        background: linear-gradient(135deg, var(--pz-primary), #7c3aed);
        color: #fff;
        display: grid;
        place-items: center;
        font-weight: 700;
        font-size: 22px;
      }
      .co-name {
        font-size: 15px;
        font-weight: 600;
      }
      .co-trade {
        font-size: 12px;
        margin-top: 2px;
      }
      .upload-btn {
        margin-top: 4px;
      }

      /* Section header */
      .section-head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 14px 20px 10px;
        border-bottom: 1px solid var(--pz-line);
      }
      .section-ico {
        color: var(--pz-primary);
      }
      .section-title {
        font-size: 13px;
        font-weight: 600;
      }
      .section-body {
        padding: 8px 20px 16px;
      }

      /* Info rows */
      .info-rows {
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--pz-line);
        font-size: 13px;
        gap: 12px;
      }
      .info-row:last-child {
        border-bottom: 0;
      }
      .lbl {
        color: var(--pz-muted);
        font-size: 12px;
        white-space: nowrap;
      }
      .val {
        text-align: right;
      }
      .small {
        font-size: 12px;
      }
      .strong {
        font-weight: 500;
      }

      /* Subscription */
      .sub-badges {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      /* Modal */
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
        width: 560px;
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
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
      }
      .pz-modal-foot {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 14px 20px;
        border-top: 1px solid var(--pz-line);
      }

      .modal-section-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--pz-muted);
        padding-top: 4px;
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
        .map(w => w[0] ?? '')
        .join('')
        .toUpperCase() || 'CO'
    );
  });

  protected editForm = {
    name: '',
    tradeName: '',
    taxId: '',
    cnssId: '',
    legalForm: '',
    capitalSocial: null as number | null,
    mainActivity: '',
    city: '',
    postalCode: '',
    gouvernorat: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  };

  statusLabel(s: string): string {
    return s === 'ACTIVE' ? 'Actif' : s === 'TRIAL' ? 'Essai' : s === 'SUSPENDED' ? 'Suspendu' : s;
  }

  fmtDate(iso: string | undefined): string {
    if (!iso) return '—';
    try {
      return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
    } catch {
      return iso;
    }
  }

  openEdit() {
    const c = this.company();
    if (!c) return;
    this.editForm = {
      name: c.name,
      tradeName: c.tradeName ?? '',
      taxId: c.taxId,
      cnssId: c.cnssId ?? '',
      legalForm: c.legalForm ?? '',
      capitalSocial: c.capitalSocial ?? null,
      mainActivity: c.mainActivity ?? '',
      city: c.city ?? '',
      postalCode: c.postalCode ?? '',
      gouvernorat: c.gouvernorat ?? '',
      address: c.address ?? '',
      phone: c.phone ?? '',
      email: c.email ?? '',
      website: c.website ?? '',
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
        cnssId: this.editForm.cnssId.trim() || null,
        legalForm: this.editForm.legalForm || null,
        capitalSocial: this.editForm.capitalSocial ?? null,
        mainActivity: this.editForm.mainActivity.trim() || null,
        city: this.editForm.city.trim() || null,
        postalCode: this.editForm.postalCode.trim() || null,
        gouvernorat: this.editForm.gouvernorat.trim() || null,
        address: this.editForm.address.trim() || null,
        phone: this.editForm.phone.trim() || null,
        email: this.editForm.email.trim() || null,
        website: this.editForm.website.trim() || null,
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
