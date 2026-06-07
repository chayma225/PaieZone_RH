import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ChatbotService } from './chatbot.service';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { ChatSession, ChatMessage } from './chatbot.model';

/**
 * Tests unitaires — ChatbotService Angular
 *
 * Couvre :
 * - createSession → POST /api/chatbot/sessions
 * - getSessions   → GET  /api/chatbot/sessions
 * - sendMessage   → POST /api/chatbot/sessions/:id/messages
 * - checkHealth   → GET  /api/chatbot/health
 * - Gestion des erreurs HTTP
 */
describe('ChatbotService', () => {
  let service: ChatbotService;
  let httpMock: HttpTestingController;

  const API_BASE = 'http://localhost:8080/api/chatbot';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ChatbotService,
        {
          provide: ApplicationConfigService,
          useValue: {
            getEndpointFor: (path: string) => `http://localhost:8080/${path}`,
          },
        },
      ],
    });

    service = TestBed.inject(ChatbotService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Aucune requête non interceptée ne doit rester
  });

  // ── createSession ────────────────────────────────────────────

  describe('createSession', () => {
    it('doit envoyer POST /sessions avec le titre', () => {
      const mockSession: ChatSession = {
        id: 1,
        sessionTitle: 'Test session',
        active: true,
        messages: [],
      };

      service.createSession('Test session').subscribe(session => {
        expect(session).toEqual(mockSession);
        expect(session.id).toBe(1);
      });

      const req = httpMock.expectOne(`${API_BASE}/sessions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ title: 'Test session' });
      req.flush(mockSession);
    });

    it('doit gérer un titre undefined → body { title: undefined }', () => {
      const mockSession: ChatSession = { id: 2, sessionTitle: 'Nouvelle conversation', active: true, messages: [] };

      service.createSession().subscribe();
      const req = httpMock.expectOne(`${API_BASE}/sessions`);
      expect(req.request.body).toEqual({ title: undefined });
      req.flush(mockSession);
    });
  });

  // ── getSessions ──────────────────────────────────────────────

  describe('getSessions', () => {
    it('doit retourner la liste des sessions', () => {
      const mockSessions: ChatSession[] = [
        { id: 1, sessionTitle: 'Session 1', active: true, messages: [] },
        { id: 2, sessionTitle: 'Session 2', active: false, messages: [] },
      ];

      service.getSessions().subscribe(sessions => {
        expect(sessions.length).toBe(2);
        expect(sessions[0].sessionTitle).toBe('Session 1');
      });

      const req = httpMock.expectOne(`${API_BASE}/sessions`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSessions);
    });

    it('retourne une liste vide si aucune session', () => {
      service.getSessions().subscribe(sessions => {
        expect(sessions).toEqual([]);
      });
      httpMock.expectOne(`${API_BASE}/sessions`).flush([]);
    });
  });

  // ── sendMessage ──────────────────────────────────────────────

  describe('sendMessage', () => {
    it('doit POST le message et retourner la réponse IA', () => {
      const mockResponse: ChatMessage = {
        id: 10,
        sessionId: 1,
        role: 'assistant',
        content: 'Le CNSS salarial est de 9,18%.',
        sentAt: new Date().toISOString(),
        escalatedToHuman: false,
      };

      service.sendMessage(1, 'Quel est le taux CNSS ?').subscribe(msg => {
        expect(msg.role).toBe('assistant');
        expect(msg.content).toContain('CNSS');
        expect(msg.escalatedToHuman).toBeFalse();
      });

      const req = httpMock.expectOne(`${API_BASE}/sessions/1/messages`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ message: 'Quel est le taux CNSS ?' });
      req.flush(mockResponse);
    });

    it('doit gérer une réponse avec escalade RH', () => {
      const escaladeResponse: ChatMessage = {
        id: 11,
        sessionId: 1,
        role: 'assistant',
        content: 'Je ne peux pas résoudre ça.',
        sentAt: new Date().toISOString(),
        escalatedToHuman: true,
      };

      service.sendMessage(1, 'Problème urgent').subscribe(msg => {
        expect(msg.escalatedToHuman).toBeTrue();
      });

      httpMock.expectOne(`${API_BASE}/sessions/1/messages`).flush(escaladeResponse);
    });

    it('doit gérer une erreur 500 du serveur IA', () => {
      let errorReceived = false;
      service.sendMessage(1, 'message').subscribe({
        error: err => {
          errorReceived = true;
          expect(err.status).toBe(500);
        },
      });

      httpMock
        .expectOne(`${API_BASE}/sessions/1/messages`)
        .flush({ message: 'Internal Server Error' }, { status: 500, statusText: 'Server Error' });
      expect(errorReceived).toBeTrue();
    });
  });

  // ── checkHealth ──────────────────────────────────────────────

  describe('checkHealth', () => {
    it('doit appeler GET /health', () => {
      service.checkHealth().subscribe();
      const req = httpMock.expectOne(`${API_BASE}/health`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'UP', ollamaOnline: true });
    });

    it('doit émettre une erreur si Ollama est hors ligne (503)', () => {
      let errorCalled = false;
      service.checkHealth().subscribe({
        error: () => {
          errorCalled = true;
        },
      });
      httpMock.expectOne(`${API_BASE}/health`).flush({ message: 'Ollama unavailable' }, { status: 503, statusText: 'Service Unavailable' });
      expect(errorCalled).toBeTrue();
    });
  });
});
