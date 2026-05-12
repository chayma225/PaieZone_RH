import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { ChatSession, ChatMessage, ChatRequest, ChatbotHealth } from './chatbot.model';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private resourceUrl: string;

  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService,
  ) {
    this.resourceUrl = this.applicationConfigService.getEndpointFor('api/chatbot');
  }

  /** Créer une nouvelle session de conversation */
  createSession(title?: string): Observable<ChatSession> {
    return this.http.post<ChatSession>(`${this.resourceUrl}/sessions`, { title });
  }

  /** Récupérer toutes les sessions de l'utilisateur */
  getSessions(): Observable<ChatSession[]> {
    return this.http.get<ChatSession[]>(`${this.resourceUrl}/sessions`);
  }

  /** Récupérer une session avec son historique complet */
  getSession(id: number): Observable<ChatSession> {
    return this.http.get<ChatSession>(`${this.resourceUrl}/sessions/${id}`);
  }

  /** Envoyer un message — retourne la réponse de l'IA */
  sendMessage(sessionId: number, message: string): Observable<ChatMessage> {
    const request: ChatRequest = { message };
    return this.http.post<ChatMessage>(`${this.resourceUrl}/sessions/${sessionId}/messages`, request);
  }

  /** Archiver une session */
  closeSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/sessions/${id}`);
  }

  /** Vérifier que le chatbot est disponible */
  checkHealth(): Observable<ChatbotHealth> {
    return this.http.get<ChatbotHealth>(`${this.resourceUrl}/health`);
  }
}
