import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { LeaveTypeService } from '../service/leave-type.service';
import { ILeaveType } from '../leave-type.model';
import { LeaveTypeFormService } from './leave-type-form.service';

import { LeaveTypeUpdateComponent } from './leave-type-update.component';

describe('LeaveType Management Update Component', () => {
  let comp: LeaveTypeUpdateComponent;
  let fixture: ComponentFixture<LeaveTypeUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let leaveTypeFormService: LeaveTypeFormService;
  let leaveTypeService: LeaveTypeService;
  let companyService: CompanyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LeaveTypeUpdateComponent],
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
      .overrideTemplate(LeaveTypeUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(LeaveTypeUpdateComponent);
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
      jest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      jest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ leaveType });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(expect.objectContaining),
      );
      expect(comp.companiesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const leaveType: ILeaveType = { id: 27866 };
      const company: ICompany = { id: 29751 };
      leaveType.company = company;

      activatedRoute.data = of({ leaveType });
      comp.ngOnInit();

      expect(comp.companiesSharedCollection).toContainEqual(company);
      expect(comp.leaveType).toEqual(leaveType);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILeaveType>>();
      const leaveType = { id: 22862 };
      jest.spyOn(leaveTypeFormService, 'getLeaveType').mockReturnValue(leaveType);
      jest.spyOn(leaveTypeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaveType });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: leaveType }));
      saveSubject.complete();

      // THEN
      expect(leaveTypeFormService.getLeaveType).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(leaveTypeService.update).toHaveBeenCalledWith(expect.objectContaining(leaveType));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILeaveType>>();
      const leaveType = { id: 22862 };
      jest.spyOn(leaveTypeFormService, 'getLeaveType').mockReturnValue({ id: null });
      jest.spyOn(leaveTypeService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaveType: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: leaveType }));
      saveSubject.complete();

      // THEN
      expect(leaveTypeFormService.getLeaveType).toHaveBeenCalled();
      expect(leaveTypeService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILeaveType>>();
      const leaveType = { id: 22862 };
      jest.spyOn(leaveTypeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ leaveType });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(leaveTypeService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareCompany', () => {
      it('should forward to companyService', () => {
        const entity = { id: 29751 };
        const entity2 = { id: 7586 };
        jest.spyOn(companyService, 'compareCompany');
        comp.compareCompany(entity, entity2);
        expect(companyService.compareCompany).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
