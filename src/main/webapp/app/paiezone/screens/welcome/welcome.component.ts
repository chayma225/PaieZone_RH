import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';

// ── Contenu marketing — tableau TypeScript, pas de strings hardcodées en template ──
const FEATURES = [
  {
    icon: 'Cash',
    title: 'Paie 100% conforme LF 2026',
    desc: 'CNSS, CAVIS, CSS, IRPP — barèmes mis à jour automatiquement par notre équipe juridique.',
  },
  {
    icon: 'Sparkles',
    title: 'Assistant IA juridique',
    desc: 'RAG sur le Code du Travail tunisien — réponses instantanées avec sources citées.',
  },
  {
    icon: 'Users',
    title: 'Self-service employés',
    desc: 'Vos collaborateurs accèdent à leurs bulletins, posent leurs congés et demandent leurs avances.',
  },
  {
    icon: 'Shield',
    title: 'Multi-tenant sécurisé',
    desc: "Isolation par schéma PostgreSQL, RBAC complet, journal d'audit 7 ans.",
  },
  {
    icon: 'Pdf',
    title: 'Bulletins PDF automatisés',
    desc: 'Génération JasperReports + envoi par email, signature électronique en option.',
  },
  {
    icon: 'Download',
    title: 'Export CNSS & CNAM',
    desc: 'Déclarations trimestrielles en XML et PDF, prêtes à téléverser sur les portails officiels.',
  },
];

// Fonctionnalités par plan (contenu commercial fixe)
const PLAN_FEATURES: Record<string, string[]> = {
  STARTER: ["Jusqu'à 10 employés", 'Paie + congés', 'Bulletins PDF', 'Support email'],
  PME: ["Jusqu'à 30 employés", 'Tout Starter +', 'Avances & primes', 'Multi-utilisateurs', 'Support prioritaire'],
  BUSINESS: ["Jusqu'à 100 employés", 'Tout PME +', 'Assistant IA RH', 'Export CNSS/CNAM', 'API REST'],
  ENTERPRISE: ["Jusqu'à 500 employés", 'Tout Business +', '2FA obligatoire', 'SLA 99.95%', 'Account manager dédié'],
};

// Couleurs via CSS vars — pas de hex
const PLAN_COLORS: Record<string, string> = {
  STARTER: 'var(--pz-muted)',
  PME: 'var(--pz-info)',
  BUSINESS: 'var(--pz-primary)',
  ENTERPRISE: 'var(--pz-warn)',
};

// Fallbacks si les données API ne sont pas chargées (page publique)
const FALLBACK_EMPLOYEES = [
  { name: 'Mehdi Ben Salah', salary: 3245.15, faded: false },
  { name: 'Leila Chaâbane', salary: 3680.0, faded: false },
  { name: 'Amal Trabelsi', salary: 2140.2, faded: false },
  { name: 'Yassine Khelifi', salary: 1895.0, faded: true },
];

const FALLBACK_COMPANIES = ['Atlas Tech', 'Sahel Media', 'Carthago Industries', 'Olea Pharma', 'Djerba Agro', 'Kairouan Log.'];

@Component({
  selector: 'pz-welcome',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WelcomeComponent {
  protected readonly data = inject(DataService);
  protected readonly FEATURES = FEATURES;
  protected readonly currentYear = new Date().getFullYear();

  // ── Plans — prix et limites depuis DataService.planLimits ──────────────────
  protected readonly plans = computed(() => {
    const limits = this.data.planLimits;
    return ['STARTER', 'PME', 'BUSINESS', 'ENTERPRISE'].map(code => ({
      code,
      label: (limits[code]?.label ?? code).replace(' (Essai)', ''),
      price: limits[code]?.price ?? 0,
      period: (limits[code]?.price ?? 0) === 0 ? '14 jours' : 'mois',
      max: limits[code]?.maxEmployees ?? 10,
      color: PLAN_COLORS[code] ?? 'var(--pz-muted)',
      popular: code === 'BUSINESS',
      features: PLAN_FEATURES[code] ?? [],
    }));
  });

  // ── Hero preview — vrais employés si chargés, sinon fallback ──────────────
  protected readonly heroEmployees = computed(() => {
    const emps = this.data.employees();
    if (emps.length >= 2) {
      return emps.slice(0, 4).map((e, i) => ({
        name: `${e.first} ${e.last}`.trim() || e.matricule,
        salary: e.salary > 0 ? e.salary : null,
        faded: i === 3,
      }));
    }
    return FALLBACK_EMPLOYEES;
  });

  // ── Masse salariale — dernier bulletin ou fallback ─────────────────────────
  protected readonly heroMasse = computed(() => {
    const period = this.data.payrollPeriods()[0];
    return period?.gross > 0 ? period.gross : 96400;
  });

  protected readonly heroMasseNum = computed(() => new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 0 }).format(this.heroMasse()));

  protected readonly heroMasseDelta = computed(() => {
    const periods = this.data.payrollPeriods();
    if (periods.length >= 2 && periods[0].gross > 0 && periods[1].gross > 0) {
      const d = ((periods[0].gross - periods[1].gross) / periods[1].gross) * 100;
      return (d >= 0 ? '+' : '') + d.toFixed(1) + '%';
    }
    return '+1.7%';
  });

  protected readonly heroMasseDeltaPos = computed(() => {
    const periods = this.data.payrollPeriods();
    if (periods.length >= 2 && periods[0].gross > 0 && periods[1].gross > 0) {
      return periods[0].gross >= periods[1].gross;
    }
    return true;
  });

  protected readonly heroPeriodLabel = computed(() => {
    const period = this.data.payrollPeriods()[0];
    if (period) return `${period.label} — Bulletins de paie`;
    const now = new Date();
    const months = ['Janv.', 'Fév.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
    return `${months[now.getMonth()]} ${now.getFullYear()} — Bulletins de paie`;
  });

  // ── Trust band — vraies entreprises ou fallback ────────────────────────────
  protected readonly trustNames = computed(() => {
    const companies = this.data.companies();
    if (companies.length >= 3) return companies.slice(0, 6).map(c => c.tradeName || c.name);
    return FALLBACK_COMPANIES;
  });
}
