import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { RubriqueService } from '../service/rubrique.service';
import { IRubrique } from '../rubrique.model';
import { RubriqueFormService } from './rubrique-form.service';

import { RubriqueUpdateComponent } from './rubrique-update.component';

describe('Rubrique Management Update Component', () => {
  let comp: RubriqueUpdateComponent;
  let fixture: ComponentFixture<RubriqueUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let rubriqueFormService: RubriqueFormService;
  let rubriqueService: RubriqueService;
  let companyService: CompanyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RubriqueUpdateComponent],
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
      .overrideTemplate(RubriqueUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(RubriqueUpdateComponent);
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
      jest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      jest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ rubrique });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(expect.objectContaining),
      );
      expect(comp.companiesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const rubrique: IRubrique = { id: 14496 };
      const company: ICompany = { id: 29751 };
      rubrique.company = company;

      activatedRoute.data = of({ rubrique });
      comp.ngOnInit();

      expect(comp.companiesSharedCollection).toContainEqual(company);
      expect(comp.rubrique).toEqual(rubrique);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRubrique>>();
      const rubrique = { id: 18175 };
      jest.spyOn(rubriqueFormService, 'getRubrique').mockReturnValue(rubrique);
      jest.spyOn(rubriqueService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ rubrique });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: rubrique }));
      saveSubject.complete();

      // THEN
      expect(rubriqueFormService.getRubrique).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(rubriqueService.update).toHaveBeenCalledWith(expect.objectContaining(rubrique));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRubrique>>();
      const rubrique = { id: 18175 };
      jest.spyOn(rubriqueFormService, 'getRubrique').mockReturnValue({ id: null });
      jest.spyOn(rubriqueService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ rubrique: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: rubrique }));
      saveSubject.complete();

      // THEN
      expect(rubriqueFormService.getRubrique).toHaveBeenCalled();
      expect(rubriqueService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRubrique>>();
      const rubrique = { id: 18175 };
      jest.spyOn(rubriqueService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ rubrique });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(rubriqueService.update).toHaveBeenCalled();
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
