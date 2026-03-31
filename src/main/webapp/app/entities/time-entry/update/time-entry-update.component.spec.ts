import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';
import { ITimeEntry } from '../time-entry.model';
import { TimeEntryService } from '../service/time-entry.service';
import { TimeEntryFormService } from './time-entry-form.service';

import { TimeEntryUpdateComponent } from './time-entry-update.component';

describe('TimeEntry Management Update Component', () => {
  let comp: TimeEntryUpdateComponent;
  let fixture: ComponentFixture<TimeEntryUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let timeEntryFormService: TimeEntryFormService;
  let timeEntryService: TimeEntryService;
  let employeeService: EmployeeService;
  let userProfileService: UserProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TimeEntryUpdateComponent],
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
      .overrideTemplate(TimeEntryUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TimeEntryUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    timeEntryFormService = TestBed.inject(TimeEntryFormService);
    timeEntryService = TestBed.inject(TimeEntryService);
    employeeService = TestBed.inject(EmployeeService);
    userProfileService = TestBed.inject(UserProfileService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Employee query and add missing value', () => {
      const timeEntry: ITimeEntry = { id: 25006 };
      const employee: IEmployee = { id: 1749 };
      timeEntry.employee = employee;

      const employeeCollection: IEmployee[] = [{ id: 1749 }];
      jest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      jest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ timeEntry });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(expect.objectContaining),
      );
      expect(comp.employeesSharedCollection).toEqual(expectedCollection);
    });

    it('should call UserProfile query and add missing value', () => {
      const timeEntry: ITimeEntry = { id: 25006 };
      const validatedByUser: IUserProfile = { id: 22058 };
      timeEntry.validatedByUser = validatedByUser;

      const userProfileCollection: IUserProfile[] = [{ id: 22058 }];
      jest.spyOn(userProfileService, 'query').mockReturnValue(of(new HttpResponse({ body: userProfileCollection })));
      const additionalUserProfiles = [validatedByUser];
      const expectedCollection: IUserProfile[] = [...additionalUserProfiles, ...userProfileCollection];
      jest.spyOn(userProfileService, 'addUserProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ timeEntry });
      comp.ngOnInit();

      expect(userProfileService.query).toHaveBeenCalled();
      expect(userProfileService.addUserProfileToCollectionIfMissing).toHaveBeenCalledWith(
        userProfileCollection,
        ...additionalUserProfiles.map(expect.objectContaining),
      );
      expect(comp.userProfilesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const timeEntry: ITimeEntry = { id: 25006 };
      const employee: IEmployee = { id: 1749 };
      timeEntry.employee = employee;
      const validatedByUser: IUserProfile = { id: 22058 };
      timeEntry.validatedByUser = validatedByUser;

      activatedRoute.data = of({ timeEntry });
      comp.ngOnInit();

      expect(comp.employeesSharedCollection).toContainEqual(employee);
      expect(comp.userProfilesSharedCollection).toContainEqual(validatedByUser);
      expect(comp.timeEntry).toEqual(timeEntry);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITimeEntry>>();
      const timeEntry = { id: 25946 };
      jest.spyOn(timeEntryFormService, 'getTimeEntry').mockReturnValue(timeEntry);
      jest.spyOn(timeEntryService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeEntry });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: timeEntry }));
      saveSubject.complete();

      // THEN
      expect(timeEntryFormService.getTimeEntry).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(timeEntryService.update).toHaveBeenCalledWith(expect.objectContaining(timeEntry));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITimeEntry>>();
      const timeEntry = { id: 25946 };
      jest.spyOn(timeEntryFormService, 'getTimeEntry').mockReturnValue({ id: null });
      jest.spyOn(timeEntryService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeEntry: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: timeEntry }));
      saveSubject.complete();

      // THEN
      expect(timeEntryFormService.getTimeEntry).toHaveBeenCalled();
      expect(timeEntryService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITimeEntry>>();
      const timeEntry = { id: 25946 };
      jest.spyOn(timeEntryService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeEntry });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(timeEntryService.update).toHaveBeenCalled();
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

    describe('compareUserProfile', () => {
      it('should forward to userProfileService', () => {
        const entity = { id: 22058 };
        const entity2 = { id: 9009 };
        jest.spyOn(userProfileService, 'compareUserProfile');
        comp.compareUserProfile(entity, entity2);
        expect(userProfileService.compareUserProfile).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
