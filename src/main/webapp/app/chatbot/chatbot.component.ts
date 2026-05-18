import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    this.isLoading = true;

    this.messages = [
      ...this.messages,
      {
        id: Date.now() * -1,
        sessionId: this.activeSession.id,
        role: 'user',
        content: text,
        sentAt: new Date().toISOString(),
        escalatedToHuman: false,
      },
    ];
    this.mark();
    this.scrollToBottom();

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
