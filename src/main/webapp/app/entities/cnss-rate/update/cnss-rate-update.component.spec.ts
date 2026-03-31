import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { CnssRateService } from '../service/cnss-rate.service';
import { ICnssRate } from '../cnss-rate.model';
import { CnssRateFormService } from './cnss-rate-form.service';

import { CnssRateUpdateComponent } from './cnss-rate-update.component';

describe('CnssRate Management Update Component', () => {
  let comp: CnssRateUpdateComponent;
  let fixture: ComponentFixture<CnssRateUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let cnssRateFormService: CnssRateFormService;
  let cnssRateService: CnssRateService;
  let companyService: CompanyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CnssRateUpdateComponent],
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
      .overrideTemplate(CnssRateUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(CnssRateUpdateComponent);
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
      jest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      jest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ cnssRate });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(expect.objectContaining),
      );
      expect(comp.companiesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const cnssRate: ICnssRate = { id: 13409 };
      const company: ICompany = { id: 29751 };
      cnssRate.company = company;

      activatedRoute.data = of({ cnssRate });
      comp.ngOnInit();

      expect(comp.companiesSharedCollection).toContainEqual(company);
      expect(comp.cnssRate).toEqual(cnssRate);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ICnssRate>>();
      const cnssRate = { id: 30932 };
      jest.spyOn(cnssRateFormService, 'getCnssRate').mockReturnValue(cnssRate);
      jest.spyOn(cnssRateService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ cnssRate });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: cnssRate }));
      saveSubject.complete();

      // THEN
      expect(cnssRateFormService.getCnssRate).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(cnssRateService.update).toHaveBeenCalledWith(expect.objectContaining(cnssRate));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ICnssRate>>();
      const cnssRate = { id: 30932 };
      jest.spyOn(cnssRateFormService, 'getCnssRate').mockReturnValue({ id: null });
      jest.spyOn(cnssRateService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ cnssRate: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: cnssRate }));
      saveSubject.complete();

      // THEN
      expect(cnssRateFormService.getCnssRate).toHaveBeenCalled();
      expect(cnssRateService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ICnssRate>>();
      const cnssRate = { id: 30932 };
      jest.spyOn(cnssRateService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ cnssRate });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(cnssRateService.update).toHaveBeenCalled();
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
