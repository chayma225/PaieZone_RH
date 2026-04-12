import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { IDepartment } from 'app/entities/department/department.model';
import { DepartmentService } from 'app/entities/department/service/department.service';
import { IJobPosition } from '../job-position.model';
import { JobPositionService } from '../service/job-position.service';

import { JobPositionFormService } from './job-position-form.service';
import { JobPositionUpdate } from './job-position-update';

describe('JobPosition Management Update Component', () => {
  let comp: JobPositionUpdate;
  let fixture: ComponentFixture<JobPositionUpdate>;
  let activatedRoute: ActivatedRoute;
  let jobPositionFormService: JobPositionFormService;
  let jobPositionService: JobPositionService;
  let companyService: CompanyService;
  let departmentService: DepartmentService;

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

    fixture = TestBed.createComponent(JobPositionUpdate);
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
      vitest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      vitest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ jobPosition });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.companiesSharedCollection()).toEqual(expectedCollection);
    });

    it('should call Department query and add missing value', () => {
      const jobPosition: IJobPosition = { id: 16817 };
      const department: IDepartment = { id: 29518 };
      jobPosition.department = department;

      const departmentCollection: IDepartment[] = [{ id: 29518 }];
      vitest.spyOn(departmentService, 'query').mockReturnValue(of(new HttpResponse({ body: departmentCollection })));
      const additionalDepartments = [department];
      const expectedCollection: IDepartment[] = [...additionalDepartments, ...departmentCollection];
      vitest.spyOn(departmentService, 'addDepartmentToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ jobPosition });
      comp.ngOnInit();

      expect(departmentService.query).toHaveBeenCalled();
      expect(departmentService.addDepartmentToCollectionIfMissing).toHaveBeenCalledWith(
        departmentCollection,
        ...additionalDepartments.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.departmentsSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const jobPosition: IJobPosition = { id: 16817 };
      const company: ICompany = { id: 29751 };
      jobPosition.company = company;
      const department: IDepartment = { id: 29518 };
      jobPosition.department = department;

      activatedRoute.data = of({ jobPosition });
      comp.ngOnInit();

      expect(comp.companiesSharedCollection()).toContainEqual(company);
      expect(comp.departmentsSharedCollection()).toContainEqual(department);
      expect(comp.jobPosition).toEqual(jobPosition);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IJobPosition>();
      const jobPosition = { id: 27621 };
      vitest.spyOn(jobPositionFormService, 'getJobPosition').mockReturnValue(jobPosition);
      vitest.spyOn(jobPositionService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ jobPosition });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(jobPosition);
      saveSubject.complete();

      // THEN
      expect(jobPositionFormService.getJobPosition).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(jobPositionService.update).toHaveBeenCalledWith(expect.objectContaining(jobPosition));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IJobPosition>();
      const jobPosition = { id: 27621 };
      vitest.spyOn(jobPositionFormService, 'getJobPosition').mockReturnValue({ id: null });
      vitest.spyOn(jobPositionService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ jobPosition: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(jobPosition);
      saveSubject.complete();

      // THEN
      expect(jobPositionFormService.getJobPosition).toHaveBeenCalled();
      expect(jobPositionService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IJobPosition>();
      const jobPosition = { id: 27621 };
      vitest.spyOn(jobPositionService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ jobPosition });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(jobPositionService.update).toHaveBeenCalled();
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

    describe('compareDepartment', () => {
      it('should forward to departmentService', () => {
        const entity = { id: 29518 };
        const entity2 = { id: 15970 };
        vitest.spyOn(departmentService, 'compareDepartment');
        comp.compareDepartment(entity, entity2);
        expect(departmentService.compareDepartment).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
