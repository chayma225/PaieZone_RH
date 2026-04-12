import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { TimeEntryService } from '../service/time-entry.service';
import { ITimeEntry } from '../time-entry.model';

import { TimeEntryFormService } from './time-entry-form.service';
import { TimeEntryUpdate } from './time-entry-update';

describe('TimeEntry Management Update Component', () => {
  let comp: TimeEntryUpdate;
  let fixture: ComponentFixture<TimeEntryUpdate>;
  let activatedRoute: ActivatedRoute;
  let timeEntryFormService: TimeEntryFormService;
  let timeEntryService: TimeEntryService;
  let employeeService: EmployeeService;
  let userProfileService: UserProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    });

    fixture = TestBed.createComponent(TimeEntryUpdate);
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
      vitest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      vitest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ timeEntry });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.employeesSharedCollection()).toEqual(expectedCollection);
    });

    it('should call UserProfile query and add missing value', () => {
      const timeEntry: ITimeEntry = { id: 25006 };
      const validatedByUser: IUserProfile = { id: 22058 };
      timeEntry.validatedByUser = validatedByUser;

      const userProfileCollection: IUserProfile[] = [{ id: 22058 }];
      vitest.spyOn(userProfileService, 'query').mockReturnValue(of(new HttpResponse({ body: userProfileCollection })));
      const additionalUserProfiles = [validatedByUser];
      const expectedCollection: IUserProfile[] = [...additionalUserProfiles, ...userProfileCollection];
      vitest.spyOn(userProfileService, 'addUserProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ timeEntry });
      comp.ngOnInit();

      expect(userProfileService.query).toHaveBeenCalled();
      expect(userProfileService.addUserProfileToCollectionIfMissing).toHaveBeenCalledWith(
        userProfileCollection,
        ...additionalUserProfiles.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.userProfilesSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const timeEntry: ITimeEntry = { id: 25006 };
      const employee: IEmployee = { id: 1749 };
      timeEntry.employee = employee;
      const validatedByUser: IUserProfile = { id: 22058 };
      timeEntry.validatedByUser = validatedByUser;

      activatedRoute.data = of({ timeEntry });
      comp.ngOnInit();

      expect(comp.employeesSharedCollection()).toContainEqual(employee);
      expect(comp.userProfilesSharedCollection()).toContainEqual(validatedByUser);
      expect(comp.timeEntry).toEqual(timeEntry);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<ITimeEntry>();
      const timeEntry = { id: 25946 };
      vitest.spyOn(timeEntryFormService, 'getTimeEntry').mockReturnValue(timeEntry);
      vitest.spyOn(timeEntryService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeEntry });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(timeEntry);
      saveSubject.complete();

      // THEN
      expect(timeEntryFormService.getTimeEntry).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(timeEntryService.update).toHaveBeenCalledWith(expect.objectContaining(timeEntry));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<ITimeEntry>();
      const timeEntry = { id: 25946 };
      vitest.spyOn(timeEntryFormService, 'getTimeEntry').mockReturnValue({ id: null });
      vitest.spyOn(timeEntryService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeEntry: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(timeEntry);
      saveSubject.complete();

      // THEN
      expect(timeEntryFormService.getTimeEntry).toHaveBeenCalled();
      expect(timeEntryService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<ITimeEntry>();
      const timeEntry = { id: 25946 };
      vitest.spyOn(timeEntryService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeEntry });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(timeEntryService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareEmployee', () => {
      it('should forward to employeeService', () => {
        const entity = { id: 1749 };
        const entity2 = { id: 1545 };
        vitest.spyOn(employeeService, 'compareEmployee');
        comp.compareEmployee(entity, entity2);
        expect(employeeService.compareEmployee).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareUserProfile', () => {
      it('should forward to userProfileService', () => {
        const entity = { id: 22058 };
        const entity2 = { id: 9009 };
        vitest.spyOn(userProfileService, 'compareUserProfile');
        comp.compareUserProfile(entity, entity2);
        expect(userProfileService.compareUserProfile).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
