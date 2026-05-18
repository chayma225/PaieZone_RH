import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { Employee } from '../../core/types';

const ROLES = [
  { value: 'ROLE_EMPLOYE', label: 'Employé' },
  { value: 'ROLE_RH_COMPTABLE', label: 'RH / Comptable' },
  { value: 'ROLE_ADMIN', label: 'Administrateur' },
];

const ROLE_LABELS: Record<string, string> = {
  ROLE_EMPLOYE: 'Employé',
  ROLE_RH_COMPTABLE: 'RH / Comptable',
  ROLE_ADMIN: 'Administrateur',
  ROLE_SUPER_ADMIN: 'Super Admin',
  ROLE_USER: 'Utilisateur',
};

@Component({
  selector: 'pz-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>Administration</strong> <span class="sep">/</span> Utilisateurs</div>
          <h1>Gestion des utilisateurs</h1>
          <div class="pz-muted">{{ data.employees().length }} collaborateur(s) · Gérez les accès et rôles</div>
        </div>
        <button class="pz-btn pz-primary" (click)="openInvite()">
          <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Inviter un utilisateur
        </button>
      </div>

      <div class="pz-card">
        <table class="pz-table">
          <thead>
            <tr>
              <th>Collaborateur</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Rôle système</th>
              <th>Département</th>
              <th>Contrat</th>
              <th>Date d'entrée</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @if (data.employees().length === 0) {
              <tr>
                <td colspan="8" style="text-align:center;padding:40px;color:var(--pz-muted)">Aucun utilisateur enregistré</td>
              </tr>
            }
            @for (e of data.employees(); track e.id) {
              @let sysRole = getSystemRole(e.email);
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="pz-avatar sm" [attr.data-bg]="data.empBgIdx(e.id)">{{ data.initials(e) }}</div>
                    <div>
                      <div style="font-weight:500;font-size:13px">{{ data.fullName(e) }}</div>
                      <div style="font-size:11.5px;color:var(--pz-muted)">{{ e.role || e.dept }}</div>
                    </div>
                  </div>
                </td>
                <td style="font-size:12.5px;color:var(--pz-ink-2)">{{ e.email || '—' }}</td>
                <td style="font-size:12.5px;color:var(--pz-ink-2)">{{ e.phone || '—' }}</td>
                <td>
                  @if (sysRole) {
                    <span class="pz-pill" [class.info]="sysRole === 'ROLE_ADMIN'" [class.warn]="sysRole === 'ROLE_RH_COMPTABLE'">
                      {{ roleLabel(sysRole) }}
                    </span>
                  } @else {
                    <span class="pz-muted" style="font-size:12px">—</span>
                  }
                </td>
                <td style="font-size:12.5px">{{ e.dept || '—' }}</td>
                <td>
                  <span class="pz-pill" [class.info]="e.contract === 'CDI'" [class.warn]="e.contract === 'CDD'">{{ e.contract }}</span>
                </td>
                <td style="color:var(--pz-muted);font-size:12px">{{ e.hireDate }}</td>
                <td>
                  <div style="display:flex;gap:6px">
                    <button class="pz-btn pz-sm" title="Modifier" (click)="openEdit(e)">
                      <pz-icon name="Edit" [size]="13" />
                    </button>
                    <button class="pz-btn pz-sm pz-danger" title="Désactiver" [disabled]="busy()" (click)="confirmLock(e)">
                      <pz-icon name="Lock" [size]="13" />
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Inviter un utilisateur -->
    @if (showInvite()) {
      <div class="pz-overlay" (click)="closeInvite()">
        <div class="pz-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Inviter un utilisateur</span>
            <button class="pz-modal-close" (click)="closeInvite()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="pz-field-row">
              <div class="pz-field">
                <label>Prénom</label>
                <input type="text" [(ngModel)]="inviteForm.firstName" placeholder="Prénom" />
              </div>
              <div class="pz-field">
                <label>Nom</label>
                <input type="text" [(ngModel)]="inviteForm.lastName" placeholder="Nom" />
              </div>
            </div>
            <div class="pz-field">
              <label>Email</label>
              <input type="email" [(ngModel)]="inviteForm.email" placeholder="email@entreprise.tn" (blur)="autoFillLogin()" />
            </div>
            <div class="pz-field">
              <label>Identifiant (login)</label>
              <input type="text" [(ngModel)]="inviteForm.login" placeholder="ex: m.ben-ali" />
            </div>
            <div class="pz-field">
              <label>Rôle</label>
              <select [(ngModel)]="inviteForm.role">
                @for (r of roles; track r.value) {
                  <option [value]="r.value">{{ r.label }}</option>
                }
              </select>
            </div>
            @if (errMsg()) {
              <div class="pz-err">{{ errMsg() }}</div>
            }
            @if (successMsg()) {
              <div class="pz-ok">{{ successMsg() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeInvite()">Annuler</button>
            <button class="pz-btn pz-primary" [disabled]="busy()" (click)="submitInvite()">
              @if (busy()) {
                Envoi…
              } @else {
                Envoyer l'invitation
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Modifier employé -->
    @if (editTarget()) {
      <div class="pz-overlay" (click)="closeEdit()">
        <div class="pz-modal" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Modifier — {{ data.fullName(editTarget()!) }}</span>
            <button class="pz-modal-close" (click)="closeEdit()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <div class="pz-field-row">
              <div class="pz-field">
                <label>Prénom</label>
                <input type="text" [(ngModel)]="editForm.first" />
              </div>
              <div class="pz-field">
                <label>Nom</label>
                <input type="text" [(ngModel)]="editForm.last" />
              </div>
            </div>
            <div class="pz-field">
              <label>Email professionnel</label>
              <input type="email" [(ngModel)]="editForm.email" />
            </div>
            <div class="pz-field">
              <label>Téléphone</label>
              <input type="text" [(ngModel)]="editForm.phone" placeholder="ex: +216 XX XXX XXX" />
            </div>
            <div class="pz-field">
              <label>Rôle système</label>
              @if (editForm.login) {
                <select [(ngModel)]="editForm.role">
                  @for (r of roles; track r.value) {
                    <option [value]="r.value">{{ r.label }}</option>
                  }
                </select>
              } @else {
                <input type="text" disabled value="Aucun compte utilisateur associé" style="color:var(--pz-muted)" />
              }
            </div>
            @if (editForm.login) {
              <div class="twofa-row">
                <div>
                  <div class="twofa-label">Double authentification (2FA)</div>
                  <div class="twofa-sub">
                    @if (twoFaEnabled()) {
                      <span style="color:var(--pz-pos)">Activée — code email à chaque connexion</span>
                    } @else {
                      <span style="color:var(--pz-muted)">Désactivée</span>
                    }
                  </div>
                </div>
                <button
                  class="pz-btn pz-sm"
                  [class.pz-danger]="twoFaEnabled()"
                  [class.pz-primary]="!twoFaEnabled()"
                  [disabled]="twoFaBusy()"
                  (click)="toggle2fa()"
                >
                  {{ twoFaBusy() ? '…' : twoFaEnabled() ? 'Désactiver' : 'Activer' }}
                </button>
              </div>
            }
            @if (errMsg()) {
              <div class="pz-err">{{ errMsg() }}</div>
            }
            @if (successMsg()) {
              <div class="pz-ok">{{ successMsg() }}</div>
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

    <!-- Confirmation Désactivation -->
    @if (lockTarget()) {
      <div class="pz-overlay" (click)="closeLock()">
        <div class="pz-modal pz-modal-sm" (click)="$event.stopPropagation()">
          <div class="pz-modal-head">
            <span>Désactiver l'accès</span>
            <button class="pz-modal-close" (click)="closeLock()"><pz-icon name="X" [size]="16" /></button>
          </div>
          <div class="pz-modal-body">
            <p style="font-size:13.5px;color:var(--pz-ink-2);margin:0">
              Confirmer la désactivation du compte de <strong>{{ data.fullName(lockTarget()!) }}</strong> ? L'employé ne pourra plus se
              connecter.
            </p>
            @if (errMsg()) {
              <div class="pz-err">{{ errMsg() }}</div>
            }
          </div>
          <div class="pz-modal-foot">
            <button class="pz-btn" (click)="closeLock()">Annuler</button>
            <button class="pz-btn pz-danger" [disabled]="busy()" (click)="doLock()">
              @if (busy()) {
                Désactivation…
              } @else {
                Désactiver
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
      .twofa-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 14px;
        border: 1px solid var(--pz-line);
        border-radius: 8px;
        background: var(--pz-surface-2);
      }
      .twofa-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--pz-ink);
      }
      .twofa-sub {
        font-size: 11.5px;
        margin-top: 2px;
      }
      .pz-btn.pz-danger {
        background: #fee2e2;
        color: #b91c1c;
        border: 1px solid #fca5a5;
        &:hover {
          background: #fecaca;
        }
      }
      .pz-ok {
        color: #166534;
        font-size: 12.5px;
        background: #dcfce7;
        border-radius: 8px;
        padding: 8px 12px;
      }
    `,
  ],
})
export default class AdminUsersComponent implements OnInit {
  protected readonly data = inject(DataService);
  protected readonly api = inject(ApiService);
  protected readonly busy = signal(false);
  protected readonly errMsg = signal('');
  protected readonly successMsg = signal('');
  protected readonly showInvite = signal(false);
  protected readonly editTarget = signal<Employee | null>(null);
  protected readonly lockTarget = signal<Employee | null>(null);

  protected readonly roles = ROLES;

  protected inviteForm = { firstName: '', lastName: '', email: '', login: '', role: 'ROLE_EMPLOYE' };
  protected editForm = { first: '', last: '', email: '', phone: '', role: 'ROLE_EMPLOYE', login: '', origRole: '' };

  protected readonly twoFaEnabled = signal(false);
  protected readonly twoFaBusy = signal(false);

  // Map email → { login, role, id } pour les utilisateurs qui ont un compte
  private userMap = new Map<string, { login: string; firstName: string; lastName: string; role: string; id?: number }>();

  ngOnInit(): void {
    this.api.myCompanyUsers().subscribe({
      next: users => {
        this.userMap.clear();
        for (const u of users) {
          const email = (u.email ?? '').toLowerCase();
          const role = this.primaryRole(u.authorities ?? []);
          if (email) this.userMap.set(email, { id: u.id, login: u.login, firstName: u.firstName, lastName: u.lastName, role });
        }
      },
      error: () => {},
    });
  }

  private primaryRole(authorities: string[]): string {
    if (authorities.includes('ROLE_SUPER_ADMIN')) return 'ROLE_SUPER_ADMIN';
    if (authorities.includes('ROLE_ADMIN')) return 'ROLE_ADMIN';
    if (authorities.includes('ROLE_RH_COMPTABLE')) return 'ROLE_RH_COMPTABLE';
    return 'ROLE_EMPLOYE';
  }

  protected roleLabel(role: string): string {
    return ROLE_LABELS[role] ?? role;
  }

  protected getSystemRole(email: string): string {
    return this.userMap.get((email ?? '').toLowerCase())?.role ?? '';
  }

  autoFillLogin() {
    if (!this.inviteForm.login && this.inviteForm.email) {
      const local = this.inviteForm.email.split('@')[0] ?? '';
      this.inviteForm.login = local.toLowerCase().replace(/[^a-z0-9._-]/g, '');
    }
  }

  openInvite() {
    this.inviteForm = { firstName: '', lastName: '', email: '', login: '', role: 'ROLE_EMPLOYE' };
    this.errMsg.set('');
    this.successMsg.set('');
    this.showInvite.set(true);
  }

  closeInvite() {
    this.showInvite.set(false);
  }

  submitInvite() {
    const f = this.inviteForm;
    if (!f.email || !f.login) {
      this.errMsg.set('Email et identifiant obligatoires.');
      return;
    }
    this.busy.set(true);
    this.errMsg.set('');
    this.successMsg.set('');
    this.api.inviteUser(f.login, f.email, f.firstName, f.lastName, f.role).subscribe({
      next: () => {
        this.successMsg.set(`Invitation envoyée à ${f.email}.`);
        this.busy.set(false);
      },
      error: err => {
        this.errMsg.set(err?.error?.detail ?? "Erreur lors de l'invitation.");
        this.busy.set(false);
      },
    });
  }

  openEdit(e: Employee) {
    const userEntry = this.userMap.get((e.email ?? '').toLowerCase());
    this.editForm = {
      first: e.first,
      last: e.last,
      email: e.email,
      phone: e.phone,
      role: userEntry?.role ?? 'ROLE_EMPLOYE',
      login: userEntry?.login ?? '',
      origRole: userEntry?.role ?? '',
    };
    this.errMsg.set('');
    this.successMsg.set('');
    this.twoFaEnabled.set(false);
    this.twoFaBusy.set(false);
    if (userEntry?.login) {
      this.api.admin2faStatus(userEntry.login).subscribe({
        next: res => this.twoFaEnabled.set(res.twoFactorEnabled),
        error: () => {},
      });
    }
    this.editTarget.set(e);
  }

  toggle2fa(): void {
    const login = this.editForm.login;
    if (!login) return;
    this.twoFaBusy.set(true);
    this.errMsg.set('');
    const call = this.twoFaEnabled() ? this.api.admin2faDisable(login) : this.api.admin2faEnable(login);
    call.subscribe({
      next: () => {
        this.twoFaEnabled.set(!this.twoFaEnabled());
        this.twoFaBusy.set(false);
      },
      error: err => {
        this.twoFaBusy.set(false);
        const detail = err?.error?.detail ?? err?.error?.message ?? 'Erreur lors de la modification du 2FA.';
        this.errMsg.set(detail);
      },
    });
  }

  closeEdit() {
    this.editTarget.set(null);
  }

  submitEdit() {
    const e = this.editTarget();
    if (!e) return;
    this.busy.set(true);
    this.errMsg.set('');

    const empPatch = this.api.patchEmployee(e.id, {
      id: e.id,
      firstName: this.editForm.first,
      lastName: this.editForm.last,
      professionalEmail: this.editForm.email,
      phoneNumber: this.editForm.phone,
    });

    empPatch.subscribe({
      next: () => {
        this.data.employees.update(list =>
          list.map(emp =>
            emp.id === e.id
              ? { ...emp, first: this.editForm.first, last: this.editForm.last, email: this.editForm.email, phone: this.editForm.phone }
              : emp,
          ),
        );

        // Mettre à jour le rôle si un compte utilisateur existe et que le rôle a changé
        const login = this.editForm.login;
        if (login && this.editForm.role !== this.editForm.origRole) {
          const userEntry = this.userMap.get((this.editForm.email ?? '').toLowerCase());
          this.api
            .updateUserAuthorities(
              login,
              this.editForm.email,
              this.editForm.first,
              this.editForm.last,
              [this.editForm.role, 'ROLE_USER'],
              userEntry?.id,
            )
            .subscribe({
              next: () => {
                this.userMap.set((this.editForm.email ?? '').toLowerCase(), {
                  login,
                  firstName: this.editForm.first,
                  lastName: this.editForm.last,
                  role: this.editForm.role,
                });
                this.successMsg.set('Modifications enregistrées.');
                this.busy.set(false);
                this.editTarget.set(null);
              },
              error: () => {
                this.successMsg.set('Informations mises à jour. Erreur lors du changement de rôle.');
                this.busy.set(false);
              },
            });
        } else {
          this.busy.set(false);
          this.editTarget.set(null);
        }
      },
      error: () => {
        this.errMsg.set('Erreur lors de la modification.');
        this.busy.set(false);
      },
    });
  }

  confirmLock(e: Employee) {
    this.errMsg.set('');
    this.lockTarget.set(e);
  }
  closeLock() {
    this.lockTarget.set(null);
  }

  doLock() {
    const e = this.lockTarget();
    if (!e) return;
    this.busy.set(true);
    this.errMsg.set('');
    this.api.patchEmployee(e.id, { id: e.id, active: false }).subscribe({
      next: () => {
        this.data.employees.update(list => list.filter(emp => emp.id !== e.id));
        this.closeLock();
        this.busy.set(false);
      },
      error: () => {
        this.errMsg.set('Erreur lors de la désactivation.');
        this.busy.set(false);
      },
    });
  }
}
