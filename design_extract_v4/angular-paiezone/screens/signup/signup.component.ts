import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

import IconComponent from '../../core/icon/icon.component';
import { DataService } from '../../core/data.service';

interface SignupData {
  // Step 1 — Plan
  plan: 'STARTER' | 'PME' | 'BUSINESS' | 'ENTERPRISE';
  // Step 2 — Entreprise
  companyName: string;
  tradeName: string;
  taxId: string;
  cnssId: string;
  city: string;
  phone: string;
  // Step 3 — Admin
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  // Step 4 — 2FA setup (optional)
  enable2fa: boolean;
  acceptTerms: boolean;
}

@Component({
  selector: 'pz-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SignupComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly data = inject(DataService);

  protected readonly step = signal<1 | 2 | 3 | 4>(1);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly done = signal(false);

  protected readonly form = signal<SignupData>({
    plan: (this.route.snapshot.queryParamMap.get('plan') as any) || 'BUSINESS',
    companyName: '', tradeName: '', taxId: '', cnssId: '', city: '', phone: '',
    firstName: '', lastName: '', email: '', password: '',
    enable2fa: true, acceptTerms: false,
  });

  protected readonly pwdScore = computed(() => {
    const p = this.form().password;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  });

  protected readonly pwdLabel = computed(() => {
    const s = this.pwdScore();
    if (s <= 1) return { label: 'Faible', color: 'var(--pz-danger)' };
    if (s === 2) return { label: 'Moyen', color: 'var(--pz-warn)' };
    if (s === 3) return { label: 'Fort', color: 'var(--pz-info)' };
    return { label: 'Très fort', color: 'var(--pz-pos)' };
  });

  protected readonly planOptions = [
    { code: 'STARTER', label: 'Starter', price: 'Gratuit · 14 j', max: 10, color: '#94a3b8' },
    { code: 'PME', label: 'PME', price: '290 TND/mois', max: 30, color: '#0ea5e9' },
    { code: 'BUSINESS', label: 'Business', price: '720 TND/mois', max: 100, color: '#4f46e5', popular: true },
    { code: 'ENTERPRISE', label: 'Enterprise', price: '1 480 TND/mois', max: 500, color: '#f59e0b' },
  ];

  protected readonly cities = ['Tunis', 'Ariana', 'Ben Arous', 'La Manouba', 'Sousse', 'Sfax', 'Bizerte', 'Hammamet', 'Mahdia', 'Kairouan', 'Djerba', 'Gabès', 'Monastir', 'Nabeul'];

  protected update<K extends keyof SignupData>(key: K, value: SignupData[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
    this.error.set(null);
  }

  protected next(): void {
    const f = this.form();
    if (this.step() === 2) {
      if (!f.companyName || !f.taxId || !f.city) {
        this.error.set('Veuillez remplir les champs obligatoires.');
        return;
      }
      if (!/^\d{7}\/[A-Z]$/.test(f.taxId)) {
        this.error.set('Format matricule fiscal invalide. Ex : 1234567/A');
        return;
      }
    }
    if (this.step() === 3) {
      if (!f.firstName || !f.lastName || !f.email) {
        this.error.set('Veuillez remplir tous les champs.');
        return;
      }
      if (!f.email.includes('@')) {
        this.error.set('Email invalide.');
        return;
      }
      if (this.pwdScore() < 2) {
        this.error.set('Mot de passe trop faible. Utilisez au moins 8 caractères avec majuscules, chiffres.');
        return;
      }
    }
    this.error.set(null);
    this.step.update(s => (s + 1) as any);
  }

  protected back(): void {
    this.step.update(s => Math.max(1, s - 1) as any);
    this.error.set(null);
  }

  protected submit(): void {
    if (!this.form().acceptTerms) {
      this.error.set('Vous devez accepter les conditions générales.');
      return;
    }
    this.busy.set(true);
    // En prod : POST /api/account/register → création tenant + admin + envoi email
    setTimeout(() => {
      this.busy.set(false);
      this.done.set(true);
      setTimeout(() => {
        if (this.form().enable2fa) {
          this.router.navigate(['/paiezone/2fa-setup']);
        } else {
          this.router.navigate(['/paiezone/admin-dash']);
        }
      }, 1500);
    }, 1400);
  }
}
