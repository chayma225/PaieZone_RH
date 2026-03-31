import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { ILeaveType } from 'app/entities/leave-type/leave-type.model';
import { LeaveTypeService } from 'app/entities/leave-type/service/leave-type.service';
import { IUserProfile } from 'app/entities/user-profile/user-profile.model';
import { UserProfileService } from 'app/entities/user-profile/service/user-profile.service';
import { ILeaveRequest } from '../leave-request.model';
import { LeaveRequestService } from '../service/leave-request.service';
import { LeaveRequestFormService } from './leave-request-form.service';

import { LeaveRequestUpdateComponent } from './leave-request-update.component';

describe('LeaveRequest Management Update Component', () => {
  let comp: LeaveRequestUpdateComponent;
  let fixture: ComponentFixture<LeaveRequestUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let leaveRequestFormService: LeaveRequestFormService;
  let leaveRequestService: LeaveRequestService;
  let employeeService: EmployeeService;
  let leaveTypeService: LeaveTypeService;
  let userProfileService: UserProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LeaveRequestUpdateComponent],
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
      .overrideTemplate(LeaveRequestUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(LeaveRequestUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    leaveRequestFormService = TestBed.inject(LeaveRequestFormService);
    leaveRequestService = TestBed.inject(LeaveRequestService);
    employeeService = TestBed.inject(EmployeeService);
    leaveTypeService = TestBed.inject(LeaveTypeService);
    userProfileService = TestBed.inject(UserProfileService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Employee query and add missing value', () => {
      const leaveRequest: ILeaveRequest = { id: 18104 };
      const employee: IEmployee = { id: 1749 };
      leaveRequest.employee = employee;

      const employeeCollection: IEmployee[] = [{ id: 1749 }];
      jest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      jest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ leaveRequest });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(expect.objectContaining),
      );
      expect(comp.employeesSharedCollection).toEqual(expectedCollection);
    });

    it('should call LeaveType query and add missing value', () => {
      const leaveRequest: ILeaveRequest = { id: 18104 };
      const leaveType: ILeaveType = { id: 22862 };
      leaveRequest.leaveType = leaveType;

      const leaveTypeCollection: ILeaveType[] = [{ id: 22862 }];
      jest.spyOn(leaveTypeService, 'query').mockReturnValue(of(new HttpResponse({ body: leaveTypeCollection })));
      const additionalLeaveTypes = [leaveType];
      const expectedCollection: ILeaveType[] = [...additionalLeaveTypes, ...leaveTypeCollection];
      jest.spyOn(leaveTypeService, 'addLeaveTypeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ leaveRequest });
      comp.ngOnInit();

      expect(leaveTypeService.query).toHaveBeenCalled();
      expect(leaveTypeService.addLeaveTypeToCollectionIfMissing).toHaveBeenCalledWith(
        leaveTypeCollection,
        ...additionalLeaveTypes.map(expect.objectContaining),
      );
      expect(comp.leaveTypesSharedCollection).toEqual(expectedCollection);
    });

    it('should call UserProfile query and add missing value', () => {
      const leaveRequest: ILeaveRequest = { id: 18104 };
      const approvedBy: IUserProfile = { id: 22058 };
      leaveRequest.approvedBy = approvedBy;

      const userProfileCollection: IUserProfile[] = [{ id: 22058 }];
      jest.spyOn(userProfileService, 'query').mockReturnValue(of(new HttpResponse({ body: userProfileCollection })));
      const additionalUserProfiles = [approvedBy];
      const expectedCollection: IUserProfile[] = [...additionalUserProfiles, ...userProfileCollection];
      jest.spyOn(userProfileService, 'addUserProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ leaveRequest });
      comp.ngOnInit();

      expect(userProfileService.query).toHaveBeenCalled();
      expect(userProfileService.addUserProfileToCollectionIfMissing).toHaveBeenCalledWith(
        userProfileCollection,
        ...additionalUserProfiles.map(expect.objectContaining),
      );
      expect(comp.userProfilesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const leaveRequest: ILeaveRequest = { id: 18104 };
      const employee: IEmployee = { id: 1749 };
      leaveRequest.employee = employee;
      const leaveType: ILeaveType = { id: 22862 };
      leaveRequest.leaveType = leaveType;
      const approvedBy: IUserProfile = { id: 22058 };
      leaveRequest.approvedBy = approvedBy;

      activatedRoute.data = of({ leaveRequest });
      comp.ngOnInit();

      expect(comp.employeesSharedCollection).toContainEqual(employee);
      expect(comp.leaveTypesSharedCollection).toContainEqual(leaveType);
      expect(comp.userProfilesSharedCollection).toContainEqual(approvedBy);
      expect(comp.leaveRequest).toEqual(leaveRequest);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILeaveRequest>>();
      const leaveRequest = { id: 25258 };
      jest.spyOn(leaveRequestFormService, 'getLeaveRequest').mockReturnValue(leaveRequest);
      jest.spyOn(leaveRequestService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaveRequest });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: leaveRequest }));
      saveSubject.complete();

      // THEN
      expect(leaveRequestFormService.getLeaveRequest).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(leaveRequestService.update).toHaveBeenCalledWith(expect.objectContaining(leaveRequest));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILeaveRequest>>();
      const leaveRequest = { id: 25258 };
      jest.spyOn(leaveRequestFormService, 'getLeaveRequest').mockReturnValue({ id: null });
      jest.spyOn(leaveRequestService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaveRequest: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: leaveRequest }));
      saveSubject.complete();

      // THEN
      expect(leaveRequestFormService.getLeaveRequest).toHaveBeenCalled();
      expect(leaveRequestService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILeaveRequest>>();
      const leaveRequest = { id: 25258 };
      jest.spyOn(leaveRequestService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaveRequest });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(leaveRequestService.update).toHaveBeenCalled();
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

    describe('compareLeaveType', () => {
      it('should forward to leaveTypeService', () => {
        const entity = { id: 22862 };
        const entity2 = { id: 27866 };
        jest.spyOn(leaveTypeService, 'compareLeaveType');
        comp.compareLeaveType(entity, entity2);
        expect(leaveTypeService.compareLeaveType).toHaveBeenCalledWith(entity, entity2);
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
