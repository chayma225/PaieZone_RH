import { Component, ChangeDetectionStrategy, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'pz-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <!-- ── En-tête ──────────────────────────────────────────────────────── -->
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>Administration</strong> <span class="sep">/</span> Tableau de bord</div>
          <h1>{{ company()?.name ?? 'Mon entreprise' }}</h1>
          <div class="pz-muted">Vue administrateur · {{ today }}</div>
        </div>
        <div class="pz-page-actions">
          <a class="pz-btn" routerLink="/paiezone/admin-company"> <pz-icon name="Building" [size]="14" /> Mon entreprise </a>
          <a class="pz-btn pz-primary" routerLink="/paiezone/admin-users">
            <pz-icon name="Plus" [size]="14" [strokeWidth]="1.7" /> Inviter un utilisateur
          </a>
        </div>
      </div>

      <!-- ── Bannière no-company ──────────────────────────────────────────── -->
      @if (data.companiesLoaded() && !company()) {
        <div class="no-company-banner">
          <pz-icon name="Building" [size]="20" />
          <div>
            <strong>Aucune entreprise configurée.</strong>
            Créez votre entreprise pour commencer à utiliser PaieZone RH.
          </div>
          <button class="pz-btn pz-primary" (click)="openSetup()">Configurer mon entreprise</button>
        </div>
      }

      <!-- ── Modal création entreprise ─────────────────────────────────────── -->
      @if (showSetup()) {
        <div class="pz-overlay" (click)="closeSetup()">
          <div class="pz-modal" (click)="$event.stopPropagation()">
            <div class="pz-modal-head">
              <span>Configurer mon entreprise</span>
              <button class="pz-modal-close" (click)="closeSetup()"><pz-icon name="X" [size]="16" /></button>
            </div>
            <div class="pz-modal-body">
              <div class="pz-field">
                <label>Raison sociale *</label>
                <input type="text" [(ngModel)]="setupForm.name" placeholder="ex: Ma Société SARL" />
              </div>
              <div class="pz-field">
                <label>Matricule fiscal *</label>
                <input type="text" [(ngModel)]="setupForm.taxId" placeholder="ex: 1234567A/P/M/000" />
              </div>
              <div class="pz-field-row">
                <div class="pz-field">
                  <label>Téléphone</label>
                  <input type="text" [(ngModel)]="setupForm.phone" placeholder="+216 XX XXX XXX" />
                </div>
                <div class="pz-field">
                  <label>Email</label>
                  <input type="email" [(ngModel)]="setupForm.email" placeholder="contact@entreprise.tn" />
                </div>
              </div>
              <div class="pz-field-row">
                <div class="pz-field">
                  <label>Ville</label>
                  <input type="text" [(ngModel)]="setupForm.city" placeholder="ex: Tunis" />
                </div>
                <div class="pz-field">
                  <label>Gouvernorat</label>
                  <input type="text" [(ngModel)]="setupForm.gouvernorat" placeholder="ex: Tunis" />
                </div>
              </div>
              @if (setupErr()) {
                <div class="pz-err">{{ setupErr() }}</div>
              }
            </div>
            <div class="pz-modal-foot">
              <button class="pz-btn" (click)="closeSetup()">Annuler</button>
              <button class="pz-btn pz-primary" [disabled]="setupBusy()" (click)="submitSetup()">
                {{ setupBusy() ? 'Enregistrement…' : 'Créer mon entreprise' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ── KPI cards ─────────────────────────────────────────────────────── -->
      <div class="stat-grid">
        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico"><pz-icon name="Users" /></span>Utilisateurs actifs
          </div>
          <div class="stat-val">
            {{ activeCount() }}<small>/ {{ jhUsers().length }}</small>
          </div>
          <div class="stat-foot pz-muted">{{ jhUsers().length - activeCount() }} désactivé(s)</div>
        </div>

        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico info"><pz-icon name="Briefcase" /></span>Effectif total
          </div>
          <div class="stat-val">{{ data.employees().length }}</div>
          <div class="stat-foot pz-muted">collaborateurs actifs</div>
        </div>

        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico warn"><pz-icon name="Calendar" /></span>Congés en attente
          </div>
          <div class="stat-val">{{ pendingLeaves() }}</div>
          <div class="stat-foot pz-muted">demandes à valider</div>
        </div>

        <div class="pz-card stat">
          <div class="stat-head">
            <span class="ico pos"><pz-icon name="Wallet" /></span>Avances en attente
          </div>
          <div class="stat-val">{{ pendingAdvances() }}</div>
          <div class="stat-foot pz-muted">à approuver</div>
        </div>
      </div>

      <!-- ── Grille principale ─────────────────────────────────────────────── -->
      <div class="main-grid">
        <!-- Répartition des rôles -->
        <div class="pz-card">
          <div class="card-head">
            <div class="card-title">Répartition des rôles</div>
            <a class="pz-btn pz-sm pz-ghost" routerLink="/paiezone/admin-users">
              Gérer <pz-icon name="Arrow" [size]="12" [strokeWidth]="1.6" />
            </a>
          </div>
          <div class="card-body">
            @if (jhUsers().length === 0) {
              <div class="pz-muted" style="text-align:center;padding:24px 0;font-size:13px">Chargement des utilisateurs…</div>
            }
            @for (r of roleDist(); track r.role) {
              <div class="role-row">
                <div class="row-top">
                  <span class="pz-pill" [class.primary]="r.color === 'primary'" [class.info]="r.color === 'info'">{{ r.label }}</span>
                  <span class="pz-muted small">{{ r.desc }}</span>
                  <span class="pz-mono strong">{{ r.count }}</span>
                </div>
                <div class="progress"><i [style.width.%]="r.pct"></i></div>
              </div>
            }
          </div>
        </div>

        <!-- Fiche entreprise -->
        <div class="pz-card">
          <div class="card-head"><div class="card-title">Mon entreprise</div></div>
          <div class="card-body">
            <div class="company-head">
              <div class="logo">{{ companyInitials() }}</div>
              <div>
                <div class="strong">{{ company()?.name ?? '—' }}</div>
                <div class="pz-muted small">{{ company()?.city ?? '—' }}</div>
              </div>
            </div>
            <div class="info-rows">
              <div class="info-row">
                <span class="pz-muted small">Matricule fiscal</span>
                <span class="pz-mono small">{{ company()?.taxId ?? '—' }}</span>
              </div>
              <div class="info-row">
                <span class="pz-muted small">Email</span>
                <span class="small">{{ company()?.email ?? '—' }}</span>
              </div>
              <div class="info-row">
                <span class="pz-muted small">Effectif</span>
                <span class="strong">{{ data.employees().length }} collaborateurs</span>
              </div>
              <div class="info-row">
                <span class="pz-muted small">Plan</span>
                <span class="pz-pill primary">{{ company()?.plan ?? '—' }}</span>
              </div>
              <div class="info-row">
                <span class="pz-muted small">Statut</span>
                <span
                  class="pz-pill"
                  [class.pos]="company()?.status === 'ACTIVE'"
                  [class.warn]="company()?.status === 'TRIAL'"
                  [class.danger]="company()?.status === 'SUSPENDED'"
                  >{{ company()?.status ?? '—' }}</span
                >
              </div>
            </div>
            <a class="pz-btn" style="width:100%;justify-content:center;margin-top:4px" routerLink="/paiezone/admin-company">
              <pz-icon name="Edit" [size]="14" [strokeWidth]="1.4" /> Modifier
            </a>
          </div>
        </div>
      </div>

      <!-- ── Activité récente ────────────────────────────────────────────────── -->
      <div class="pz-card">
        <div class="card-head"><div class="card-title">Utilisateurs récents</div></div>
        <table class="pz-tbl">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle principal</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            @if (jhUsers().length === 0) {
              <tr>
                <td colspan="4" style="text-align:center;padding:32px;color:var(--pz-muted)">Chargement…</td>
              </tr>
            }
            @for (u of jhUsers().slice(0, 8); track u.id) {
              <tr>
                <td>
                  <div class="u-cell">
                    <div class="pz-avatar sm" [attr.data-bg]="(u.id % 6) + 1">
                      {{ (u.firstName?.[0] ?? u.login?.[0] ?? '?').toUpperCase() }}{{ (u.lastName?.[0] ?? '').toUpperCase() }}
                    </div>
                    <div>
                      <div class="strong">{{ u.firstName ?? '' }} {{ u.lastName ?? '' }}</div>
                      <div class="pz-muted small">{{ u.login }}</div>
                    </div>
                  </div>
                </td>
                <td class="pz-muted small">{{ u.email }}</td>
                <td>
                  @if (u.authorities?.includes('ROLE_ADMIN')) {
                    <span class="pz-pill primary">Admin</span>
                  } @else if (u.authorities?.includes('ROLE_RH_COMPTABLE')) {
                    <span class="pz-pill info">RH</span>
                  } @else {
                    <span class="pz-pill">Employé</span>
                  }
                </td>
                <td>
                  <span class="pz-pill" [class.pos]="u.activated" [class.danger]="!u.activated">
                    <span class="dot"></span>{{ u.activated ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .pz-page-actions {
        display: flex;
        gap: 8px;
      }
      .stat-grid {
        display: grid;
        gap: var(--pz-gap);
        grid-template-columns: repeat(4, 1fr);
      }
      .stat {
        padding: 18px 20px;
      }
      .stat-head {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--pz-muted);
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 8px;
      }
      .stat-head .ico {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        background: var(--pz-primary-soft);
        color: var(--pz-primary);
        display: grid;
        place-items: center;
      }
      .stat-head .ico.info {
        background: var(--pz-info-soft);
        color: var(--pz-info-ink);
      }
      .stat-head .ico.warn {
        background: var(--pz-warn-soft);
        color: var(--pz-warn-ink);
      }
      .stat-head .ico.pos {
        background: var(--pz-pos-soft);
        color: var(--pz-pos-ink);
      }
      .stat-val {
        font-size: 26px;
        font-weight: 600;
        letter-spacing: -0.025em;
        font-variant-numeric: tabular-nums;
        line-height: 1.1;
      }
      .stat-val small {
        font-size: 14px;
        color: var(--pz-muted);
        font-weight: 500;
        margin-left: 3px;
      }
      .stat-foot {
        margin-top: 10px;
        font-size: 12px;
      }

      .main-grid {
        display: grid;
        gap: var(--pz-gap);
        grid-template-columns: 2fr 1fr;
      }
      .card-head {
        display: flex;
        align-items: center;
        padding: 16px 20px 12px;
      }
      .card-title {
        font-size: 14px;
        font-weight: 600;
        flex: 1;
      }
      .card-body {
        padding: 4px 20px 20px;
      }

      .role-row {
        margin-bottom: 14px;
      }
      .row-top {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }
      .row-top .pz-mono {
        margin-left: auto;
        font-size: 13px;
      }
      .progress {
        height: 4px;
        background: var(--pz-surface-3);
        border-radius: 999px;
        overflow: hidden;
      }
      .progress i {
        display: block;
        height: 100%;
        background: var(--pz-primary);
        border-radius: 999px;
        transition: width 0.4s;
      }
      .small {
        font-size: 12px;
      }
      .strong {
        font-weight: 500;
      }

      .company-head {
        display: flex;
        gap: 14px;
        align-items: center;
        margin-bottom: 14px;
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
      .info-rows {
        margin-bottom: 4px;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid var(--pz-line);
        font-size: 12.5px;
      }
      .info-row:last-child {
        border-bottom: 0;
      }

      .pz-tbl {
        width: 100%;
        border-collapse: collapse;
      }
      .pz-tbl thead th {
        text-align: left;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
        color: var(--pz-muted);
        padding: 10px 16px;
        border-bottom: 1px solid var(--pz-line);
        background: var(--pz-surface-2);
      }
      .pz-tbl tbody td {
        padding: 10px 16px;
        border-bottom: 1px solid var(--pz-line);
        font-size: 13px;
        color: var(--pz-ink-2);
        vertical-align: middle;
      }
      .pz-tbl tbody tr:last-child td {
        border-bottom: 0;
      }
      .pz-tbl tbody tr:hover {
        background: var(--pz-surface-2);
      }
      .u-cell {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .no-company-banner {
        display: flex;
        align-items: center;
        gap: 14px;
        background: #ede9fe;
        border: 1px solid #c4b5fd;
        border-radius: var(--pz-radius-lg);
        padding: 16px 20px;
        color: #4338ca;
        font-size: 13.5px;
      }
      .no-company-banner div {
        flex: 1;
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
        width: 520px;
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
export default class AdminDashboardComponent implements OnInit {
  protected readonly data = inject(DataService);
  private readonly api = inject(ApiService);

  readonly jhUsers = signal<any[]>([]);

  // ── Company setup modal ──────────────────────────────────────────────────
  readonly showSetup = signal(false);
  readonly setupBusy = signal(false);
  readonly setupErr = signal('');
  setupForm = { name: '', taxId: '', phone: '', email: '', city: '', gouvernorat: '' };

  openSetup(): void {
    this.setupForm = { name: '', taxId: '', phone: '', email: '', city: '', gouvernorat: '' };
    this.setupErr.set('');
    this.showSetup.set(true);
  }

  closeSetup(): void {
    this.showSetup.set(false);
  }

  submitSetup(): void {
    if (!this.setupForm.name.trim() || !this.setupForm.taxId.trim()) {
      this.setupErr.set('La raison sociale et le matricule fiscal sont obligatoires.');
      return;
    }
    this.setupBusy.set(true);
    this.setupErr.set('');
    this.api
      .createCompany({
        name: this.setupForm.name.trim(),
        taxId: this.setupForm.taxId.trim(),
        phone: this.setupForm.phone.trim() || null,
        email: this.setupForm.email.trim() || null,
        city: this.setupForm.city.trim() || null,
        gouvernorat: this.setupForm.gouvernorat.trim() || null,
      })
      .subscribe({
        next: company => {
          this.data.companies.set([company]);
          this.closeSetup();
          this.setupBusy.set(false);
        },
        error: err => {
          const msg = err?.error?.detail ?? err?.error?.title ?? 'Erreur lors de la création.';
          this.setupErr.set(msg);
          this.setupBusy.set(false);
        },
      });
  }

  readonly today = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  readonly company = computed(() => this.data.companies()[0]);

  readonly companyInitials = computed(() => {
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

  readonly activeCount = computed(() => this.jhUsers().filter(u => u.activated).length);
  readonly pendingLeaves = computed(() => this.data.leaves().filter(l => l.status === 'pending').length);
  readonly pendingAdvances = computed(() => this.data.advances().filter(a => a.status === 'pending').length);

  readonly roleDist = computed(() => {
    const users = this.jhUsers();
    const total = users.length || 1;
    const defs = [
      { role: 'ROLE_ADMIN', label: 'Administrateur', desc: 'Accès complet', color: 'primary' },
      { role: 'ROLE_RH_COMPTABLE', label: 'RH / Comptable', desc: 'Paie, congés, employés', color: 'info' },
      { role: 'ROLE_EMPLOYE', label: 'Employé', desc: 'Self-service', color: '' },
    ];
    return defs.map(d => {
      const count = users.filter(u => u.authorities?.includes(d.role)).length;
      return { ...d, count, pct: Math.round((count / total) * 100) };
    });
  });

  ngOnInit(): void {
    this.api.myCompanyUsers().subscribe({ next: u => this.jhUsers.set(u), error: () => {} });
  }
}
