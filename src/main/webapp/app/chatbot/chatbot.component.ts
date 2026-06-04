import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChatbotService } from './chatbot.service';
import { ChatSession, ChatMessage } from './chatbot.model';

@Component({
  selector: 'jhi-chatbot',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent implements OnInit {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private chatbotService = inject(ChatbotService);
  private cd = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private router = inject(Router);
  private http = inject(HttpClient);

  isOpen = false;
  isLoading = false;
  showSessions = false;
  ollamaOnline = true;

  currentMessage = '';
  sessions: ChatSession[] = [];
  activeSession: ChatSession | null = null;
  messages: ChatMessage[] = [];

  ngOnInit(): void {
    this.loadSessions();
    this.checkHealth();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen && !this.activeSession) {
      this.startNewSession();
    }
    this.mark();
  }

  checkHealth(): void {
    this.chatbotService.checkHealth().subscribe({
      next: () => {
        this.ollamaOnline = true;
        this.mark();
      },
      error: () => {
        this.ollamaOnline = false;
        this.mark();
      },
    });
  }

  loadSessions(): void {
    this.chatbotService.getSessions().subscribe({
      next: (sessions: ChatSession[]) => {
        this.sessions = sessions;
        this.mark();
      },
      error: (err: unknown) => console.error('Erreur sessions:', err),
    });
  }

  startNewSession(): void {
    this.chatbotService.createSession().subscribe({
      next: (session: ChatSession) => {
        this.activeSession = session;
        this.sessions = [session, ...this.sessions];
        this.showSessions = false;
        this.showWelcomeMessage();
        this.mark();
      },
      error: (err: unknown) => console.error('Erreur création session:', err),
    });
  }

  selectSession(session: ChatSession): void {
    this.chatbotService.getSession(session.id).subscribe({
      next: (fullSession: ChatSession) => {
        this.activeSession = fullSession;
        this.messages = fullSession.messages ?? [];
        this.showSessions = false;
        this.mark();
        this.scrollToBottom();
      },
      error: (err: unknown) => console.error('Erreur chargement session:', err),
    });
  }

  sendMessage(): void {
    const text = this.currentMessage.trim();
    if (!text || !this.activeSession || this.isLoading) return;

    this.currentMessage = '';

    const userMsg: ChatMessage = {
      id: Date.now() * -1,
      sessionId: this.activeSession.id,
      role: 'user',
      content: text,
      sentAt: new Date().toISOString(),
      escalatedToHuman: false,
    };
    this.messages = [...this.messages, userMsg];
    this.mark();
    this.scrollToBottom();

    // ── Congé redirect ──────────────────────────────────────────
    if (this.matchLeaveIntent(text)) {
      this.pushLocalBot('📋 Pour poser ou consulter vos congés, cliquez ci-dessous :', {
        label: 'Mes congés →',
        route: '/paiezone/emp-leaves',
      });
      return;
    }

    // ── Avance redirect ─────────────────────────────────────────
    if (this.matchAdvanceIntent(text)) {
      this.pushLocalBot('💰 Pour demander une avance sur salaire, cliquez ci-dessous :', {
        label: 'Mes demandes →',
        route: '/paiezone/emp-requests',
      });
      return;
    }

    // ── Bulletin download ────────────────────────────────────────
    if (this.matchBulletinIntent(text)) {
      this.isLoading = true;
      this.mark();
      this.http.get<{ id?: number; month?: number; year?: number; error?: string }>('/api/chatbot/my-bulletin').subscribe({
        next: res => {
          this.isLoading = false;
          if (res.error || !res.id) {
            this.pushLocalBot(res.error ?? 'Aucun bulletin disponible pour le moment.');
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
            this.pushLocalBot(`📄 Votre dernier bulletin disponible : **${label}**`, {
              label: `Télécharger ${label}`,
              href: `/api/export/bulletin/${res.id}`,
            });
          }
          this.mark();
          this.scrollToBottom();
        },
        error: () => {
          this.isLoading = false;
          this.pushLocalBot('Impossible de récupérer votre bulletin. Réessayez plus tard.');
          this.mark();
          this.scrollToBottom();
        },
      });
      return;
    }

    // ── Appel IA (défaut) ────────────────────────────────────────
    this.isLoading = true;
    this.mark();

    this.chatbotService.sendMessage(this.activeSession.id, text).subscribe({
      next: (response: ChatMessage) => {
        this.messages = [...this.messages, response];
        this.isLoading = false;
        this.loadSessions();
        this.mark();
        this.scrollToBottom();
      },
      error: (_err: unknown) => {
        this.messages = [
          ...this.messages,
          {
            id: Date.now() * -1,
            sessionId: this.activeSession!.id,
            role: 'assistant',
            content: "⚠️ Erreur de connexion. Vérifiez qu'**Ollama est démarré** (`ollama serve`) et réessayez.",
            sentAt: new Date().toISOString(),
            escalatedToHuman: false,
          },
        ];
        this.isLoading = false;
        this.mark();
      },
    });
  }

  navigateTo(route?: string, href?: string): void {
    if (route) {
      this.router.navigate([route]);
      this.isOpen = false;
      this.mark();
    } else if (href) {
      this.http.get(href, { responseType: 'blob' }).subscribe({
        next: blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'bulletin.pdf';
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 10_000);
        },
      });
    }
  }

  private pushLocalBot(content: string, actionLink?: ChatMessage['actionLink']): void {
    this.messages = [
      ...this.messages,
      {
        id: Date.now() * -1,
        sessionId: this.activeSession?.id ?? 0,
        role: 'assistant',
        content,
        sentAt: new Date().toISOString(),
        escalatedToHuman: false,
        actionLink,
      },
    ];
    this.mark();
    this.scrollToBottom();
  }

  private matchLeaveIntent(text: string): boolean {
    const t = this.norm(text);
    return /conge|conges|vacance|absence|rti|repos/.test(t);
  }

  private matchAdvanceIntent(text: string): boolean {
    const t = this.norm(text);
    return /avance|acompte|pret/.test(t);
  }

  private matchBulletinIntent(text: string): boolean {
    const t = this.norm(text);
    return /bulletin|fiche de paie|fiche paie|telecharger.*paie|paie.*telecharger/.test(t);
  }

  private norm(text: string): string {
    return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatContent(content: string): string {
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  trackByMsgId(_index: number, msg: ChatMessage): number {
    return msg.id;
  }

  private showWelcomeMessage(): void {
    this.messages = [
      {
        id: 0,
        sessionId: this.activeSession?.id ?? 0,
        role: 'assistant',
        content:
          '👋 Bonjour ! Je suis **PaieBot**, votre assistant RH.\n\n' +
          '📋 **Contrats** — CDI, CDD, CIVP, KARAMA…\n' +
          '💰 **Paie** — CNSS, IRPP, cotisations\n' +
          '🏖️ **Congés** — procédures légales\n' +
          '📊 **Données RH** — liste employés, effectifs, départements\n\n' +
          'Comment puis-je vous aider ?',
        sentAt: new Date().toISOString(),
        escalatedToHuman: false,
      },
    ];
  }

  private mark(): void {
    this.cd.markForCheck();
  }

  private scrollToBottom(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        try {
          const el: HTMLElement = this.messagesContainer?.nativeElement;
          if (el) el.scrollTop = el.scrollHeight;
        } catch (_) {
          /* ignore */
        }
      }, 50);
    });
  }
}
