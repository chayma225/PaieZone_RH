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
import { IHrDocument } from '../hr-document.model';
import { HrDocumentService } from '../service/hr-document.service';

import { HrDocumentFormService } from './hr-document-form.service';
import { HrDocumentUpdate } from './hr-document-update';

describe('HrDocument Management Update Component', () => {
  let comp: HrDocumentUpdate;
  let fixture: ComponentFixture<HrDocumentUpdate>;
  let activatedRoute: ActivatedRoute;
  let hrDocumentFormService: HrDocumentFormService;
  let hrDocumentService: HrDocumentService;
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

    fixture = TestBed.createComponent(HrDocumentUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    hrDocumentFormService = TestBed.inject(HrDocumentFormService);
    hrDocumentService = TestBed.inject(HrDocumentService);
    employeeService = TestBed.inject(EmployeeService);
    userProfileService = TestBed.inject(UserProfileService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Employee query and add missing value', () => {
      const hrDocument: IHrDocument = { id: 12636 };
      const employee: IEmployee = { id: 1749 };
      hrDocument.employee = employee;

      const employeeCollection: IEmployee[] = [{ id: 1749 }];
      vitest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      vitest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ hrDocument });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.employeesSharedCollection()).toEqual(expectedCollection);
    });

    it('should call UserProfile query and add missing value', () => {
      const hrDocument: IHrDocument = { id: 12636 };
      const uploadedBy: IUserProfile = { id: 22058 };
      hrDocument.uploadedBy = uploadedBy;

      const userProfileCollection: IUserProfile[] = [{ id: 22058 }];
      vitest.spyOn(userProfileService, 'query').mockReturnValue(of(new HttpResponse({ body: userProfileCollection })));
      const additionalUserProfiles = [uploadedBy];
      const expectedCollection: IUserProfile[] = [...additionalUserProfiles, ...userProfileCollection];
      vitest.spyOn(userProfileService, 'addUserProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ hrDocument });
      comp.ngOnInit();

      expect(userProfileService.query).toHaveBeenCalled();
      expect(userProfileService.addUserProfileToCollectionIfMissing).toHaveBeenCalledWith(
        userProfileCollection,
        ...additionalUserProfiles.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.userProfilesSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const hrDocument: IHrDocument = { id: 12636 };
      const employee: IEmployee = { id: 1749 };
      hrDocument.employee = employee;
      const uploadedBy: IUserProfile = { id: 22058 };
      hrDocument.uploadedBy = uploadedBy;

      activatedRoute.data = of({ hrDocument });
      comp.ngOnInit();

      expect(comp.employeesSharedCollection()).toContainEqual(employee);
      expect(comp.userProfilesSharedCollection()).toContainEqual(uploadedBy);
      expect(comp.hrDocument).toEqual(hrDocument);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IHrDocument>();
      const hrDocument = { id: 28321 };
      vitest.spyOn(hrDocumentFormService, 'getHrDocument').mockReturnValue(hrDocument);
      vitest.spyOn(hrDocumentService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ hrDocument });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(hrDocument);
      saveSubject.complete();

      // THEN
      expect(hrDocumentFormService.getHrDocument).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(hrDocumentService.update).toHaveBeenCalledWith(expect.objectContaining(hrDocument));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IHrDocument>();
      const hrDocument = { id: 28321 };
      vitest.spyOn(hrDocumentFormService, 'getHrDocument').mockReturnValue({ id: null });
      vitest.spyOn(hrDocumentService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ hrDocument: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(hrDocument);
      saveSubject.complete();

      // THEN
      expect(hrDocumentFormService.getHrDocument).toHaveBeenCalled();
      expect(hrDocumentService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IHrDocument>();
      const hrDocument = { id: 28321 };
      vitest.spyOn(hrDocumentService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ hrDocument });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(hrDocumentService.update).toHaveBeenCalled();
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
