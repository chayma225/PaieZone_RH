import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangeDetectionStrategy } from '@angular/core';
import { of, throwError } from 'rxjs';

import { ChatbotComponent } from './chatbot.component';
import { ChatbotService } from './chatbot.service';
import { ChatSession, ChatMessage } from './chatbot.model';

/**
 * Tests composant ChatbotComponent (jhi-chatbot)
 *
 * Couvre :
 * - Rendu initial (FAB visible, panneau fermé)
 * - Ouverture / fermeture du panneau
 * - Affichage du message de bienvenue
 * - Envoi d'un message utilisateur
 * - Routing local : congés, avances, bulletin
 * - Désactivation bouton envoi (input vide)
 * - Indicateur de chargement (isLoading)
 */
describe('ChatbotComponent', () => {
  let component: ChatbotComponent;
  let fixture: ComponentFixture<ChatbotComponent>;
  let chatbotServiceSpy: jasmine.SpyObj<ChatbotService>;

  const mockSession: ChatSession = {
    id: 1,
    sessionTitle: 'Test',
    active: true,
    messages: [],
  };

  const mockBotResponse: ChatMessage = {
    id: 10,
    sessionId: 1,
    role: 'assistant',
    content: 'Le taux CNSS est de 9,18%.',
    sentAt: new Date().toISOString(),
    escalatedToHuman: false,
  };

  beforeEach(async () => {
    chatbotServiceSpy = jasmine.createSpyObj('ChatbotService', ['createSession', 'getSessions', 'sendMessage', 'checkHealth']);

    chatbotServiceSpy.checkHealth.and.returnValue(of({ status: 'UP', ollamaOnline: true } as any));
    chatbotServiceSpy.getSessions.and.returnValue(of([]));
    chatbotServiceSpy.createSession.and.returnValue(of(mockSession));
    chatbotServiceSpy.sendMessage.and.returnValue(of(mockBotResponse));

    await TestBed.configureTestingModule({
      imports: [ChatbotComponent, FormsModule, RouterTestingModule],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: ChatbotService, useValue: chatbotServiceSpy }],
    })
      .overrideComponent(ChatbotComponent, {
        // Désactiver OnPush pour simplifier les tests
        set: { changeDetection: ChangeDetectionStrategy.Default },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Rendu initial ──────────────────────────────────────────────

  describe('Rendu initial', () => {
    it('doit créer le composant', () => {
      expect(component).toBeTruthy();
    });

    it('le bouton FAB doit être visible', () => {
      const fab = fixture.nativeElement.querySelector('.pz-chatbot__toggle');
      expect(fab).toBeTruthy();
    });

    it('le panneau chatbot doit être fermé par défaut', () => {
      expect(component.isOpen).toBeFalse();
      const panel = fixture.nativeElement.querySelector('.pz-chatbot__panel');
      if (panel) {
        expect(panel.classList.contains('pz-chatbot__panel--open')).toBeFalse();
      }
    });

    it("checkHealth doit être appelé à l'initialisation", () => {
      expect(chatbotServiceSpy.checkHealth).toHaveBeenCalled();
    });
  });

  // ── Ouverture / fermeture ──────────────────────────────────────

  describe('Ouverture et fermeture du panneau', () => {
    it('toggleChat() doit ouvrir le panneau', () => {
      component.toggleChat();
      fixture.detectChanges();
      expect(component.isOpen).toBeTrue();
    });

    it('double toggleChat() doit refermer le panneau', () => {
      component.toggleChat();
      component.toggleChat();
      fixture.detectChanges();
      expect(component.isOpen).toBeFalse();
    });

    it("l'ouverture doit créer une session si aucune n'existe", () => {
      component.toggleChat();
      fixture.detectChanges();
      expect(chatbotServiceSpy.createSession).toHaveBeenCalled();
    });

    it('message de bienvenue affiché après ouverture', fakeAsync(() => {
      component.toggleChat();
      tick(50);
      fixture.detectChanges();
      expect(component.messages.length).toBeGreaterThan(0);
      expect(component.messages[0].role).toBe('assistant');
      expect(component.messages[0].content).toContain('Bonjour');
    }));
  });

  // ── Envoi de message ───────────────────────────────────────────

  describe('Envoi de message', () => {
    beforeEach(fakeAsync(() => {
      component.toggleChat();
      tick(50);
      fixture.detectChanges();
    }));

    it('sendMessage() doit ajouter la bulle utilisateur', () => {
      const initialCount = component.messages.length;
      component.currentMessage = 'Quel est le CNSS ?';
      component.sendMessage();
      fixture.detectChanges();
      expect(component.messages.length).toBeGreaterThan(initialCount);
      const userMsg = component.messages.find(m => m.role === 'user');
      expect(userMsg?.content).toBe('Quel est le CNSS ?');
    });

    it("sendMessage() doit vider l'input après envoi", () => {
      component.currentMessage = 'Test message';
      component.sendMessage();
      fixture.detectChanges();
      expect(component.currentMessage).toBe('');
    });

    it('sendMessage() avec input vide → ne doit rien envoyer', () => {
      component.currentMessage = '';
      component.sendMessage();
      expect(chatbotServiceSpy.sendMessage).not.toHaveBeenCalled();
    });

    it('sendMessage() avec input vide (espaces) → ne doit rien envoyer', () => {
      component.currentMessage = '   ';
      component.sendMessage();
      expect(chatbotServiceSpy.sendMessage).not.toHaveBeenCalled();
    });

    it('sendMessage() ne doit pas envoyer si isLoading = true', () => {
      component.isLoading = true;
      component.currentMessage = 'message';
      component.sendMessage();
      expect(chatbotServiceSpy.sendMessage).not.toHaveBeenCalled();
    });

    it('sendMessage() doit appeler chatbotService.sendMessage()', fakeAsync(() => {
      component.currentMessage = 'Quel est le CNSS ?';
      component.sendMessage();
      tick();
      expect(chatbotServiceSpy.sendMessage).toHaveBeenCalledWith(mockSession.id, 'Quel est le CNSS ?');
    }));

    it('réponse IA ajoutée aux messages après appel réussi', fakeAsync(() => {
      component.currentMessage = 'Quel est le CNSS ?';
      component.sendMessage();
      tick();
      fixture.detectChanges();
      const botMessages = component.messages.filter(m => m.role === 'assistant');
      expect(botMessages.length).toBeGreaterThan(0);
    }));
  });

  // ── Routing local (congés / avances / bulletin) ────────────────

  describe('Routing local sans appel IA', () => {
    beforeEach(fakeAsync(() => {
      component.toggleChat();
      tick(50);
      fixture.detectChanges();
    }));

    it('message sur congés → bouton "Mes congés" ajouté', () => {
      component.currentMessage = 'Je veux poser un congé';
      component.sendMessage();
      fixture.detectChanges();

      const actionMsg = component.messages.find(m => m.actionLink?.label?.includes('congés'));
      expect(actionMsg).toBeTruthy();
      // L'IA ne doit PAS être appelée pour ce cas
      expect(chatbotServiceSpy.sendMessage).not.toHaveBeenCalled();
    });

    it('message sur avance → bouton "Mes demandes" ajouté', () => {
      component.currentMessage = 'Demander une avance sur salaire';
      component.sendMessage();
      fixture.detectChanges();

      const actionMsg = component.messages.find(m => m.actionLink?.label?.includes('demande'));
      expect(actionMsg).toBeTruthy();
      expect(chatbotServiceSpy.sendMessage).not.toHaveBeenCalled();
    });
  });

  // ── Gestion erreur Ollama ──────────────────────────────────────

  describe('Gestion erreur Ollama', () => {
    beforeEach(fakeAsync(() => {
      component.toggleChat();
      tick(50);
    }));

    it("erreur API → message d'erreur affiché sans crash", fakeAsync(() => {
      chatbotServiceSpy.sendMessage.and.returnValue(throwError(() => ({ status: 500 })));
      component.currentMessage = 'test';
      component.sendMessage();
      tick();
      fixture.detectChanges();
      expect(component.isLoading).toBeFalse();
      const errorMsg = component.messages.find(m => m.role === 'assistant' && m.content.includes('Erreur'));
      expect(errorMsg).toBeTruthy();
    }));
  });

  // ── Accessibilité ──────────────────────────────────────────────

  describe('Accessibilité', () => {
    it('le FAB a un aria-label', () => {
      const fab = fixture.nativeElement.querySelector('.pz-chatbot__toggle');
      expect(fab?.getAttribute('aria-label')).toBeTruthy();
    });

    it('le panneau a role="dialog"', () => {
      component.toggleChat();
      fixture.detectChanges();
      const panel = fixture.nativeElement.querySelector('[role="dialog"]');
      expect(panel).toBeTruthy();
    });
  });
});
