import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { ICnssRate } from '../cnss-rate.model';
import { CnssRateService } from '../service/cnss-rate.service';

import { CnssRateFormService } from './cnss-rate-form.service';
import { CnssRateUpdate } from './cnss-rate-update';

describe('CnssRate Management Update Component', () => {
  let comp: CnssRateUpdate;
  let fixture: ComponentFixture<CnssRateUpdate>;
  let activatedRoute: ActivatedRoute;
  let cnssRateFormService: CnssRateFormService;
  let cnssRateService: CnssRateService;
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

    fixture = TestBed.createComponent(CnssRateUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    cnssRateFormService = TestBed.inject(CnssRateFormService);
    cnssRateService = TestBed.inject(CnssRateService);
    companyService = TestBed.inject(CompanyService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Company query and add missing value', () => {
      const cnssRate: ICnssRate = { id: 13409 };
      const company: ICompany = { id: 29751 };
      cnssRate.company = company;

      const companyCollection: ICompany[] = [{ id: 29751 }];
      vitest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      vitest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ cnssRate });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.companiesSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const cnssRate: ICnssRate = { id: 13409 };
      const company: ICompany = { id: 29751 };
      cnssRate.company = company;

      activatedRoute.data = of({ cnssRate });
      comp.ngOnInit();

      expect(comp.companiesSharedCollection()).toContainEqual(company);
      expect(comp.cnssRate).toEqual(cnssRate);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<ICnssRate>();
      const cnssRate = { id: 30932 };
      vitest.spyOn(cnssRateFormService, 'getCnssRate').mockReturnValue(cnssRate);
      vitest.spyOn(cnssRateService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ cnssRate });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(cnssRate);
      saveSubject.complete();

      // THEN
      expect(cnssRateFormService.getCnssRate).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(cnssRateService.update).toHaveBeenCalledWith(expect.objectContaining(cnssRate));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<ICnssRate>();
      const cnssRate = { id: 30932 };
      vitest.spyOn(cnssRateFormService, 'getCnssRate').mockReturnValue({ id: null });
      vitest.spyOn(cnssRateService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ cnssRate: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(cnssRate);
      saveSubject.complete();

      // THEN
      expect(cnssRateFormService.getCnssRate).toHaveBeenCalled();
      expect(cnssRateService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<ICnssRate>();
      const cnssRate = { id: 30932 };
      vitest.spyOn(cnssRateService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ cnssRate });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(cnssRateService.update).toHaveBeenCalled();
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
