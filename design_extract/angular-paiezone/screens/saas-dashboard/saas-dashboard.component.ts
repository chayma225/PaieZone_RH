import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
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
  protected readonly kpi = this.data.saasKpi;

  protected readonly services = [
    { name: 'API & Authentification', up: true, latency: '42 ms' },
    { name: 'Base de données PostgreSQL', up: true, latency: '8 ms' },
    { name: 'Moteur de paie', up: true, latency: '156 ms' },
    { name: 'Génération PDF (JasperReports)', up: true, latency: '320 ms' },
    { name: 'Assistant IA (Ollama / phi3)', up: true, warn: true, latency: '2.1 s' },
    { name: 'Service Email', up: true, latency: '1.4 s' },
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
      mrr: this.data.companies().filter(c => c.plan === p).reduce((s, c) => s + c.mrr, 0),
      color: ({ STARTER: '#94a3b8', PME: '#0ea5e9', BUSINESS: '#4f46e5', ENTERPRISE: '#f59e0b' })[p],
    }));
  }
}
