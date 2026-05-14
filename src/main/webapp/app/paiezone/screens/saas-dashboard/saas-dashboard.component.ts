import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'pz-saas-dashboard',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './saas-dashboard.component.html',
  styleUrl: './saas-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SaasDashboardComponent {
  protected readonly data = inject(DataService);

  protected readonly kpi = computed(() => {
    const companies = this.data.companies();
    const stats = this.data.stats();
    const mrr = companies.reduce((s, c) => s + (c.mrr ?? 0), 0);
    return {
      mrr,
      mrrDelta: 0,
      arr: mrr * 12,
      arrDelta: 0,
      tenants: (stats['totalCompanies'] as number) ?? companies.length,
      tenantsDelta: 0,
      totalEmployees: (stats['totalEmployees'] as number) ?? 0,
      employeesDelta: 0,
      churn: 0,
      uptime: 99.97,
    };
  });

  protected readonly services = [
    { name: 'API & Authentification', up: true, latency: '— ms' },
    { name: 'Base de données PostgreSQL', up: true, latency: '— ms' },
    { name: 'Moteur de paie', up: true, latency: '— ms' },
    { name: 'Génération PDF (JasperReports)', up: true, latency: '— ms' },
    { name: 'Assistant IA (Ollama / phi3)', up: true, warn: true, latency: '— ms' },
    { name: 'Service Email', up: true, latency: '— ms' },
  ];

  protected serviceState(s: { up: boolean; warn?: boolean }): { tone: string; label: string } {
    if (s.warn) return { tone: 'warn', label: 'Dégradé' };
    if (s.up) return { tone: 'pos', label: 'Opérationnel' };
    return { tone: 'danger', label: 'Hors ligne' };
  }

  protected planDistribution() {
    const plans = ['STARTER', 'PME', 'BUSINESS', 'ENTERPRISE'] as const;
    return plans.map(p => ({
      plan: p,
      label: this.data.planLabel(p),
      count: this.data.companies().filter(c => c.plan === p).length,
      mrr: this.data
        .companies()
        .filter(c => c.plan === p)
        .reduce((s, c) => s + c.mrr, 0),
      color: { STARTER: '#94a3b8', PME: '#0ea5e9', BUSINESS: '#4f46e5', ENTERPRISE: '#f59e0b' }[p],
    }));
  }
}
