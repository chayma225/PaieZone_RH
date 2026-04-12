import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { ILeaveType } from '../leave-type.model';
import { LeaveTypeService } from '../service/leave-type.service';

import { LeaveTypeFormService } from './leave-type-form.service';
import { LeaveTypeUpdate } from './leave-type-update';

describe('LeaveType Management Update Component', () => {
  let comp: LeaveTypeUpdate;
  let fixture: ComponentFixture<LeaveTypeUpdate>;
  let activatedRoute: ActivatedRoute;
  let leaveTypeFormService: LeaveTypeFormService;
  let leaveTypeService: LeaveTypeService;
  let companyService: CompanyService;

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

    fixture = TestBed.createComponent(LeaveTypeUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    leaveTypeFormService = TestBed.inject(LeaveTypeFormService);
    leaveTypeService = TestBed.inject(LeaveTypeService);
    companyService = TestBed.inject(CompanyService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Company query and add missing value', () => {
      const leaveType: ILeaveType = { id: 27866 };
      const company: ICompany = { id: 29751 };
      leaveType.company = company;

      const companyCollection: ICompany[] = [{ id: 29751 }];
      vitest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      vitest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ leaveType });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.companiesSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const leaveType: ILeaveType = { id: 27866 };
      const company: ICompany = { id: 29751 };
      leaveType.company = company;

      activatedRoute.data = of({ leaveType });
      comp.ngOnInit();

      expect(comp.companiesSharedCollection()).toContainEqual(company);
      expect(comp.leaveType).toEqual(leaveType);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<ILeaveType>();
      const leaveType = { id: 22862 };
      vitest.spyOn(leaveTypeFormService, 'getLeaveType').mockReturnValue(leaveType);
      vitest.spyOn(leaveTypeService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaveType });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(leaveType);
      saveSubject.complete();

      // THEN
      expect(leaveTypeFormService.getLeaveType).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(leaveTypeService.update).toHaveBeenCalledWith(expect.objectContaining(leaveType));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<ILeaveType>();
      const leaveType = { id: 22862 };
      vitest.spyOn(leaveTypeFormService, 'getLeaveType').mockReturnValue({ id: null });
      vitest.spyOn(leaveTypeService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaveType: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(leaveType);
      saveSubject.complete();

      // THEN
      expect(leaveTypeFormService.getLeaveType).toHaveBeenCalled();
      expect(leaveTypeService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<ILeaveType>();
      const leaveType = { id: 22862 };
      vitest.spyOn(leaveTypeService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaveType });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(leaveTypeService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareCompany', () => {
      it('should forward to companyService', () => {
        const entity = { id: 29751 };
        const entity2 = { id: 7586 };
        vitest.spyOn(companyService, 'compareCompany');
        comp.compareCompany(entity, entity2);
        expect(companyService.compareCompany).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
