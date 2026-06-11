import { Component, ChangeDetectionStrategy, signal, inject, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

import IconComponent from '../../core/icon/icon.component';
import { RoleService } from '../../core/role.service';
import { NotificationService } from '../../core/notification.service';
import { DataService } from '../../core/data.service';
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
  protected readonly notif = inject(NotificationService);
  protected readonly data = inject(DataService);
  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);

  protected readonly menuOpen = signal(false);
  protected readonly notifOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.data.searchQuery.set(''));
  }

  protected onSearch(q: string): void {
    this.data.searchQuery.set(q);
  }

  protected toggleMenu(ev: Event): void {
    ev.stopPropagation();
    this.notifOpen.set(false);
    this.menuOpen.update(v => !v);
  }

  protected toggleNotif(ev: Event): void {
    ev.stopPropagation();
    this.menuOpen.set(false);
    this.notifOpen.update(v => !v);
  }

  protected switchRole(role: Role): void {
    this.roleService.switchRole(role);
    const cfg = this.roleService.config();
    this.router.navigate(['/paiezone', cfg.default]);
    this.menuOpen.set(false);
  }

  protected logout(): void {
    this.loginService.logout();
    this.router.navigate(['/paiezone/welcome']);
  }

  protected goNotif(id: string, link: string | undefined): void {
    this.notif.markRead(id);
    if (!link) return;
    this.notifOpen.set(false);
    this.router.navigate([link]);
  }

  protected dismissNotif(id: string, ev: Event): void {
    ev.stopPropagation();
    this.notif.dismiss(id);
  }

  @HostListener('document:click')
  onDocClick(): void {
    if (this.menuOpen()) this.menuOpen.set(false);
    if (this.notifOpen()) this.notifOpen.set(false);
  }

  protected readonly roleOptions: { id: Role; title: string; sub: string; icon: string; bg: string }[] = [
    { id: 'super', title: 'Super Administrateur', sub: 'SaaS · tenants & taux légaux', icon: 'Server', bg: '5' },
    { id: 'admin', title: 'Admin entreprise', sub: 'Accès complet : RH + accès + audit', icon: 'Shield', bg: '2' },
    { id: 'rh', title: 'RH / Comptable', sub: 'Paie · employés · congés', icon: 'Briefcase', bg: '4' },
    { id: 'emp', title: 'Employé (self-service)', sub: 'Self-service', icon: 'User', bg: '3' },
  ];
}
