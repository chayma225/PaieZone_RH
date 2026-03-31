import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { TaxBracketService } from '../service/tax-bracket.service';
import { ITaxBracket } from '../tax-bracket.model';
import { TaxBracketFormService } from './tax-bracket-form.service';

import { TaxBracketUpdateComponent } from './tax-bracket-update.component';

describe('TaxBracket Management Update Component', () => {
  let comp: TaxBracketUpdateComponent;
  let fixture: ComponentFixture<TaxBracketUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let taxBracketFormService: TaxBracketFormService;
  let taxBracketService: TaxBracketService;
  let companyService: CompanyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaxBracketUpdateComponent],
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
      .overrideTemplate(TaxBracketUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TaxBracketUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    taxBracketFormService = TestBed.inject(TaxBracketFormService);
    taxBracketService = TestBed.inject(TaxBracketService);
    companyService = TestBed.inject(CompanyService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Company query and add missing value', () => {
      const taxBracket: ITaxBracket = { id: 13109 };
      const company: ICompany = { id: 29751 };
      taxBracket.company = company;

      const companyCollection: ICompany[] = [{ id: 29751 }];
      jest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      jest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ taxBracket });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(expect.objectContaining),
      );
      expect(comp.companiesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const taxBracket: ITaxBracket = { id: 13109 };
      const company: ICompany = { id: 29751 };
      taxBracket.company = company;

      activatedRoute.data = of({ taxBracket });
      comp.ngOnInit();

      expect(comp.companiesSharedCollection).toContainEqual(company);
      expect(comp.taxBracket).toEqual(taxBracket);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITaxBracket>>();
      const taxBracket = { id: 2073 };
      jest.spyOn(taxBracketFormService, 'getTaxBracket').mockReturnValue(taxBracket);
      jest.spyOn(taxBracketService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ taxBracket });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: taxBracket }));
      saveSubject.complete();

      // THEN
      expect(taxBracketFormService.getTaxBracket).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(taxBracketService.update).toHaveBeenCalledWith(expect.objectContaining(taxBracket));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITaxBracket>>();
      const taxBracket = { id: 2073 };
      jest.spyOn(taxBracketFormService, 'getTaxBracket').mockReturnValue({ id: null });
      jest.spyOn(taxBracketService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ taxBracket: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: taxBracket }));
      saveSubject.complete();

      // THEN
      expect(taxBracketFormService.getTaxBracket).toHaveBeenCalled();
      expect(taxBracketService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITaxBracket>>();
      const taxBracket = { id: 2073 };
      jest.spyOn(taxBracketService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ taxBracket });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(taxBracketService.update).toHaveBeenCalled();
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
