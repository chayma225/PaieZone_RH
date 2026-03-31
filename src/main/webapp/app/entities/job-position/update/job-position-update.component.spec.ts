import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { IDepartment } from 'app/entities/department/department.model';
import { DepartmentService } from 'app/entities/department/service/department.service';
import { IJobPosition } from '../job-position.model';
import { JobPositionService } from '../service/job-position.service';
import { JobPositionFormService } from './job-position-form.service';

import { JobPositionUpdateComponent } from './job-position-update.component';

describe('JobPosition Management Update Component', () => {
  let comp: JobPositionUpdateComponent;
  let fixture: ComponentFixture<JobPositionUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let jobPositionFormService: JobPositionFormService;
  let jobPositionService: JobPositionService;
  let companyService: CompanyService;
  let departmentService: DepartmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [JobPositionUpdateComponent],
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
      .overrideTemplate(JobPositionUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(JobPositionUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    jobPositionFormService = TestBed.inject(JobPositionFormService);
    jobPositionService = TestBed.inject(JobPositionService);
    companyService = TestBed.inject(CompanyService);
    departmentService = TestBed.inject(DepartmentService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Company query and add missing value', () => {
      const jobPosition: IJobPosition = { id: 16817 };
      const company: ICompany = { id: 29751 };
      jobPosition.company = company;

      const companyCollection: ICompany[] = [{ id: 29751 }];
      jest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      jest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ jobPosition });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(expect.objectContaining),
      );
      expect(comp.companiesSharedCollection).toEqual(expectedCollection);
    });

    it('should call Department query and add missing value', () => {
      const jobPosition: IJobPosition = { id: 16817 };
      const department: IDepartment = { id: 29518 };
      jobPosition.department = department;

      const departmentCollection: IDepartment[] = [{ id: 29518 }];
      jest.spyOn(departmentService, 'query').mockReturnValue(of(new HttpResponse({ body: departmentCollection })));
      const additionalDepartments = [department];
      const expectedCollection: IDepartment[] = [...additionalDepartments, ...departmentCollection];
      jest.spyOn(departmentService, 'addDepartmentToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ jobPosition });
      comp.ngOnInit();

      expect(departmentService.query).toHaveBeenCalled();
      expect(departmentService.addDepartmentToCollectionIfMissing).toHaveBeenCalledWith(
        departmentCollection,
        ...additionalDepartments.map(expect.objectContaining),
      );
      expect(comp.departmentsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const jobPosition: IJobPosition = { id: 16817 };
      const company: ICompany = { id: 29751 };
      jobPosition.company = company;
      const department: IDepartment = { id: 29518 };
      jobPosition.department = department;

      activatedRoute.data = of({ jobPosition });
      comp.ngOnInit();

      expect(comp.companiesSharedCollection).toContainEqual(company);
      expect(comp.departmentsSharedCollection).toContainEqual(department);
      expect(comp.jobPosition).toEqual(jobPosition);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IJobPosition>>();
      const jobPosition = { id: 27621 };
      jest.spyOn(jobPositionFormService, 'getJobPosition').mockReturnValue(jobPosition);
      jest.spyOn(jobPositionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ jobPosition });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: jobPosition }));
      saveSubject.complete();

      // THEN
      expect(jobPositionFormService.getJobPosition).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(jobPositionService.update).toHaveBeenCalledWith(expect.objectContaining(jobPosition));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IJobPosition>>();
      const jobPosition = { id: 27621 };
      jest.spyOn(jobPositionFormService, 'getJobPosition').mockReturnValue({ id: null });
      jest.spyOn(jobPositionService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ jobPosition: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: jobPosition }));
      saveSubject.complete();

      // THEN
      expect(jobPositionFormService.getJobPosition).toHaveBeenCalled();
      expect(jobPositionService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IJobPosition>>();
      const jobPosition = { id: 27621 };
      jest.spyOn(jobPositionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ jobPosition });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(jobPositionService.update).toHaveBeenCalled();
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

    describe('compareDepartment', () => {
      it('should forward to departmentService', () => {
        const entity = { id: 29518 };
        const entity2 = { id: 15970 };
        jest.spyOn(departmentService, 'compareDepartment');
        comp.compareDepartment(entity, entity2);
        expect(departmentService.compareDepartment).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
