import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { ChatSessionService } from '../service/chat-session.service';
import { IChatSession } from '../chat-session.model';
import { ChatSessionFormService } from './chat-session-form.service';

import { ChatSessionUpdateComponent } from './chat-session-update.component';

describe('ChatSession Management Update Component', () => {
  let comp: ChatSessionUpdateComponent;
  let fixture: ComponentFixture<ChatSessionUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let chatSessionFormService: ChatSessionFormService;
  let chatSessionService: ChatSessionService;
  let employeeService: EmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatSessionUpdateComponent],
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
      .overrideTemplate(ChatSessionUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ChatSessionUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    chatSessionFormService = TestBed.inject(ChatSessionFormService);
    chatSessionService = TestBed.inject(ChatSessionService);
    employeeService = TestBed.inject(EmployeeService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Employee query and add missing value', () => {
      const chatSession: IChatSession = { id: 10840 };
      const employee: IEmployee = { id: 1749 };
      chatSession.employee = employee;

      const employeeCollection: IEmployee[] = [{ id: 1749 }];
      jest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      jest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ chatSession });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(expect.objectContaining),
      );
      expect(comp.employeesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const chatSession: IChatSession = { id: 10840 };
      const employee: IEmployee = { id: 1749 };
      chatSession.employee = employee;

      activatedRoute.data = of({ chatSession });
      comp.ngOnInit();

      expect(comp.employeesSharedCollection).toContainEqual(employee);
      expect(comp.chatSession).toEqual(chatSession);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChatSession>>();
      const chatSession = { id: 29816 };
      jest.spyOn(chatSessionFormService, 'getChatSession').mockReturnValue(chatSession);
      jest.spyOn(chatSessionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ chatSession });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: chatSession }));
      saveSubject.complete();

      // THEN
      expect(chatSessionFormService.getChatSession).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(chatSessionService.update).toHaveBeenCalledWith(expect.objectContaining(chatSession));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChatSession>>();
      const chatSession = { id: 29816 };
      jest.spyOn(chatSessionFormService, 'getChatSession').mockReturnValue({ id: null });
      jest.spyOn(chatSessionService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ chatSession: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: chatSession }));
      saveSubject.complete();

      // THEN
      expect(chatSessionFormService.getChatSession).toHaveBeenCalled();
      expect(chatSessionService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IChatSession>>();
      const chatSession = { id: 29816 };
      jest.spyOn(chatSessionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ chatSession });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(chatSessionService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareEmployee', () => {
      it('should forward to employeeService', () => {
        const entity = { id: 1749 };
        const entity2 = { id: 1545 };
        jest.spyOn(employeeService, 'compareEmployee');
        comp.compareEmployee(entity, entity2);
        expect(employeeService.compareEmployee).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
