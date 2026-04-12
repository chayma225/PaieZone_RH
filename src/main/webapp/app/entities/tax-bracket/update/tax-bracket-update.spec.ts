import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { TaxBracketService } from '../service/tax-bracket.service';
import { ITaxBracket } from '../tax-bracket.model';

import { TaxBracketFormService } from './tax-bracket-form.service';
import { TaxBracketUpdate } from './tax-bracket-update';

describe('TaxBracket Management Update Component', () => {
  let comp: TaxBracketUpdate;
  let fixture: ComponentFixture<TaxBracketUpdate>;
  let activatedRoute: ActivatedRoute;
  let taxBracketFormService: TaxBracketFormService;
  let taxBracketService: TaxBracketService;
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

    fixture = TestBed.createComponent(TaxBracketUpdate);
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
      vitest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      vitest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ taxBracket });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.companiesSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const taxBracket: ITaxBracket = { id: 13109 };
      const company: ICompany = { id: 29751 };
      taxBracket.company = company;

      activatedRoute.data = of({ taxBracket });
      comp.ngOnInit();

      expect(comp.companiesSharedCollection()).toContainEqual(company);
      expect(comp.taxBracket).toEqual(taxBracket);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<ITaxBracket>();
      const taxBracket = { id: 2073 };
      vitest.spyOn(taxBracketFormService, 'getTaxBracket').mockReturnValue(taxBracket);
      vitest.spyOn(taxBracketService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ taxBracket });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(taxBracket);
      saveSubject.complete();

      // THEN
      expect(taxBracketFormService.getTaxBracket).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(taxBracketService.update).toHaveBeenCalledWith(expect.objectContaining(taxBracket));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<ITaxBracket>();
      const taxBracket = { id: 2073 };
      vitest.spyOn(taxBracketFormService, 'getTaxBracket').mockReturnValue({ id: null });
      vitest.spyOn(taxBracketService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ taxBracket: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(taxBracket);
      saveSubject.complete();

      // THEN
      expect(taxBracketFormService.getTaxBracket).toHaveBeenCalled();
      expect(taxBracketService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<ITaxBracket>();
      const taxBracket = { id: 2073 };
      vitest.spyOn(taxBracketService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ taxBracket });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(taxBracketService.update).toHaveBeenCalled();
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
