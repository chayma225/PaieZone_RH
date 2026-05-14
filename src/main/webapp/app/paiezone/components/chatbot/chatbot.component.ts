import { Component, ChangeDetectionStrategy, signal, inject, ViewChild, ElementRef, AfterViewChecked, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  // Offline fallback for IRPP bracket lookup
  private matchCanned(text: string, _role: Role): { text: string; cite?: string } | null {
    const t = text.toLowerCase();
    if (/irpp|imp[oô]t/.test(t)) {
      return {
        text:
          'Barème IRPP 2026 (LF 2026) :\n' +
          '• 0 → 5 000 : 0 %\n' +
          '• 5 000 → 10 000 : 15 %\n' +
          '• 10 000 → 20 000 : 25 %\n' +
          '• 20 000 → 30 000 : 30 %\n' +
          '• 30 000 → 40 000 : 33 %\n' +
          '• 40 000 → 50 000 : 36 %\n' +
          '• 50 000 → 70 000 : 38 %\n' +
          '• > 70 000 : 40 %',
        cite: 'LF 2026 Art. 12',
      };
    }
    return null;
  }
}
