import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  RH_COMPTABLE: 'RH',
  MANAGER: 'Manager',
  EMPLOYE: 'Employé',
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Création',
  UPDATE: 'Modification',
  PATCH: 'Modification',
  DELETE: 'Suppression',
  LOGIN: 'Connexion',
  LOGOUT: 'Déconnexion',
  EXPORT: 'Export',
  VALIDATE: 'Validation',
  LOCK: 'Verrouillage',
  APPROVE: 'Approbation',
  REJECT: 'Rejet',
  CALCULATE: 'Calcul paie',
  CALCULATE_PAYROLL: 'Calcul paie',
  TOGGLE_ACTIVE: 'Activation/Désactivation',
  NOTIFICATION_CONTRACT_EXPIRATION: 'Notif. contrat',
  NOTIFICATION_LEAVE: 'Notif. congé',
  NOTIFICATION_PAYROLL: 'Notif. paie',
};

const JHIPSTER_ROLE_MAP: Record<string, string> = {
  ROLE_SUPER_ADMIN: 'SUPER_ADMIN',
  ROLE_ADMIN: 'ADMIN',
  ROLE_RH_COMPTABLE: 'RH_COMPTABLE',
  ROLE_MANAGER: 'MANAGER',
  ROLE_USER: 'EMPLOYE',
};

@Component({
  selector: 'pz-admin-audit',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pz-page">
      <div class="pz-page-head">
        <div>
          <div class="pz-crumbs"><strong>Administration</strong> <span class="sep">/</span> Audit</div>
          <h1>Journal d'audit</h1>
          <div class="pz-muted">Historique des actions réalisées sur la plateforme</div>
        </div>
        <button class="pz-btn" (click)="exportCsv()"><pz-icon name="Download" [size]="14" /> Exporter</button>
      </div>

      <!-- Barre de filtres -->
      <div class="filters-bar">
        <select class="pz-select" [value]="actionFilter()" (change)="actionFilter.set($any($event.target).value)">
          <option value="">Toutes les actions</option>
          @for (a of actions(); track a) {
            <option [value]="a">{{ actionLabel(a) }}</option>
          }
        </select>

        <select class="pz-select" [value]="entityFilter()" (change)="entityFilter.set($any($event.target).value)">
          <option value="">Toutes les entités</option>
          @for (e of entities(); track e) {
            <option [value]="e">{{ e }}</option>
          }
        </select>

        <label class="filter-date-label">Du</label>
        <input
          type="date"
          class="pz-select"
          [value]="dateFrom()"
          (change)="dateFrom.set($any($event.target).value)"
          style="width:140px;cursor:pointer"
        />
        <label class="filter-date-label">Au</label>
        <input
          type="date"
          class="pz-select"
          [value]="dateTo()"
          (change)="dateTo.set($any($event.target).value)"
          style="width:140px;cursor:pointer"
        />

        @if (hasFilters()) {
          <button class="reset-btn" (click)="clearFilters()"><pz-icon name="X" [size]="13" /> Réinitialiser</button>
        }

        <span class="count-badge" style="color:#64748b;">{{ filtered().length }} entrée{{ filtered().length > 1 ? 's' : '' }}</span>
      </div>

      <!-- Tableau -->
      <div class="pz-card no-pad">
        @if (filtered().length === 0) {
          <div class="empty-state">
            <pz-icon name="History" [size]="32" [strokeWidth]="1.2" />
            <div class="empty-title">{{ data.audit().length === 0 ? 'Journal vide' : 'Aucun résultat' }}</div>
            <div class="empty-sub">
              {{
                data.audit().length === 0
                  ? 'Les actions seront enregistrées automatiquement'
                  : 'Modifiez les filtres pour afficher des entrées'
              }}
            </div>
          </div>
        } @else {
          <table class="pz-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Action</th>
                <th>Entité</th>
                <th>Détail</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              @for (entry of filtered(); track entry.id) {
                <tr class="entry-row" [class.expanded]="expandedId() === entry.id" (click)="toggleDetail(entry.id)">
                  <td class="col-date pz-mono">{{ entry.date }}</td>

                  <!-- Utilisateur -->
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar" [class]="isScheduler(entry) ? 'av-sys' : 'av-' + avatarIdx(entry.id)">
                        @if (isScheduler(entry)) {
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            width="14"
                            height="14"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <rect x="3" y="5" width="10" height="8" rx="1.5" />
                            <path d="M8 2v3M5.5 8.5h.01M10.5 8.5h.01M6 11h4" />
                            <path d="M2 9v2M14 9v2" />
                          </svg>
                        } @else {
                          {{ initials(displayName(entry)) }}
                        }
                      </div>
                      <div>
                        <div class="user-name" style="color:#0f172a;">{{ displayName(entry) }}</div>
                        @if (displayLogin(entry)) {
                          <div class="user-login pz-mono">{{ displayLogin(entry) }}</div>
                        }
                      </div>
                    </div>
                  </td>

                  <!-- Rôle -->
                  <td>
                    @let role = resolvedRole(entry);
                    @if (role) {
                      <span class="role-pill" [ngClass]="roleClass(role)">
                        {{ roleLabel(role) }}
                      </span>
                    } @else {
                      <span class="role-pill role-emp" style="color:#64748b;">—</span>
                    }
                  </td>

                  <!-- Action -->
                  <td>
                    <span
                      class="action-badge"
                      [class.del]="entry.action === 'DELETE'"
                      [class.create]="entry.action === 'CREATE'"
                      [class.upd]="entry.action === 'UPDATE' || entry.action === 'PATCH'"
                      [class.auth]="entry.action === 'LOGIN' || entry.action === 'LOGOUT'"
                    >
                      {{ actionLabel(entry.action) || entry.action || '—' }}
                    </span>
                  </td>

                  <!-- Entité -->
                  <td class="col-entity" style="color:#334155;">
                    {{ entry.entity }}
                    @if (entry.entityId) {
                      <span class="entity-id pz-mono" style="color:#94a3b8;">#{{ entry.entityId }}</span>
                    }
                  </td>

                  <!-- Détail -->
                  <td class="col-detail">
                    <span class="detail-text" [class.full]="expandedId() === entry.id" style="color:#334155;">{{
                      humanDetail(entry)
                    }}</span>
                  </td>

                  <!-- IP -->
                  <td class="col-ip pz-mono" style="color:#94a3b8;">
                    @if (isScheduler(entry)) {
                      <span style="color:#94a3b8;font-style:italic;">auto</span>
                    } @else {
                      {{ entry.ip || '—' }}
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      /* ── Filters bar ── */
      .filters-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }

      .filter-search {
        display: flex;
        align-items: center;
        gap: 8px;
        height: 36px;
        padding: 0 12px;
        border: 1px solid var(--pz-line);
        border-radius: 8px;
        background: var(--pz-surface-2);
        flex: 1;
        min-width: 200px;
        cursor: text;
      }
      .filter-search input {
        border: none;
        background: transparent;
        outline: none;
        font-size: 13px;
        color: var(--pz-ink);
        width: 100%;
      }
      .filter-search input::placeholder {
        color: var(--pz-muted);
      }

      .pz-select {
        height: 36px;
        padding: 0 10px;
        border: 1px solid var(--pz-line);
        border-radius: 8px;
        background: var(--pz-surface-2);
        color: var(--pz-ink);
        font-size: 13px;
        cursor: pointer;
        outline: none;
      }

      .filter-date-label {
        font-size: 12px;
        color: var(--pz-muted);
        white-space: nowrap;
        padding: 0 2px;
      }

      .reset-btn {
        display: flex;
        align-items: center;
        gap: 5px;
        height: 36px;
        padding: 0 12px;
        border: 1px solid var(--pz-line);
        border-radius: 8px;
        background: transparent;
        color: var(--pz-muted);
        font-size: 13px;
        cursor: pointer;
      }
      .reset-btn:hover {
        background: var(--pz-surface-3);
      }

      .count-badge {
        margin-left: auto;
        font-size: 12px;
        color: var(--pz-muted);
        white-space: nowrap;
      }

      /* ── Empty state ── */
      .empty-state {
        padding: 60px;
        text-align: center;
        color: var(--pz-muted);
      }
      .empty-title {
        margin-top: 12px;
        font-size: 14px;
        font-weight: 500;
        color: var(--pz-ink);
      }
      .empty-sub {
        margin-top: 4px;
        font-size: 13px;
      }

      /* ── Table ── */
      .no-pad {
        padding: 0;
        overflow: hidden;
      }

      .pz-table {
        width: 100%;
        border-collapse: collapse;
      }
      .pz-table th {
        text-align: left;
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        padding: 10px 16px;
        border-bottom: 1px solid #e2e8f0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
      }
      .pz-table td {
        padding: 11px 16px;
        border-bottom: 1px solid #e2e8f0;
        font-size: 13px;
        vertical-align: middle;
        color: #0f172a;
      }
      .pz-table tr:last-child td {
        border-bottom: 0;
      }

      .entry-row {
        cursor: pointer;
        transition: background 0.1s;
      }
      .entry-row:hover td {
        background: var(--pz-surface-3);
      }
      .entry-row.expanded td {
        background: var(--pz-surface-3);
      }

      /* ── Columns ── */
      .col-date {
        font-size: 11.5px;
        color: #64748b;
        white-space: nowrap;
      }
      .col-ip {
        font-size: 11.5px;
        color: #94a3b8;
        white-space: nowrap;
      }
      .col-entity {
        font-size: 12.5px;
        white-space: nowrap;
      }
      .entity-id {
        font-size: 11px;
        color: var(--pz-muted);
        margin-left: 4px;
      }
      .col-detail {
        max-width: 240px;
      }

      /* ── User cell ── */
      .user-cell {
        display: flex;
        align-items: center;
        gap: 9px;
      }
      .user-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .av-1 {
        background: #dbeafe;
        color: #1e40af;
      }
      .av-2 {
        background: #dcfce7;
        color: #166534;
      }
      .av-3 {
        background: #fef3c7;
        color: #92400e;
      }
      .av-4 {
        background: #fce7f3;
        color: #9d174d;
      }
      .av-5 {
        background: #ede9fe;
        color: #5b21b6;
      }
      .av-6 {
        background: #ffedd5;
        color: #9a3412;
      }
      .av-sys {
        background: #f1f5f9;
        color: #64748b;
        border: 1px solid #e2e8f0;
      }

      .user-name {
        font-weight: 500;
        font-size: 13px;
        line-height: 1.3;
      }
      .user-login {
        font-size: 11px;
        color: var(--pz-muted);
      }

      /* ── Role pill ── */
      .role-pill {
        display: inline-block;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 9px;
        border-radius: 20px;
        white-space: nowrap;
      }
      .role-super {
        background: #fef2f2;
        color: #991b1b;
      }
      .role-admin {
        background: #fee2e2;
        color: #b91c1c;
      }
      .role-rh {
        background: #dbeafe;
        color: #1d4ed8;
      }
      .role-mgr {
        background: #fef3c7;
        color: #92400e;
      }
      .role-emp {
        background: #f1f5f9;
        color: #475569;
      }
      .role-sys {
        background: #f8fafc;
        color: #94a3b8;
        border: 1px solid var(--pz-line);
      }

      /* ── Action badge ── */
      .action-badge {
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
        background: var(--pz-primary-soft);
        color: var(--pz-primary-ink);
        white-space: nowrap;
      }
      .action-badge.del {
        background: #fee2e2;
        color: #b91c1c;
      }
      .action-badge.create {
        background: #dcfce7;
        color: #166534;
      }
      .action-badge.upd {
        background: #dbeafe;
        color: #1d4ed8;
      }
      .action-badge.auth {
        background: #f1f5f9;
        color: #475569;
      }

      /* ── Detail ── */
      .detail-text {
        font-size: 12.5px;
        color: var(--pz-ink-2);
        font-family: inherit;
      }
    `,
  ],
})
export default class AdminAuditComponent {
  protected readonly data = inject(DataService);
  private readonly api = inject(ApiService);

  protected readonly actionFilter = signal('');
  protected readonly entityFilter = signal('');
  protected readonly dateFrom = signal('');
  protected readonly dateTo = signal('');
  protected readonly expandedId = signal<number | null>(null);

  private readonly userNames = signal<Map<string, string>>(new Map());
  private readonly userRoles = signal<Map<string, string>>(new Map());

  protected readonly filtered = computed(() => {
    let list = this.data.audit();
    const action = this.actionFilter();
    const entity = this.entityFilter();
    const from = this.dateFrom();
    const to = this.dateTo();

    if (action) list = list.filter(e => e.action === action);
    if (entity) list = list.filter(e => e.entity === entity);
    if (from) list = list.filter(e => e.date >= from);
    if (to) list = list.filter(e => e.date <= to + 'T23:59:59');

    return list;
  });

  protected readonly actions = computed(() =>
    [
      ...new Set(
        this.data
          .audit()
          .map(e => e.action)
          .filter(Boolean),
      ),
    ].sort(),
  );

  protected readonly entities = computed(() =>
    [
      ...new Set(
        this.data
          .audit()
          .map(e => e.entity)
          .filter(Boolean),
      ),
    ].sort(),
  );

  protected readonly hasFilters = computed(() => !!(this.actionFilter() || this.entityFilter() || this.dateFrom() || this.dateTo()));

  constructor() {
    this.data.loadAudit();
    this.api.adminUsers().subscribe({
      next: users => {
        const names = new Map<string, string>();
        const roles = new Map<string, string>();
        for (const u of users) {
          const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.login;
          names.set(u.login, name);
          const auths: string[] = u.authorities ?? [];
          const mapped = auths
            .filter((a: string) => a !== 'ROLE_USER')
            .map((a: string) => JHIPSTER_ROLE_MAP[a] ?? a)
            .filter(Boolean);
          if (mapped.length > 0) roles.set(u.login, mapped[0]);
        }
        this.userNames.set(names);
        this.userRoles.set(roles);
      },
      error: () => {},
    });
  }

  protected isScheduler(entry: { ip: string; action: string }): boolean {
    return entry.ip === 'SYSTEM_SCHEDULER' || entry.action.startsWith('NOTIFICATION_');
  }

  /** Nom affiché dans la colonne Utilisateur */
  protected displayName(entry: { user: string; ip: string; action: string }): string {
    // Entrée scheduler avec un user déjà résolu → afficher ce user
    if (this.isScheduler(entry) && entry.user && entry.user !== 'system') {
      return this.userNames().get(entry.user) ?? entry.user;
    }
    // Entrée scheduler sans user → fallback sur l'admin de la company courante
    if (this.isScheduler(entry)) {
      const company = this.data.companies()[0];
      const adminLogin = company?.adminLogin;
      if (adminLogin) {
        const adminName = this.userNames().get(adminLogin);
        return adminName ?? adminLogin;
      }
      return 'Système';
    }
    if (!entry.user || entry.user === 'system') return 'Compte système';
    return this.userNames().get(entry.user) ?? entry.user;
  }

  /** Login secondaire (affiché en petit sous le nom) */
  protected displayLogin(entry: { user: string; ip: string; action: string }): string | null {
    if (this.isScheduler(entry)) {
      // Montrer le login admin comme sous-titre pour les notifications
      const adminLogin = this.data.companies()[0]?.adminLogin;
      return adminLogin ?? null;
    }
    if (!entry.user || entry.user === 'system') return null;
    const full = this.userNames().get(entry.user);
    return full ? entry.user : null;
  }

  /** Rôle résolu : backend → sinon map adminUsers */
  protected resolvedRole(entry: { user: string; role: string; ip: string; action: string }): string {
    if (this.isScheduler(entry)) return 'SYSTEM';
    return entry.role || this.userRoles().get(entry.user) || '';
  }

  /** Export CSV du journal filtré */
  protected exportCsv(): void {
    const rows = this.filtered();
    if (rows.length === 0) return;

    const headers = ['Date', 'Utilisateur', 'Login', 'Rôle', 'Action', 'Entité', 'ID Entité', 'Détail', 'IP'];

    const escape = (v: string) => '"' + String(v ?? '').replace(/"/g, '""') + '"';

    const lines = rows.map(e =>
      [
        e.date,
        this.displayName(e),
        this.isScheduler(e) ? 'scheduler' : e.user,
        this.roleLabel(this.resolvedRole(e)),
        this.actionLabel(e.action) || e.action,
        e.entity,
        e.entityId,
        e.detail,
        e.ip,
      ]
        .map(escape)
        .join(';'),
    );

    const bom = '﻿'; // BOM UTF-8 pour Excel
    const csv = bom + [headers.map(escape).join(';'), ...lines].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Génère une phrase en français décrivant l'action */
  protected humanDetail(e: { action: string; entity: string; entityId: string }): string {
    const entityFr: Record<string, string> = {
      employee: 'employé',
      employees: 'employé',
      company: 'entreprise',
      companies: 'entreprise',
      payrollperiod: 'période de paie',
      payroll_period: 'période de paie',
      payslip: 'bulletin de paie',
      pay_slip: 'bulletin de paie',
      leave: 'demande de congé',
      leaverequest: 'demande de congé',
      advance: 'avance sur salaire',
      contract: 'contrat',
      user: 'utilisateur',
      userprofile: 'profil utilisateur',
      bonus: 'prime',
      auditlog: "journal d'audit",
      department: 'département',
      departments: 'département',
    };
    const nom = entityFr[(e.entity ?? '').toLowerCase()] ?? (e.entity || 'enregistrement');
    const id = e.entityId ? ` #${e.entityId}` : '';
    switch ((e.action ?? '').toUpperCase()) {
      case 'CREATE':
        return `Création d'un ${nom}${id}`;
      case 'UPDATE':
      case 'PATCH':
        return `Modification du ${nom}${id}`;
      case 'DELETE':
        return `Suppression du ${nom}${id}`;
      case 'LOGIN':
        return `Connexion au compte`;
      case 'LOGOUT':
        return `Déconnexion du compte`;
      case 'EXPORT':
        return `Export ${nom}`;
      case 'CALCULATE':
      case 'CALCULATE_PAYROLL':
        return `Calcul de la paie — ${nom}${id}`;
      case 'TOGGLE_ACTIVE':
        return `Activation/Désactivation du ${nom}${id}`;
      case 'VALIDATE':
        return `Validation du ${nom}${id}`;
      case 'LOCK':
        return `Verrouillage du ${nom}${id}`;
      case 'APPROVE':
        return `Approbation de la ${nom}${id}`;
      case 'REJECT':
        return `Rejet de la ${nom}${id}`;
      case 'NOTIFICATION_CONTRACT_EXPIRATION':
        return `Notification expiration contrat${id}`;
      case 'NOTIFICATION_LEAVE':
        return `Notification demande de congé${id}`;
      case 'NOTIFICATION_PAYROLL':
        return `Notification bulletin de paie${id}`;
      default: {
        if ((e.action ?? '').startsWith('NOTIFICATION_')) return `Notification automatique${id}`;
        return e.action ? `${ACTION_LABELS[e.action] ?? e.action} — ${nom}${id}` : '—';
      }
    }
  }

  protected roleLabel(role: string): string {
    if (role === 'SYSTEM') return 'Système';
    return ROLE_LABELS[role] ?? role;
  }

  protected roleClass(role: string): string {
    if (role === 'SYSTEM') return 'role-sys';
    if (role === 'SUPER_ADMIN') return 'role-super';
    if (role === 'ADMIN') return 'role-admin';
    if (role === 'RH_COMPTABLE') return 'role-rh';
    if (role === 'MANAGER') return 'role-mgr';
    return 'role-emp';
  }

  protected actionLabel(action: string): string {
    return ACTION_LABELS[action] ?? action;
  }

  protected initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  protected avatarIdx(id: number): number {
    return ((id * 31) % 6) + 1;
  }

  protected toggleDetail(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  protected clearFilters(): void {
    this.actionFilter.set('');
    this.entityFilter.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
  }
}
