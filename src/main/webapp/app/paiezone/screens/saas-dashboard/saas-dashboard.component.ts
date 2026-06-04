import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';
import { ApiService } from '../../core/api.service';
import type { Company } from '../../core/types';

const MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

@Component({
  selector: 'pz-saas-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './saas-dashboard.component.html',
  styleUrl: './saas-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SaasDashboardComponent {
  protected readonly data = inject(DataService);
  private readonly api = inject(ApiService);

  readonly currentMonth = MONTHS_SHORT[new Date().getMonth()] + ' ' + new Date().getFullYear();

  readonly kpi = computed(() => {
    const companies = this.data.companies();
    const stats = this.data.stats();
    const mrr = companies.reduce((s, c) => s + (c.mrr ?? 0), 0);
    return {
      mrr,
      arr: mrr * 12,
      tenants: (stats['totalCompanies'] as number) ?? companies.length,
      totalEmployees: (stats['totalEmployees'] as number) ?? 0,
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

  // ── Badges dynamiques KPI ───────────────────────────────────────────────

  readonly mrrGrowthPct = computed(() => {
    const vals = this.mrrValues();
    const prev = vals[4];
    const curr = vals[5];
    if (!prev) return 0;
    return Math.round(((curr - prev) / prev) * 100);
  });

  readonly mrrGrowthClass = computed(() => (this.mrrGrowthPct() > 0 ? 'pos' : this.mrrGrowthPct() < 0 ? 'danger' : ''));

  readonly activeCompaniesCount = computed(() => this.data.companies().filter(c => c.status === 'ACTIVE').length);

  readonly activeEmployeesCount = computed(() => (this.data.stats()['activeEmployees'] as number) ?? this.kpi().totalEmployees);

  readonly newCompaniesThisQuarter = computed(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    return this.data.companies().filter(c => c.createdAt && new Date(c.createdAt) >= cutoff).length;
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

  readonly plans = ['STARTER', 'PME', 'BUSINESS', 'ENTERPRISE', 'CUSTOM'];

  downloadReport(): void {
    const companies = this.data.companies();
    const kpi = this.kpi();
    const month = this.currentMonth;

    const headers = ['Entreprise', 'Matricule fiscal', 'Ville', 'Plan', 'Employés', 'MRR (TND)', 'Statut', 'Renouvellement'];
    const rows = companies.map(c => [
      `"${(c.name || c.tradeName || '').replace(/"/g, '""')}"`,
      c.taxId,
      c.city,
      this.data.planLabel(c.plan),
      c.employees,
      c.mrr,
      c.status,
      c.renewal,
    ]);

    const summary = [
      [],
      ['Récapitulatif', month],
      ['MRR total', kpi.mrr],
      ['ARR projeté', kpi.arr],
      ["Nombre d'entreprises", kpi.tenants],
      ['Total employés', kpi.totalEmployees],
    ];

    const csv = [headers.join(';'), ...rows.map(r => r.join(';')), ...summary.map(r => r.join(';'))].join('\n');

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-mensuel-${month.replace(' ', '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  activateCompany(c: Company): void {
    this.api.changePlan(c.id, c.plan || 'STARTER').subscribe({
      next: updated => this.data.companies.update(list => list.map(x => (x.id === updated.id ? updated : x))),
    });
  }

  suspendCompany(c: Company): void {
    this.api.suspendCompany(c.id).subscribe({
      next: updated => this.data.companies.update(list => list.map(x => (x.id === updated.id ? updated : x))),
    });
  }

  changePlan(c: Company, plan: string): void {
    if (!plan) return;
    this.api.changePlan(c.id, plan).subscribe({
      next: updated => this.data.companies.update(list => list.map(x => (x.id === updated.id ? updated : x))),
    });
  }
}
