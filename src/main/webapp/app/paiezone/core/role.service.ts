import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { AccountService } from 'app/core/auth/account.service';
import type { Role, RoleConfig } from './types';

const ROLES: Record<Role, RoleConfig> = {
  super: {
    label: 'Super Administrateur',
    sub: 'admin@paiezone.tn',
    initials: 'PZ',
    color: 'super',
    tabs: [
      { id: 'saas-dash', label: 'Tableau de bord', icon: 'Home' },
      { id: 'tenants', label: 'Entreprises clientes', icon: 'Building' },
      { id: 'regulatory', label: 'Réglementaire', icon: 'Shield' },
      { id: 'conventions', label: 'Conventions sectorielles', icon: 'Layers' },
    ],
    default: 'saas-dash',
  },
  admin: {
    label: 'Admin entreprise',
    sub: 'Accès complet',
    initials: 'AD',
    color: 'admin',
    tabs: [
      { id: 'admin-dash', label: 'Tableau de bord', icon: 'Home' },
      { id: 'rh-employees', label: 'Employés', icon: 'Users' },
      { id: 'rh-structure', label: 'Structure', icon: 'Briefcase' },
      { id: 'rh-payroll', label: 'Paie', icon: 'Cash' },
      { id: 'rh-finances', label: 'Avances', icon: 'Wallet' },
      { id: 'rh-leaves', label: 'Congés', icon: 'Calendar' },
      { id: 'rh-accounting', label: 'Comptabilité', icon: 'BookOpen' },
      { id: 'admin-company', label: 'Mon entreprise', icon: 'Building' },
      { id: 'admin-users', label: 'Utilisateurs', icon: 'Shield' },
      { id: 'admin-audit', label: 'Audit', icon: 'History' },
    ],
    default: 'admin-dash',
  },
  rh: {
    label: 'RH / Comptable',
    sub: 'Paie · employés · congés',
    initials: 'RH',
    color: 'rh',
    tabs: [
      { id: 'rh-dash', label: 'Tableau de bord', icon: 'Home' },
      { id: 'rh-employees', label: 'Employés', icon: 'Users' },
      { id: 'rh-structure', label: 'Structure', icon: 'Briefcase' },
      { id: 'rh-payroll', label: 'Paie', icon: 'Cash' },
      { id: 'rh-leaves', label: 'Congés', icon: 'Calendar' },
      { id: 'rh-accounting', label: 'Comptabilité', icon: 'BookOpen' },
      { id: 'emp-dash', label: 'Mon espace employé', icon: 'User', separator: true },
    ],
    default: 'rh-dash',
  },
  emp: {
    label: 'Employé',
    sub: 'Self-service',
    initials: 'EM',
    color: 'emp',
    tabs: [
      { id: 'emp-dash', label: 'Tableau de bord', icon: 'Home' },
      { id: 'emp-leaves', label: 'Mes congés', icon: 'Calendar' },
      { id: 'emp-requests', label: 'Mes demandes', icon: 'Doc' },
    ],
    default: 'emp-dash',
  },
};

function authorityToRole(authorities: string[]): Role {
  if (authorities.includes('ROLE_SUPER_ADMIN')) return 'super';
  if (authorities.includes('ROLE_ADMIN')) return 'admin';
  if (authorities.includes('ROLE_RH_COMPTABLE')) return 'rh';
  if (authorities.includes('ROLE_EMPLOYE')) return 'emp';
  // ROLE_USER (JHipster default) → treat as rh for now
  return 'rh';
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly accountService = inject(AccountService);

  readonly current = signal<Role>('rh');
  readonly config = computed<RoleConfig>(() => ROLES[this.current()]);
  readonly allRoles = signal(ROLES);

  constructor() {
    // Auto-set role from JWT authorities when account loads
    effect(() => {
      const account = this.accountService.account();
      if (account?.authorities?.length) {
        this.current.set(authorityToRole(account.authorities));
      }
    });
  }

  switchRole(role: Role): void {
    this.current.set(role);
  }

  roleLabel(role: Role): string {
    return role === 'super' ? 'Super Admin' : role === 'admin' ? 'Admin' : role === 'rh' ? 'RH / Comptable' : 'Employé';
  }

  userInitials(): string {
    const account = this.accountService.account();
    if (!account) return '??';
    const f = account.firstName?.[0] ?? '';
    const l = account.lastName?.[0] ?? '';
    return (f + l).toUpperCase() || (account.login?.[0]?.toUpperCase() ?? '?');
  }

  userLabel(): string {
    const account = this.accountService.account();
    if (!account) return '';
    return [account.firstName, account.lastName].filter(Boolean).join(' ') || account.login;
  }

  userSub(): string {
    const account = this.accountService.account();
    return account?.email ?? this.config().sub;
  }
}
