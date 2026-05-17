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
        <button class="pz-btn"><pz-icon name="Download" [size]="14" /> Exporter</button>
      </div>

      <!-- Barre de filtres -->
      <div class="filters-bar">
        <label class="filter-search">
          <pz-icon name="Search" [size]="14" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur…"
            [value]="searchQ()"
            (input)="searchQ.set($any($event.target).value)"
          />
        </label>

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

        @if (hasFilters()) {
          <button class="reset-btn" (click)="clearFilters()"><pz-icon name="X" [size]="13" /> Réinitialiser</button>
        }

        <span class="count-badge">{{ filtered().length }} entrée{{ filtered().length > 1 ? 's' : '' }}</span>
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
                      <div class="user-avatar" [class]="'av-' + avatarIdx(entry.id)">
                        {{ initials(userName(entry.user)) }}
                      </div>
                      <div>
                        <div class="user-name">{{ userName(entry.user) }}</div>
                        @if (userName(entry.user) !== entry.user && entry.user !== 'system') {
                          <div class="user-login pz-mono">{{ entry.user }}</div>
                        }
                      </div>
                    </div>
                  </td>

                  <!-- Rôle -->
                  <td>
                    @if (entry.role) {
                      <span class="role-pill" [ngClass]="roleClass(entry.role)">
                        {{ roleLabel(entry.role) }}
                      </span>
                    } @else {
                      <span class="role-pill role-sys">Système</span>
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
                  <td class="col-entity">
                    {{ entry.entity }}
                    @if (entry.entityId) {
                      <span class="entity-id pz-mono">#{{ entry.entityId }}</span>
                    }
                  </td>

                  <!-- Détail -->
                  <td class="col-detail">
                    @if (entry.detail) {
                      <code class="detail-text" [class.full]="expandedId() === entry.id">{{ entry.detail }}</code>
                    } @else {
                      <span class="pz-muted">—</span>
                    }
                  </td>

                  <!-- IP -->
                  <td class="col-ip pz-mono">{{ entry.ip || '—' }}</td>
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
        color: var(--pz-muted);
        padding: 10px 16px;
        border-bottom: 1px solid var(--pz-line);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
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
        color: var(--pz-muted);
        white-space: nowrap;
      }
      .col-ip {
        font-size: 11.5px;
        color: var(--pz-muted);
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
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        font-size: 11px;
        color: var(--pz-muted);
        font-family: 'Courier New', monospace;
        word-break: break-all;
      }
      .detail-text.full {
        display: block;
        -webkit-line-clamp: unset;
        overflow: visible;
        white-space: pre-wrap;
        color: var(--pz-ink);
        font-size: 11px;
      }
    `,
  ],
})
export default class AdminAuditComponent {
  protected readonly data = inject(DataService);
  private readonly api = inject(ApiService);

  protected readonly searchQ = signal('');
  protected readonly actionFilter = signal('');
  protected readonly entityFilter = signal('');
  protected readonly expandedId = signal<number | null>(null);

  private readonly userNames = signal<Map<string, string>>(new Map());

  protected readonly filtered = computed(() => {
    let list = this.data.audit();
    const q = this.searchQ().toLowerCase();
    const action = this.actionFilter();
    const entity = this.entityFilter();

    if (q) {
      list = list.filter(e => e.user.toLowerCase().includes(q) || (this.userNames().get(e.user) ?? '').toLowerCase().includes(q));
    }
    if (action) list = list.filter(e => e.action === action);
    if (entity) list = list.filter(e => e.entity === entity);

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

  protected readonly hasFilters = computed(() => !!(this.searchQ() || this.actionFilter() || this.entityFilter()));

  constructor() {
    this.data.loadAudit();
    this.api.adminUsers().subscribe({
      next: users => {
        const map = new Map<string, string>();
        for (const u of users) {
          const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.login;
          map.set(u.login, name);
        }
        this.userNames.set(map);
      },
      error: () => {},
    });
  }

  protected userName(login: string): string {
    if (!login || login === 'system') return 'Système';
    return this.userNames().get(login) ?? login;
  }

  protected roleLabel(role: string): string {
    return ROLE_LABELS[role] ?? role;
  }

  protected roleClass(role: string): string {
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
    this.searchQ.set('');
    this.actionFilter.set('');
    this.entityFilter.set('');
  }
}
