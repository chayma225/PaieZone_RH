import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../chat-session.test-samples';

import { ChatSessionFormService } from './chat-session-form.service';

describe('ChatSession Form Service', () => {
  let service: ChatSessionFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatSessionFormService);
  });

  describe('Service methods', () => {
    describe('createChatSessionFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createChatSessionFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            channel: expect.any(Object),
            status: expect.any(Object),
            startedAt: expect.any(Object),
            endedAt: expect.any(Object),
            escalatedAt: expect.any(Object),
            escalatedTo: expect.any(Object),
            contextData: expect.any(Object),
            satisfactionScore: expect.any(Object),
            employee: expect.any(Object),
          }),
        );
      });

      it('passing IChatSession should create a new form with FormGroup', () => {
        const formGroup = service.createChatSessionFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            channel: expect.any(Object),
            status: expect.any(Object),
            startedAt: expect.any(Object),
            endedAt: expect.any(Object),
            escalatedAt: expect.any(Object),
            escalatedTo: expect.any(Object),
            contextData: expect.any(Object),
            satisfactionScore: expect.any(Object),
            employee: expect.any(Object),
          }),
        );
      });
    });

    describe('getChatSession', () => {
      it('should return NewChatSession for default ChatSession initial value', () => {
        const formGroup = service.createChatSessionFormGroup(sampleWithNewData);

        const chatSession = service.getChatSession(formGroup) as any;

        expect(chatSession).toMatchObject(sampleWithNewData);
      });

      it('should return NewChatSession for empty ChatSession initial value', () => {
        const formGroup = service.createChatSessionFormGroup();

        const chatSession = service.getChatSession(formGroup) as any;

        expect(chatSession).toMatchObject({});
      });

      it('should return IChatSession', () => {
        const formGroup = service.createChatSessionFormGroup(sampleWithRequiredData);

        const chatSession = service.getChatSession(formGroup) as any;

        expect(chatSession).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IChatSession should not enable id FormControl', () => {
        const formGroup = service.createChatSessionFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewChatSession should disable id FormControl', () => {
        const formGroup = service.createChatSessionFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
