import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { IRubrique } from '../rubrique.model';
import { RubriqueService } from '../service/rubrique.service';

import { RubriqueFormService } from './rubrique-form.service';
import { RubriqueUpdate } from './rubrique-update';

describe('Rubrique Management Update Component', () => {
  let comp: RubriqueUpdate;
  let fixture: ComponentFixture<RubriqueUpdate>;
  let activatedRoute: ActivatedRoute;
  let rubriqueFormService: RubriqueFormService;
  let rubriqueService: RubriqueService;
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

    fixture = TestBed.createComponent(RubriqueUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    rubriqueFormService = TestBed.inject(RubriqueFormService);
    rubriqueService = TestBed.inject(RubriqueService);
    companyService = TestBed.inject(CompanyService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Company query and add missing value', () => {
      const rubrique: IRubrique = { id: 14496 };
      const company: ICompany = { id: 29751 };
      rubrique.company = company;

      const companyCollection: ICompany[] = [{ id: 29751 }];
      vitest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      vitest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ rubrique });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.companiesSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const rubrique: IRubrique = { id: 14496 };
      const company: ICompany = { id: 29751 };
      rubrique.company = company;

      activatedRoute.data = of({ rubrique });
      comp.ngOnInit();

      expect(comp.companiesSharedCollection()).toContainEqual(company);
      expect(comp.rubrique).toEqual(rubrique);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IRubrique>();
      const rubrique = { id: 18175 };
      vitest.spyOn(rubriqueFormService, 'getRubrique').mockReturnValue(rubrique);
      vitest.spyOn(rubriqueService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ rubrique });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(rubrique);
      saveSubject.complete();

      // THEN
      expect(rubriqueFormService.getRubrique).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(rubriqueService.update).toHaveBeenCalledWith(expect.objectContaining(rubrique));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IRubrique>();
      const rubrique = { id: 18175 };
      vitest.spyOn(rubriqueFormService, 'getRubrique').mockReturnValue({ id: null });
      vitest.spyOn(rubriqueService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ rubrique: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(rubrique);
      saveSubject.complete();

      // THEN
      expect(rubriqueFormService.getRubrique).toHaveBeenCalled();
      expect(rubriqueService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IRubrique>();
      const rubrique = { id: 18175 };
      vitest.spyOn(rubriqueService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ rubrique });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(rubriqueService.update).toHaveBeenCalled();
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
