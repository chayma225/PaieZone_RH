import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';

const MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

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

  readonly currentMonth = MONTHS_SHORT[new Date().getMonth()] + ' ' + new Date().getFullYear();

  readonly kpi = computed(() => {
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

  readonly services = [
    { name: 'API & Authentification', up: true, latency: '— ms' },
    { name: 'Base de données PostgreSQL', up: true, latency: '— ms' },
    { name: 'Moteur de paie', up: true, latency: '— ms' },
    { name: 'Génération PDF (JasperReports)', up: true, latency: '— ms' },
    { name: 'Assistant IA (Ollama / phi3)', up: true, warn: true, latency: '— ms' },
    { name: 'Service Email', up: true, latency: '— ms' },
  ];

  serviceState(s: { up: boolean; warn?: boolean }): { tone: string; label: string } {
    if (s.warn) return { tone: 'warn', label: 'Dégradé' };
    if (s.up) return { tone: 'pos', label: 'Opérationnel' };
    return { tone: 'danger', label: 'Hors ligne' };
  }

  // ── Histogramme ─────────────────────────────────────────────────────────────

  readonly planDistribution = computed(() => {
    const plans = ['STARTER', 'PME', 'BUSINESS', 'ENTERPRISE'] as const;
    const colors: Record<string, string> = {
      STARTER: '#94a3b8',
      PME: '#0ea5e9',
      BUSINESS: '#4f46e5',
      ENTERPRISE: '#f59e0b',
    };
    return plans.map(p => ({
      plan: p,
      label: this.data.planLabel(p),
      count: this.data.companies().filter(c => c.plan === p).length,
      mrr: this.data
        .companies()
        .filter(c => c.plan === p)
        .reduce((s, c) => s + c.mrr, 0),
      color: colors[p],
    }));
  });

  readonly maxPlanCount = computed(() => Math.max(1, ...this.planDistribution().map(p => p.count)));

  // ── Courbe MRR ──────────────────────────────────────────────────────────────
  // 6 mois glissants — simulation basée sur MRR actuel

  readonly mrrLabels = computed<string[]>(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return MONTHS_SHORT[d.getMonth()];
    });
  });

  readonly mrrValues = computed<number[]>(() => {
    const current = this.kpi().mrr;
    if (current === 0) return [0, 0, 0, 0, 0, 0];
    // croissance simulée de 5-15% par mois en retour arrière
    return Array.from({ length: 6 }, (_, i) => {
      const factor = Math.pow(0.88, 5 - i);
      return Math.round(current * factor);
    });
  });

  readonly mrrPoints = computed(() => {
    const vals = this.mrrValues();
    const maxV = Math.max(1, ...vals);
    const minX = 50,
      maxX = 300,
      minY = 15,
      maxY = 105;
    return vals.map((v, i) => ({
      x: minX + i * ((maxX - minX) / 5),
      y: maxY - (v / maxV) * (maxY - minY),
    }));
  });

  readonly mrrLinePoints = computed(() =>
    this.mrrPoints()
      .map(p => `${p.x},${p.y}`)
      .join(' '),
  );

  readonly mrrAreaPoints = computed(() => {
    const pts = this.mrrPoints();
    if (pts.length === 0) return '';
    const first = pts[0],
      last = pts[pts.length - 1];
    return [`${first.x},105`, ...pts.map(p => `${p.x},${p.y}`), `${last.x},105`].join(' ');
  });
}
