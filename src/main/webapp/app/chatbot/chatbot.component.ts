import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from './chatbot.service';
import { ChatSession, ChatMessage } from './chatbot.model';

@Component({
  selector: 'jhi-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  // État de l'interface
  isOpen = false;
  isLoading = false;
  showSessions = false;
  ollamaOnline = true;

  // Données
  currentMessage = '';
  sessions: ChatSession[] = [];
  activeSession: ChatSession | null = null;
  messages: ChatMessage[] = [];

  private shouldScrollToBottom = false;

  constructor(
    private chatbotService: ChatbotService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadSessions();
    this.checkHealth();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  // ===========================
  //  Contrôle du panneau
  // ===========================

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    // Si on ouvre le chat et qu'il n'y a pas de session, on en prépare une
    if (this.isOpen && !this.activeSession) {
      if (this.sessions.length > 0) {
        this.selectSession(this.sessions[0]);
      } else {
        this.startNewSession();
      }
    }
  }

  checkHealth(): void {
    this.chatbotService.checkHealth().subscribe({
      next: () => (this.ollamaOnline = true),
      error: () => (this.ollamaOnline = false),
    });
  }

  // ===========================
  //  Sessions
  // ===========================

  loadSessions(): void {
    this.chatbotService.getSessions().subscribe({
      next: sessions => (this.sessions = sessions),
      error: err => console.error('Erreur chargement sessions chatbot:', err),
    });
  }

  startNewSession(): void {
    this.chatbotService.createSession().subscribe({
      next: session => {
        this.activeSession = session;
        this.messages = [];
        this.sessions.unshift(session);
        this.showSessions = false;
        this.showWelcomeMessage();
      },
      error: err => console.error('Erreur création session:', err),
    });
  }

  selectSession(session: ChatSession): void {
    this.chatbotService.getSession(session.id).subscribe({
      next: fullSession => {
        this.activeSession = fullSession;
        this.messages = fullSession.messages ?? [];
        this.showSessions = false;
        this.shouldScrollToBottom = true;
      },
      error: err => console.error('Erreur chargement session:', err),
    });
  }

  // ===========================
  //  Envoi de message
  // ===========================

  sendMessage(): void {
    const text = this.currentMessage.trim();

    // Si pas de texte ou déjà en train de charger, on ignore
    if (!text || this.isLoading) return;

    // SÉCURITÉ : Si la session est manquante, on la crée à la volée
    if (!this.activeSession) {
      this.isLoading = true;
      this.chatbotService.createSession().subscribe({
        next: session => {
          this.activeSession = session;
          this.sessions.unshift(session);
          this.processMessageSending(text);
        },
        error: () => (this.isLoading = false),
      });
      return;
    }

    this.processMessageSending(text);
  }

  private processMessageSending(text: string): void {
    if (!this.activeSession) return;

    this.currentMessage = '';
    this.isLoading = true;

    // UI Optimiste : Affichage immédiat du message utilisateur
    this.messages.push({
      id: Date.now() * -1,
      sessionId: this.activeSession.id,
      role: 'user',
      content: text,
      sentAt: new Date().toISOString(),
      escalatedToHuman: false,
    });

    this.shouldScrollToBottom = true;
    this.cd.detectChanges();

    this.chatbotService.sendMessage(this.activeSession.id, text).subscribe({
      next: response => {
        this.messages.push(response);
        this.isLoading = false;
        this.shouldScrollToBottom = true;
        this.loadSessions(); // Rafraîchir les titres si nécessaire
        this.cd.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.messages.push({
          id: Date.now() * -1,
          sessionId: this.activeSession!.id,
          role: 'assistant',
          content: "⚠️ **Erreur de connexion.** Vérifiez qu'Ollama est lancé (`ollama serve`).",
          sentAt: new Date().toISOString(),
          escalatedToHuman: false,
        });
        this.shouldScrollToBottom = true;
        this.cd.detectChanges();
      },
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
  // ===========================
  //  Utilitaires
  // ===========================

  /** Convertit le Markdown basique en HTML pour l'affichage */
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
          '👋 Bonjour ! Je suis **PaieBot**, votre assistant RH intelligent.\n\n' +
          'Je peux vous aider avec :\n' +
          '📋 Questions sur les **contrats** (CDI, CDD, CIVP, KARAMA…)\n' +
          '💰 Calculs **CNSS, IRPP, bulletin de paie**\n' +
          '🏖️ Procédures de **congé**\n' +
          '📄 Informations **RH générales** — Loi de Finances 2026\n\n' +
          'Comment puis-je vous aider ?',
        sentAt: new Date().toISOString(),
        escalatedToHuman: false,
      },
    ];
    this.shouldScrollToBottom = true;
  }

  private scrollToBottom(): void {
    try {
      const el: HTMLElement = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch (_) {
      // ignore
    }
  }
}
