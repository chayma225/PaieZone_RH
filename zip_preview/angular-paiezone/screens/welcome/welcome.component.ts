import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import IconComponent from '../../core/icon/icon.component';

@Component({
  selector: 'pz-welcome',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WelcomeComponent {
  protected readonly features = [
    { icon: 'Cash', title: 'Paie 100% conforme LF 2026', desc: 'CNSS, CAVIS, CSS, IRPP — barèmes mis à jour automatiquement par notre équipe juridique.' },
    { icon: 'Sparkles', title: 'Assistant IA juridique', desc: 'RAG sur le Code du Travail tunisien — réponses instantanées avec sources citées.' },
    { icon: 'Users', title: 'Self-service employés', desc: 'Vos collaborateurs accèdent à leurs bulletins, posent leurs congés et demandent leurs avances.' },
    { icon: 'Shield', title: 'Multi-tenant sécurisé', desc: 'Isolation par schéma PostgreSQL, RBAC complet, journal d\'audit 7 ans.' },
    { icon: 'Pdf', title: 'Bulletins PDF automatisés', desc: 'Génération JasperReports + envoi par email, signature électronique en option.' },
    { icon: 'Download', title: 'Export CNSS & CNAM', desc: 'Déclarations trimestrielles en XML et PDF, prêtes à téléverser sur les portails officiels.' },
  ];

  protected readonly plans = [
    { code: 'STARTER', label: 'Starter', price: 0, period: '14 jours', max: 10, color: '#94a3b8', features: ['Jusqu\'à 10 employés', 'Paie + congés', 'Bulletins PDF', 'Support email'] },
    { code: 'PME', label: 'PME', price: 290, period: 'mois', max: 30, color: '#0ea5e9', features: ['Jusqu\'à 30 employés', 'Tout Starter +', 'Avances & primes', 'Multi-utilisateurs', 'Support prioritaire'] },
    { code: 'BUSINESS', label: 'Business', price: 720, period: 'mois', max: 100, color: '#4f46e5', popular: true, features: ['Jusqu\'à 100 employés', 'Tout PME +', 'Assistant IA RH', 'Export CNSS/CNAM', 'API REST'] },
    { code: 'ENTERPRISE', label: 'Enterprise', price: 1480, period: 'mois', max: 500, color: '#f59e0b', features: ['Jusqu\'à 500 employés', 'Tout Business +', '2FA obligatoire', 'SLA 99.95%', 'Account manager dédié'] },
  ];
}
