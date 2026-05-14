import { Component, ChangeDetectionStrategy, signal, inject, ViewChild, ElementRef, AfterViewChecked, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import IconComponent from '../../core/icon/icon.component';
import { RoleService } from '../../core/role.service';
import type { ChatMessage, Role } from '../../core/types';

// Assistant RH RAG — réponses cannées tunisiennes (CNSS, IRPP, congés…).
// En production, branchez-le sur votre endpoint `/api/chatbot/ask`
// qui appelle Ollama + RAG juridique côté backend.

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

  protected readonly open = signal(false);
  protected readonly input = signal('');
  protected readonly busy = signal(false);
  protected readonly messages = signal<ChatMessage[]>([]);

  @ViewChild('body') private bodyEl?: ElementRef<HTMLDivElement>;

  constructor() {
    // Re-init greeting when the role changes (effects: see RoleService.current)
    // Init initial greeting on first display
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
    if (this.open() && this.messages().length === 0) this.resetGreeting();
  }

  send(text?: string): void {
    const msg = (text ?? this.input()).trim();
    if (!msg || this.busy()) return;
    this.messages.update(m => [...m, { role: 'me', text: msg }]);
    this.input.set('');
    this.busy.set(true);

    setTimeout(() => {
      const reply = this.matchCanned(msg, this.roleService.current()) ?? {
        text: "Je n'ai pas trouvé de réponse précise dans ma base. Reformulez ou contactez votre RH.",
      };
      this.messages.update(m => [...m, { role: 'bot', ...reply }]);
      this.busy.set(false);
    }, 700 + Math.random() * 400);
  }

  private resetGreeting(): void {
    const r = this.roleService.current();
    const greeting = r === 'super'
      ? "Bonjour 👋 Je suis votre assistant SaaS. Je peux vous renseigner sur l'état des entreprises et la santé de la plateforme."
      : r === 'rh' || r === 'admin'
      ? "Bonjour Leila 👋 Je suis l'assistant PaieZone. Je peux calculer une paie, expliquer un taux légal ou vous aider à valider des demandes."
      : "Bonjour Mehdi 👋 Je suis votre assistant RH. Posez-moi une question sur votre paie ou vos congés.";
    this.messages.set([{ role: 'bot', text: greeting }]);
  }

  private matchCanned(text: string, role: Role): { text: string; cite?: string } | null {
    const t = text.toLowerCase();

    if (/(bulletin|paie|fiche)/.test(t) && (role === 'emp' || /\bmon\b/.test(t))) {
      return {
        text: "Votre bulletin d'avril 2026 :\n• Net : 2 783,050 TND\n• Brut : 3 680,000 TND\n• Cotisations : −896,950 TND",
      };
    }
    if (/(solde|congé|conge)/.test(t) && /(mon|mes|combien)/.test(t)) {
      return {
        text: 'Vos soldes 2026 :\n• Congés payés : 20 j restants (sur 24)\n• RTT : 9 j (sur 11)\n• Maladie : 15 j (sur 15)',
      };
    }
    if (/cnss/.test(t)) {
      const m = t.match(/(\d[\d\s]*)/);
      const sal = m ? parseInt(m[0].replace(/\s/g, ''), 10) : null;
      if (sal && sal > 100) {
        const cnss = sal * 0.0918, cavis = sal * 0.01, css = sal * 0.005;
        return {
          text: `Pour ${sal.toLocaleString('fr-FR')} TND brut :\n• CNSS (9,18%) : ${cnss.toFixed(3)}\n• CAVIS (1%) : ${cavis.toFixed(3)}\n• CSS (0,5%) : ${css.toFixed(3)}\n• Total : ${(cnss + cavis + css).toFixed(3)} TND`,
          cite: 'JORT n°3-2026',
        };
      }
      return {
        text: 'CNSS salarié : 9,18% (base) / 9,68% avec CAVIS. Employeur : 16,57% au total.',
        cite: 'JORT n°3-2026',
      };
    }
    if (/irpp|imp[oô]t/.test(t)) {
      return {
        text: 'Barème IRPP 2026 (LF) :\n• 0→5k : 0%\n• 5→10k : 15%\n• 10→20k : 25%\n• 20→30k : 30%\n• 30→40k : 33%\n• 40→50k : 36%\n• 50→70k : 38%\n• >70k : 40%',
        cite: 'LF 2026 Art. 12',
      };
    }
    if (/masse\s*salariale/.test(t)) {
      return { text: 'Masse brute mai 2026 : 96 400 TND (+1,7% vs avril). Charges patronales : 20 030 TND.' };
    }
    if (/avance/.test(t)) {
      return {
        text: 'Pour demander une avance : « Mes demandes » > « Demander une avance ». Validation sous 48h. Montant max : 50% du net.',
      };
    }
    return null;
  }
}
