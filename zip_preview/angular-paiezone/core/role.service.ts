import { Injectable, signal, computed } from '@angular/core';
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
    ],
    default: 'saas-dash',
  },
  admin: {
    label: 'Admin entreprise — Atlas Tech',
    sub: 'mehdi.trabelsi@atlas-tech.tn',
    initials: 'MT',
    color: 'admin',
    tabs: [
      { id: 'admin-dash', label: 'Tableau de bord', icon: 'Home' },
      { id: 'rh-employees', label: 'Employés', icon: 'Users' },
      { id: 'rh-structure', label: 'Structure', icon: 'Briefcase' },
      { id: 'rh-payroll', label: 'Paie', icon: 'Cash' },
      { id: 'rh-finances', label: 'Finances RH', icon: 'Wallet', badge: 2 },
      { id: 'rh-leaves', label: 'Congés', icon: 'Calendar', badge: 4 },
      { id: 'admin-company', label: 'Mon entreprise', icon: 'Building' },
      { id: 'admin-users', label: 'Utilisateurs', icon: 'Shield' },
      { id: 'admin-audit', label: 'Audit', icon: 'History' },
    ],
    default: 'admin-dash',
  },
  rh: {
    label: 'RH / Comptable — Atlas Tech',
    sub: 'leila.chaabane@atlas-tech.tn',
    initials: 'LC',
    color: 'rh',
    tabs: [
      { id: 'rh-dash', label: 'Tableau de bord', icon: 'Home' },
      { id: 'rh-employees', label: 'Employés', icon: 'Users' },
      { id: 'rh-structure', label: 'Structure', icon: 'Briefcase' },
      { id: 'rh-payroll', label: 'Paie', icon: 'Cash' },
      { id: 'rh-finances', label: 'Finances RH', icon: 'Wallet', badge: 2 },
      { id: 'rh-leaves', label: 'Congés', icon: 'Calendar', badge: 4 },
    ],
    default: 'rh-dash',
  },
  emp: {
    label: 'Mehdi Ben Salah',
    sub: 'Lead Développeur · Engineering',
    initials: 'MB',
    color: 'emp',
    tabs: [
      { id: 'emp-dash', label: 'Tableau de bord', icon: 'Home' },
      { id: 'emp-leaves', label: 'Mes congés', icon: 'Calendar' },
      { id: 'emp-requests', label: 'Mes demandes', icon: 'Doc' },
    ],
    default: 'emp-dash',
  },
};

@Injectable({ providedIn: 'root' })
export class RoleService {
  readonly current = signal<Role>('rh');
  readonly config = computed<RoleConfig>(() => ROLES[this.current()]);
  readonly allRoles = signal(ROLES);

  switchRole(role: Role): void {
    this.current.set(role);
  }

  roleLabel(role: Role): string {
    return role === 'super' ? 'Super Admin'
      : role === 'admin' ? 'Admin'
      : role === 'rh' ? 'RH / Comptable'
      : 'Employé';
  }
}
