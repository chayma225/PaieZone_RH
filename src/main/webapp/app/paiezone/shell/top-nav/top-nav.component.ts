import { Component, ChangeDetectionStrategy, signal, inject, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

import IconComponent from '../../core/icon/icon.component';
import { RoleService } from '../../core/role.service';
import { LoginService } from 'app/login/login.service';
import type { Role } from '../../core/types';

@Component({
  selector: 'pz-top-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TopNavComponent {
  protected readonly roleService = inject(RoleService);
  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);

  protected readonly menuOpen = signal(false);

  protected toggleMenu(ev: Event): void {
    ev.stopPropagation();
    this.menuOpen.update(v => !v);
  }

  protected switchRole(role: Role): void {
    this.roleService.switchRole(role);
    const cfg = this.roleService.config();
    this.router.navigate(['/paiezone', cfg.default]);
    this.menuOpen.set(false);
  }

  protected logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click')
  onDocClick(): void {
    if (this.menuOpen()) this.menuOpen.set(false);
  }

  protected readonly roleOptions: { id: Role; title: string; sub: string; icon: string; bg: string }[] = [
    { id: 'super', title: 'Super Administrateur', sub: 'SaaS · tenants & taux légaux', icon: 'Server', bg: '5' },
    { id: 'admin', title: 'Admin entreprise', sub: 'Accès complet : RH + accès + audit', icon: 'Shield', bg: '2' },
    { id: 'rh', title: 'RH / Comptable', sub: 'Paie · employés · congés', icon: 'Briefcase', bg: '4' },
    { id: 'emp', title: 'Employé (self-service)', sub: 'Self-service', icon: 'User', bg: '3' },
  ];
}
