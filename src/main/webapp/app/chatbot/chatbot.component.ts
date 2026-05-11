import { Component, OnInit, OnDestroy, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { AccountService } from 'app/core/auth/account.service';

interface ChatMessage {
  id?: number;
  content: string;
  sender: 'USER' | 'BOT';
  sentAt?: Date;
  intent?: string;
}

@Component({
  selector: 'pz-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Bouton flottant -->
    @if (!isOpen()) {
      <button class="chatbot-fab btn btn-primary rounded-circle shadow-lg"
              (click)="openChat()"
              title="Ouvrir PaieBot">
        <span style="font-size: 1.5rem;">🤖</span>
      </button>
    }

    <!-- Fenêtre de chat -->
    @if (isOpen()) {
      <div class="chatbot-window shadow-lg rounded-4 border">

        <!-- Header -->
        <div class="chatbot-header bg-primary text-white p-3 rounded-top-4
                    d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-2">
            <span style="font-size: 1.5rem;">🤖</span>
            <div>
              <div class="fw-bold">PaieBot</div>
              <small class="opacity-75">Assistant RH • En ligne</small>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-light" (click)="minimizeChat()" title="Réduire">—</button>
            <button class="btn btn-sm btn-outline-light" (click)="closeChat()" title="Fermer">✕</button>
          </div>
        </div>

        <!-- Messages -->
        <div class="chatbot-messages p-3" #messagesContainer>

          <!-- Message de bienvenue -->
          @if (messages().length === 0) {
            <div class="bot-message mb-3">
              <div class="message-bubble bg-light border rounded-3 p-3">
                <p class="mb-2">👋 Bonjour ! Je suis <strong>PaieBot</strong>, votre assistant RH.</p>
                <p class="mb-2">Je peux vous aider avec :</p>
                <div class="d-flex flex-wrap gap-2">
                  <button class="btn btn-sm btn-outline-primary"
                          (click)="sendQuickMessage('Voir mon bulletin de paie')">
                    💰 Mon bulletin
                  </button>
                  <button class="btn btn-sm btn-outline-primary"
                          (click)="sendQuickMessage('Faire une demande de congé')">
                    📅 Congé
                  </button>
                  <button class="btn btn-sm btn-outline-primary"
                          (click)="sendQuickMessage('Mes cotisations CNSS et IRPP')">
                    🏥 CNSS/IRPP
                  </button>
                  <button class="btn btn-sm btn-outline-primary"
                          (click)="sendQuickMessage('Contacter un RH')">
                    👤 Parler à un RH
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- Liste des messages -->
          @for (msg of messages(); track $index) {
            <div class="mb-3" [class.user-message]="msg.sender === 'USER'"
                              [class.bot-message]="msg.sender === 'BOT'">
              <div class="message-bubble p-3 rounded-3"
                   [class.bg-primary]="msg.sender === 'USER'"
                   [class.text-white]="msg.sender === 'USER'"
                   [class.bg-light]="msg.sender === 'BOT'"
                   [class.border]="msg.sender === 'BOT'"
                   [innerHTML]="formatMessage(msg.content)">
              </div>
              <small class="text-muted ms-2" style="font-size: 0.7rem;">
                {{ msg.sender === 'USER' ? 'Vous' : '🤖 PaieBot' }}
                @if (msg.sentAt) {
                  · {{ msg.sentAt | date:'HH:mm' }}
                }
              </small>
            </div>
          }

          <!-- Indicateur de frappe -->
          @if (isTyping()) {
            <div class="bot-message mb-3">
              <div class="message-bubble bg-light border rounded-3 p-3">
                <div class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Saisie -->
        <div class="chatbot-input p-3 border-top">
          <div class="input-group">
            <input type="text"
                   class="form-control rounded-pill"
                   [(ngModel)]="currentMessage"
                   (keyup.enter)="sendMessage()"
                   placeholder="Tapez votre message..."
                   [disabled]="isTyping()"/>
            <button class="btn btn-primary rounded-pill ms-2"
                    (click)="sendMessage()"
                    [disabled]="!currentMessage.trim() || isTyping()">
              <span>➤</span>
            </button>
          </div>
          <div class="text-center mt-2">
            <small class="text-muted" style="font-size: 0.7rem;">
              Propulsé par Claude AI (Anthropic)
            </small>
          </div>
        </div>

      </div>
    }
  `,
  styles: [`
    .chatbot-fab {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 60px;
      height: 60px;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .chatbot-window {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 380px;
      height: 550px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      background: white;
    }
    .chatbot-messages {
      flex: 1;
      overflow-y: auto;
      scroll-behavior: smooth;
    }
    .user-message {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .user-message .message-bubble {
      max-width: 80%;
    }
    .bot-message .message-bubble {
      max-width: 90%;
    }
    .typing-indicator span {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #aaa;
      margin: 0 2px;
      animation: bounce 1.4s infinite;
    }
    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-8px); }
    }
    @media (max-width: 576px) {
      .chatbot-window {
        width: 95vw;
        right: 2.5vw;
        bottom: 10px;
        height: 80vh;
      }
    }
  `]
})
export class ChatbotComponent implements OnInit, AfterViewChecked {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isOpen     = signal(false);
  isTyping   = signal(false);
  messages   = signal<ChatMessage[]>([]);
  currentMessage = '';
  sessionId: number | null = null;
  employeeId: number | null = null;

  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(ApplicationConfigService);
  private readonly accountService = inject(AccountService);

  ngOnInit(): void {
    // Récupérer l'employé connecté si disponible
    this.accountService.identity().subscribe(account => {
      if (account) {
        // Idéalement récupérer l'employeeId depuis le profil
        this.employeeId = null; // À adapter selon votre UserProfile
      }
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  openChat(): void {
    this.isOpen.set(true);
    if (!this.sessionId) {
      this.initSession();
    }
  }

  closeChat(): void {
    this.isOpen.set(false);
    if (this.sessionId) {
      this.http.put(
        this.appConfig.getEndpointFor(`api/chatbot/session/${this.sessionId}/close`), {}
      ).subscribe();
    }
  }

  minimizeChat(): void {
    this.isOpen.set(false);
  }

  private initSession(): void {
    this.http.post<any>(
      this.appConfig.getEndpointFor('api/chatbot/session'),
      { employeeId: this.employeeId }
    ).subscribe(session => {
      this.sessionId = session.id;
    });
  }

  sendMessage(): void {
    const msg = this.currentMessage.trim();
    if (!msg || !this.sessionId) return;

    // Ajouter message utilisateur
    this.messages.update(msgs => [...msgs, {
      content: msg,
      sender: 'USER',
      sentAt: new Date()
    }]);

    this.currentMessage = '';
    this.isTyping.set(true);

    // Appeler le backend
    this.http.post<any>(
      this.appConfig.getEndpointFor(`api/chatbot/session/${this.sessionId}/message`),
      { message: msg, employeeId: this.employeeId }
    ).subscribe({
      next: (response) => {
        this.isTyping.set(false);
        this.messages.update(msgs => [...msgs, {
          content: response.content,
          sender: 'BOT',
          sentAt: new Date(),
          intent: response.intent
        }]);
      },
      error: () => {
        this.isTyping.set(false);
        this.messages.update(msgs => [...msgs, {
          content: '❌ Une erreur est survenue. Veuillez réessayer.',
          sender: 'BOT',
          sentAt: new Date()
        }]);
      }
    });
  }

  sendQuickMessage(msg: string): void {
    this.currentMessage = msg;
    this.sendMessage();
  }

  formatMessage(content: string): string {
    // Convertir le Markdown basique en HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
      .replace(/→ \[(.*?)\]\((.*?)\)/g, '→ <a href="$2" class="btn btn-sm btn-outline-primary mt-1">$1</a>');
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
