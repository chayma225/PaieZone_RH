import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { DataService } from './data.service';
import { RoleService } from './role.service';
import type { ContractAlert } from './types';

export interface AppNotification {
  id: string;
  icon: string;
  title: string;
  detail: string;
  urgent: boolean;
  link?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly data = inject(DataService);
  private readonly role = inject(RoleService);
  private readonly http = inject(HttpClient);

  private readonly contractAlerts = signal<AppNotification[]>([]);

  private readonly readIds = signal<Set<string>>(new Set<string>(JSON.parse(localStorage.getItem('pz_notif_read') ?? '[]') as string[]));
  private readonly dismissedIds = signal<Set<string>>(
    new Set<string>(JSON.parse(localStorage.getItem('pz_notif_dismissed') ?? '[]') as string[]),
  );

  constructor() {
    toObservable(this.role.current)
      .pipe(switchMap(r => (r === 'admin' || r === 'rh' ? this.http.get<ContractAlert[]>('/api/dashboard/contract-alerts') : of([]))))
      .subscribe({
        next: alerts => {
          this.contractAlerts.set(
            alerts.map(a => ({
              id: `contract-${a.id}`,
              icon: 'FileText',
              title: a.daysLeft <= 7 ? '⚠️ Contrat expire bientôt' : "Contrat proche de l'expiration",
              detail: `${a.employeeName} · dans ${a.daysLeft} jour(s) (${a.date})`,
              urgent: a.daysLeft <= 7,
              link: '/paiezone/rh-employees',
            })),
          );
        },
        error: () => this.contractAlerts.set([]),
      });
  }

  private readonly allItems = computed<AppNotification[]>(() => {
    const r = this.role.current();
    const list: AppNotification[] = [];

    if (r === 'admin' || r === 'rh') {
      for (const l of this.data.leaves().filter(l => l.status === 'pending')) {
        const emp = this.data.empById(l.empId);
        const name = emp ? this.data.fullName(emp) : `Employé #${l.empId}`;
        list.push({
          id: `leave-${l.id}`,
          icon: 'Calendar',
          title: 'Congé en attente',
          detail: `${name} · ${l.days} jour(s) à partir du ${l.from}`,
          urgent: false,
          link: '/paiezone/rh-leaves',
        });
      }
      for (const a of this.data.advances().filter(a => a.status === 'pending')) {
        const emp = this.data.empById(a.empId);
        const name = emp ? this.data.fullName(emp) : `Employé #${a.empId}`;
        list.push({
          id: `adv-${a.id}`,
          icon: 'Wallet',
          title: 'Avance en attente',
          detail: `${name} · ${this.data.fmtTND(a.amount)}`,
          urgent: false,
          link: '/paiezone/rh-finances',
        });
      }
    }

    if (r === 'emp') {
      const me = this.data.myEmployee();
      if (me) {
        for (const l of this.data.leaves().filter(l => l.empId === me.id && l.status !== 'pending')) {
          list.push({
            id: `leave-${l.id}`,
            icon: 'Calendar',
            title: l.status === 'approved' ? 'Congé approuvé ✓' : 'Congé refusé',
            detail: `${l.days} jour(s) · du ${l.from} au ${l.to}`,
            urgent: l.status === 'rejected',
            link: '/paiezone/emp-leaves',
          });
        }
        for (const a of this.data.advances().filter(a => a.empId === me.id && a.status !== 'pending')) {
          list.push({
            id: `adv-${a.id}`,
            icon: 'Wallet',
            title: a.status === 'approved' ? 'Avance approuvée ✓' : 'Avance refusée',
            detail: this.data.fmtTND(a.amount),
            urgent: a.status === 'rejected',
            link: '/paiezone/emp-requests',
          });
        }
      }
    }

    if (r === 'super') {
      for (const c of this.data.companies().filter(c => c.status === 'TRIAL')) {
        list.push({
          id: `co-${c.id}`,
          icon: 'Building',
          title: "Entreprise en période d'essai",
          detail: `${c.name} · expire le ${c.renewal}`,
          urgent: false,
          link: '/paiezone/tenants',
        });
      }
    }

    return [...list, ...this.contractAlerts()];
  });

  /** Toutes les notifications sauf celles supprimées */
  readonly items = computed<AppNotification[]>(() => {
    const dismissed = this.dismissedIds();
    return this.allItems().filter(n => !dismissed.has(n.id));
  });

  /** Nombre de notifications non lues (badge sur la cloche) */
  readonly count = computed(() => {
    const read = this.readIds();
    return this.items().filter(n => !read.has(n.id)).length;
  });

  isRead(id: string): boolean {
    return this.readIds().has(id);
  }

  markRead(id: string): void {
    this.readIds.update(s => {
      const next = new Set(s);
      next.add(id);
      localStorage.setItem('pz_notif_read', JSON.stringify([...next]));
      return next;
    });
  }

  dismiss(id: string): void {
    this.dismissedIds.update(s => {
      const next = new Set(s);
      next.add(id);
      localStorage.setItem('pz_notif_dismissed', JSON.stringify([...next]));
      return next;
    });
  }
}
