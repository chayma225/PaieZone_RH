import { Component, ChangeDetectionStrategy, signal, inject, ViewChild, ElementRef, AfterViewChecked, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import IconComponent from '../../core/icon/icon.component';
import { RoleService } from '../../core/role.service';
import { ApiService } from '../../core/api.service';
import type { ChatMessage, Role } from '../../core/types';

@Component({
  selector: 'pz-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChatbotComponent implements AfterViewChecked {
  private readonly roleService = inject(RoleService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  protected readonly open = signal(false);
  protected readonly input = signal('');
  protected readonly busy = signal(false);
  protected readonly messages = signal<ChatMessage[]>([]);
  private sessionId: number | null = null;

  @ViewChild('body') private bodyEl?: ElementRef<HTMLDivElement>;

  constructor() {
    this.resetGreeting();
  }

  protected readonly quickPrompts = computed(() => {
    const r = this.roleService.current();
    if (r === 'super') return ['État des serveurs', 'Top entreprises MRR', 'Dernière modif réglementaire'];
    if (r === 'rh') return ['Quels congés à valider ?', 'Masse salariale du mois', 'Calcul CNSS 2 500 TND'];
    return ['Quel est mon solde de congés ?', 'Mon dernier bulletin', 'Demander une avance'];
  });

  ngAfterViewChecked(): void {
    if (this.bodyEl) {
      this.bodyEl.nativeElement.scrollTop = this.bodyEl.nativeElement.scrollHeight;
    }
  }

  toggleOpen(): void {
    this.open.update(v => !v);
    if (this.open()) {
      if (this.messages().length === 0) this.resetGreeting();
      if (!this.sessionId) this.initSession();
    }
  }

  send(text?: string): void {
    const msg = (text ?? this.input()).trim();
    if (!msg || this.busy()) return;

    // Local CNSS calculation — pure math, no need for AI
    const cnssReply = this.matchLocalCnss(msg);
    if (cnssReply) {
      this.messages.update(m => [...m, { role: 'me', text: msg }]);
      this.input.set('');
      this.messages.update(m => [...m, { role: 'bot', text: cnssReply.text, cite: cnssReply.cite }]);
      return;
    }

    // Congé redirect
    if (this.matchLeaveIntent(msg)) {
      this.messages.update(m => [...m, { role: 'me', text: msg }]);
      this.input.set('');
      this.messages.update(m => [
        ...m,
        {
          role: 'bot',
          text: '📋 Pour poser ou consulter vos congés, rendez-vous sur la page dédiée :',
          action: { label: 'Mes congés →', route: '/paiezone/emp-leaves' },
        },
      ]);
      return;
    }

    // Avance redirect
    if (this.matchAdvanceIntent(msg)) {
      this.messages.update(m => [...m, { role: 'me', text: msg }]);
      this.input.set('');
      this.messages.update(m => [
        ...m,
        {
          role: 'bot',
          text: '💰 Pour demander une avance sur salaire, rendez-vous ici :',
          action: { label: 'Mes demandes →', route: '/paiezone/emp-requests' },
        },
      ]);
      return;
    }

    // Bulletin download
    if (this.matchBulletinIntent(msg)) {
      this.messages.update(m => [...m, { role: 'me', text: msg }]);
      this.input.set('');
      this.busy.set(true);
      this.api.getMyLatestBulletin().subscribe({
        next: res => {
          this.busy.set(false);
          if (res.error || !res.id) {
            this.messages.update(m => [...m, { role: 'bot', text: res.error ?? 'Aucun bulletin disponible.' }]);
          } else {
            const MONTHS = [
              'Janvier',
              'Février',
              'Mars',
              'Avril',
              'Mai',
              'Juin',
              'Juillet',
              'Août',
              'Septembre',
              'Octobre',
              'Novembre',
              'Décembre',
            ];
            const label = `${MONTHS[(res.month ?? 1) - 1]} ${res.year}`;
            this.messages.update(m => [
              ...m,
              {
                role: 'bot',
                text: `📄 Votre dernier bulletin disponible : **${label}**`,
                action: { label: `Télécharger ${label}`, href: `/api/export/bulletin/${res.id}` },
              },
            ]);
          }
        },
        error: () => {
          this.busy.set(false);
          this.messages.update(m => [...m, { role: 'bot', text: 'Impossible de récupérer votre bulletin. Réessayez plus tard.' }]);
        },
      });
      return;
    }

    this.messages.update(m => [...m, { role: 'me', text: msg }]);
    this.input.set('');
    this.busy.set(true);

    if (!this.sessionId) {
      this.api.createChatSession().subscribe({
        next: session => {
          this.sessionId = session.id;
          this.callApi(msg);
        },
        error: () => this.fallback(msg),
      });
    } else {
      this.callApi(msg);
    }
  }

  navigateTo(route?: string, href?: string): void {
    if (route) {
      this.router.navigate([route]);
      this.open.set(false);
    } else if (href) {
      window.open(href, '_blank');
    }
  }

  private callApi(msg: string): void {
    this.api.sendChatMessage(this.sessionId!, msg).subscribe({
      next: res => {
        this.messages.update(m => [...m, { role: 'bot', text: res.content ?? '' }]);
        this.busy.set(false);
      },
      error: () => this.fallback(msg),
    });
  }

  private fallback(msg: string): void {
    const local = this.matchCanned(msg, this.roleService.current());
    const reply = local ?? {
      text: 'Le service IA est momentanément indisponible. Reformulez votre question ou contactez votre RH directement.',
    };
    this.messages.update(m => [...m, { role: 'bot', ...reply }]);
    this.busy.set(false);
  }

  private initSession(): void {
    this.api.createChatSession().subscribe({
      next: s => {
        this.sessionId = s.id;
      },
      error: () => {},
    });
  }

  private resetGreeting(): void {
    const r = this.roleService.current();
    const text =
      r === 'super'
        ? "Bonjour 👋 Je suis votre assistant SaaS. Je peux vous renseigner sur l'état des entreprises et la santé de la plateforme."
        : r === 'rh' || r === 'admin'
          ? "Bonjour 👋 Je suis l'assistant PaieZone. Je peux calculer une paie, expliquer un taux légal ou vous aider à valider des demandes."
          : 'Bonjour 👋 Je suis votre assistant RH. Posez-moi une question sur votre paie ou vos congés.';
    this.messages.set([{ role: 'bot', text }]);
  }

  private matchLeaveIntent(text: string): boolean {
    const t = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    // Ne pas rediriger si c'est une question légale/réglementaire sur les congés
    if (/legal|legaux|loi|code travail|taux|duree|droit|tunisi|regle|nb|nombre|combien|jours?/.test(t)) return false;
    return /conge|conges|vacance|absence|rti|repos/.test(t);
  }

  private matchAdvanceIntent(text: string): boolean {
    const t = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return /avance|acompte|pret/.test(t);
  }

  private matchBulletinIntent(text: string): boolean {
    const t = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return /bulletin|fiche de paie|fiche paie|telecharger.*paie|paie.*telecharger/.test(t);
  }

  // Pure local CNSS calculation (no AI needed, result is deterministic)
  private matchLocalCnss(text: string): { text: string; cite?: string } | null {
    if (!/cnss/i.test(text)) return null;
    const m = text.match(/(\d[\d\s]*)/);
    const sal = m ? parseInt(m[0].replace(/\s/g, ''), 10) : null;
    if (sal && sal > 100) {
      const cnss = sal * 0.0918;
      const cavis = sal * 0.01;
      const css = sal * 0.005;
      return {
        text:
          `Pour ${sal.toLocaleString('fr-FR')} TND brut :\n` +
          `• CNSS (9,18 %) : ${cnss.toFixed(3)}\n` +
          `• CAVIS (1 %) : ${cavis.toFixed(3)}\n` +
          `• CSS (0,5 %) : ${css.toFixed(3)}\n` +
          `• Total retenues : ${(cnss + cavis + css).toFixed(3)} TND`,
        cite: 'JORT n°3-2026',
      };
    }
    return {
      text: 'CNSS salarié : 9,18 % (base) + 1 % CAVIS + 0,5 % CSS = 10,68 % total.\nEmployeur : 16,57 % au total.',
      cite: 'JORT n°3-2026',
    };
  }

  // Réponses locales exactes — intercepte les questions légales pour éviter les hallucinations phi3
  private matchCanned(text: string, _role: Role): { text: string; cite?: string } | null {
    const t = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');

    // IRPP / Tranches fiscales
    if (/irpp|impo[st]|tranche.*fisc|fisc.*tranche|bareme|lf.?2026/.test(t)) {
      return {
        text:
          'Barème IRPP 2026 (LF 2026) :\n' +
          '• 0 → 5 000 TND : 0 %\n' +
          '• 5 001 → 10 000 TND : 15 %\n' +
          '• 10 001 → 20 000 TND : 25 %\n' +
          '• 20 001 → 30 000 TND : 30 %\n' +
          '• 30 001 → 40 000 TND : 33 %\n' +
          '• 40 001 → 50 000 TND : 36 %\n' +
          '• 50 001 → 70 000 TND : 38 %\n' +
          '• > 70 000 TND : 40 %',
        cite: 'LF 2026 Art. 12',
      };
    }

    // Taux CNSS / CAVIS / CSS (sans montant → taux seuls)
    if (/taux|rate|pourcentage|cotisation/.test(t) && /cnss|cavis|css|securite sociale/.test(t)) {
      return {
        text:
          'Taux de cotisations sociales (LF 2026) :\n\n' +
          '👤 Salarié :\n' +
          '  • CNSS : 9,18 %\n' +
          '  • CAVIS : 1,00 %\n' +
          '  • CSS : 0,50 %\n' +
          '  • Total salarié : 10,68 %\n\n' +
          '🏢 Employeur :\n' +
          '  • CNSS : 16,57 %\n' +
          '  • Total employeur : 16,57 %',
        cite: 'JORT n°3-2026',
      };
    }

    // Congés légaux
    if (/conge.*legal|legal.*conge|conge.*tunisi|droit.*conge|duree.*conge|nb.*conge|jours.*conge|conge.*annuel|conge.*loi/.test(t)) {
      return {
        text:
          'Congés légaux en Tunisie (Code du travail) :\n\n' +
          '📅 Congé annuel payé :\n' +
          '  • 1 jour ouvrable par mois de service\n' +
          '  • Minimum 12 jours / an (après 1 an d\'ancienneté)\n' +
          '  • Peut aller jusqu\'à 18 jours selon convention\n\n' +
          '🤒 Congé maladie :\n' +
          '  • Pris en charge par la CNAM après 3 jours\n' +
          '  • Justificatif médical obligatoire\n\n' +
          '👶 Congé maternité : 30 jours (secteur privé)\n' +
          '📌 Jours fériés légaux : 13 jours/an',
        cite: 'Code du Travail Tunisien',
      };
    }

    // Types de contrats
    if (/type.*contrat|contrat.*type|cdi|cdd|civp|karama|contrat.*travail|forme.*contrat/.test(t)) {
      return {
        text:
          'Types de contrats en Tunisie :\n\n' +
          '📄 CDI (Contrat à Durée Indéterminée)\n' +
          '  • Contrat permanent, pas de date de fin\n' +
          '  • Protection renforcée contre le licenciement\n\n' +
          '📄 CDD (Contrat à Durée Déterminée)\n' +
          '  • Durée maximale : 4 ans (renouvellements inclus)\n' +
          '  • Devient CDI si dépassement de durée\n\n' +
          '📄 CIVP (Contrat d\'Insertion à la Vie Professionnelle)\n' +
          '  • Réservé aux primo-demandeurs d\'emploi\n' +
          '  • Durée : 12 mois renouvelable une fois\n' +
          '  • Rémunération : au moins le SMIG\n\n' +
          '💡 SMIG 2026 : 530 TND/mois (40h/sem)',
        cite: 'Code du Travail Art. 6-22',
      };
    }

    // SMIG / Salaire minimum
    if (/smig|salaire.*(min|base|plancher)|smic/.test(t)) {
      return {
        text:
          'SMIG en Tunisie (2026) :\n' +
          '  • 40h/semaine : 530 TND/mois\n' +
          '  • 48h/semaine : 630 TND/mois\n\n' +
          'Le salaire brut ne peut pas être inférieur à ces montants.',
        cite: 'Décret n°2025-xxx',
      };
    }

    return null;
  }
}
