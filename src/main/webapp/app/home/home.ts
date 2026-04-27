import { Component, OnInit, OnDestroy, AfterViewInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, forkJoin, of, catchError } from 'rxjs';

import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { DashboardService, IDashboardStats, IRecentActivity, IPayrollSummary } from './dashboard.service';

@Component({
  selector: 'jhi-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export default class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  private accountService = inject(AccountService);
  private dashboardService = inject(DashboardService);

  // Signal local mis à jour via identity()
  account = signal<Account | null>(null);

  stats = signal<IDashboardStats | null>(null);
  recentActivity = signal<IRecentActivity[]>([]);
  payrollSummary = signal<IPayrollSummary[]>([]);
  loading = signal<boolean>(true);
  currentTime = signal<string>('');
  currentDate = signal<string>('');

  private readonly destroy$ = new Subject<void>();
  private clockInterval?: ReturnType<typeof setInterval>;

  get isSuperAdmin(): boolean {
    return this.account()?.authorities?.includes('ROLE_SUPER_ADMIN') ?? false;
  }
  get isAdmin(): boolean {
    return this.account()?.authorities?.includes('ROLE_ADMIN') ?? false;
  }
  get isRhComptable(): boolean {
    return this.account()?.authorities?.includes('ROLE_RH_COMPTABLE') ?? false;
  }
  get isManager(): boolean {
    return this.account()?.authorities?.includes('ROLE_MANAGER') ?? false;
  }
  get isEmploye(): boolean {
    return this.account()?.authorities?.includes('ROLE_EMPLOYE') ?? false;
  }

  get roleLabel(): string {
    if (this.isSuperAdmin) return 'Super Administrateur';
    if (this.isAdmin) return 'Administrateur';
    if (this.isRhComptable) return 'RH & Comptabilité';
    if (this.isManager) return 'Manager';
    if (this.isEmploye) return 'Employé';
    return 'Utilisateur';
  }

  get roleIcon(): string {
    if (this.isSuperAdmin) return '⚡';
    if (this.isAdmin) return '🛡️';
    if (this.isRhComptable) return '📊';
    if (this.isManager) return '🎯';
    if (this.isEmploye) return '👤';
    return '👤';
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  get firstName(): string {
    return this.account()?.firstName ?? this.account()?.login ?? 'Utilisateur';
  }

  ngOnInit(): void {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);

    // identity() est la méthode standard dans toutes les versions JHipster
    this.accountService
      .identity()
      .pipe(takeUntil(this.destroy$))
      .subscribe((account: Account | null) => {
        this.account.set(account);
        if (account) {
          this.loadDashboardData();
        } else {
          this.loading.set(false);
        }
      });
  }

  ngAfterViewInit(): void {
    // Trigger entrance animations
    setTimeout(() => {
      document.querySelectorAll('.stat-card').forEach((el, i) => {
        (el as HTMLElement).style.animationDelay = `${i * 80}ms`;
        el.classList.add('animate-in');
      });
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  private updateClock(): void {
    const now = new Date();
    this.currentTime.set(now.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    this.currentDate.set(now.toLocaleDateString('fr-TN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }

  private loadDashboardData(): void {
    this.loading.set(true);
    forkJoin({
      stats: this.dashboardService.getStats().pipe(catchError(() => of(this.getMockStats()))),
      activity: this.dashboardService.getRecentActivity().pipe(catchError(() => of(this.getMockActivity()))),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ stats, activity }) => {
        this.stats.set(stats);
        this.recentActivity.set(activity);
        this.loading.set(false);
      });
  }

  // Données mock pendant développement (à retirer en prod)
  private getMockStats(): IDashboardStats {
    return {
      totalEmployees: 87,
      activeEmployees: 82,
      departments: 8,
      positions: 24,
      pendingLeaves: 5,
      approvedLeaves: 12,
      payrollDrafts: 2,
      payrollValidated: 1,
      activeContracts: 79,
      expiringContracts: 3,
      totalCompanies: 14,
      activeSubscriptions: 12,
      auditLogsToday: 47,
      chatSessions: 9,
      pendingAdvances: 4,
      bonusThisMonth: 6,
    };
  }

  private getMockActivity(): IRecentActivity[] {
    return [
      { type: 'LEAVE', message: 'Demande de congé — Ahmed Ben Ali', timestamp: 'Il y a 10 min', severity: 'warning' },
      { type: 'PAYSLIP', message: 'Bulletin généré — Paie Avril 2026', timestamp: 'Il y a 1h', severity: 'success' },
      { type: 'CONTRACT', message: 'Contrat expirant bientôt — Fatma Trabelsi', timestamp: 'Il y a 2h', severity: 'danger' },
      { type: 'AUDIT', message: 'Connexion admin — 192.168.1.10', timestamp: 'Il y a 3h', severity: 'info' },
      { type: 'LEAVE', message: 'Congé approuvé — Mohamed Chaabane', timestamp: 'Hier', severity: 'success' },
    ];
  }

  getSeverityClass(severity: string): string {
    const map: Record<string, string> = {
      info: 'activity-info',
      success: 'activity-success',
      warning: 'activity-warning',
      danger: 'activity-danger',
    };
    return map[severity] ?? 'activity-info';
  }

  getActivityIcon(type: string): string {
    const map: Record<string, string> = {
      LEAVE: '🌴',
      PAYSLIP: '💰',
      CONTRACT: '📋',
      AUDIT: '🔍',
    };
    return map[type] ?? '📌';
  }

  login(): void {
    // Navigué par le RouterModule
  }
}
