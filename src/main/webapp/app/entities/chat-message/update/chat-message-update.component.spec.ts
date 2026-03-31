import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IChatSession } from 'app/entities/chat-session/chat-session.model';
import { ChatSessionService } from 'app/entities/chat-session/service/chat-session.service';
import { ChatMessageService } from '../service/chat-message.service';
import { IChatMessage } from '../chat-message.model';
import { ChatMessageFormService } from './chat-message-form.service';

import { ChatMessageUpdateComponent } from './chat-message-update.component';

describe('ChatMessage Management Update Component', () => {
  let comp: ChatMessageUpdateComponent;
  let fixture: ComponentFixture<ChatMessageUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let chatMessageFormService: ChatMessageFormService;
  let chatMessageService: ChatMessageService;
  let chatSessionService: ChatSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatMessageUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(ChatMessageUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ChatMessageUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    chatMessageFormService = TestBed.inject(ChatMessageFormService);
    chatMessageService = TestBed.inject(ChatMessageService);
    chatSessionService = TestBed.inject(ChatSessionService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call ChatSession query and add missing value', () => {
      const chatMessage: IChatMessage = { id: 15525 };
      const session: IChatSession = { id: 29816 };
      chatMessage.session = session;

      const chatSessionCollection: IChatSession[] = [{ id: 29816 }];
      jest.spyOn(chatSessionService, 'query').mockReturnValue(of(new HttpResponse({ body: chatSessionCollection })));
      const additionalChatSessions = [session];
      const expectedCollection: IChatSession[] = [...additionalChatSessions, ...chatSessionCollection];
      jest.spyOn(chatSessionService, 'addChatSessionToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ chatMessage });
      comp.ngOnInit();

      expect(chatSessionService.query).toHaveBeenCalled();
      expect(chatSessionService.addChatSessionToCollectionIfMissing).toHaveBeenCalledWith(
        chatSessionCollection,
        ...additionalChatSessions.map(expect.objectContaining),
      );
      expect(comp.chatSessionsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const chatMessage: IChatMessage = { id: 15525 };
      const session: IChatSession = { id: 29816 };
      chatMessage.session = session;

      activatedRoute.data = of({ chatMessage });
      comp.ngOnInit();

      expect(comp.chatSessionsSharedCollection).toContainEqual(session);
      expect(comp.chatMessage).toEqual(chatMessage);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChatMessage>>();
      const chatMessage = { id: 4123 };
      jest.spyOn(chatMessageFormService, 'getChatMessage').mockReturnValue(chatMessage);
      jest.spyOn(chatMessageService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ chatMessage });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: chatMessage }));
      saveSubject.complete();

      // THEN
      expect(chatMessageFormService.getChatMessage).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(chatMessageService.update).toHaveBeenCalledWith(expect.objectContaining(chatMessage));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChatMessage>>();
      const chatMessage = { id: 4123 };
      jest.spyOn(chatMessageFormService, 'getChatMessage').mockReturnValue({ id: null });
      jest.spyOn(chatMessageService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ chatMessage: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: chatMessage }));
      saveSubject.complete();

      // THEN
      expect(chatMessageFormService.getChatMessage).toHaveBeenCalled();
      expect(chatMessageService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChatMessage>>();
      const chatMessage = { id: 4123 };
      jest.spyOn(chatMessageService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ chatMessage });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(chatMessageService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareChatSession', () => {
      it('should forward to chatSessionService', () => {
        const entity = { id: 29816 };
        const entity2 = { id: 10840 };
        jest.spyOn(chatSessionService, 'compareChatSession');
        comp.compareChatSession(entity, entity2);
        expect(chatSessionService.compareChatSession).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
