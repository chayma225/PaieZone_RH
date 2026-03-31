import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { KnowledgeDocumentService } from '../service/knowledge-document.service';
import { IKnowledgeDocument } from '../knowledge-document.model';
import { KnowledgeDocumentFormService } from './knowledge-document-form.service';

import { KnowledgeDocumentUpdateComponent } from './knowledge-document-update.component';

describe('KnowledgeDocument Management Update Component', () => {
  let comp: KnowledgeDocumentUpdateComponent;
  let fixture: ComponentFixture<KnowledgeDocumentUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let knowledgeDocumentFormService: KnowledgeDocumentFormService;
  let knowledgeDocumentService: KnowledgeDocumentService;
  let companyService: CompanyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [KnowledgeDocumentUpdateComponent],
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
      .overrideTemplate(KnowledgeDocumentUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(KnowledgeDocumentUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    knowledgeDocumentFormService = TestBed.inject(KnowledgeDocumentFormService);
    knowledgeDocumentService = TestBed.inject(KnowledgeDocumentService);
    companyService = TestBed.inject(CompanyService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Company query and add missing value', () => {
      const knowledgeDocument: IKnowledgeDocument = { id: 28934 };
      const company: ICompany = { id: 29751 };
      knowledgeDocument.company = company;

      const companyCollection: ICompany[] = [{ id: 29751 }];
      jest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      jest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ knowledgeDocument });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(expect.objectContaining),
      );
      expect(comp.companiesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const knowledgeDocument: IKnowledgeDocument = { id: 28934 };
      const company: ICompany = { id: 29751 };
      knowledgeDocument.company = company;

      activatedRoute.data = of({ knowledgeDocument });
      comp.ngOnInit();

      expect(comp.companiesSharedCollection).toContainEqual(company);
      expect(comp.knowledgeDocument).toEqual(knowledgeDocument);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IKnowledgeDocument>>();
      const knowledgeDocument = { id: 2351 };
      jest.spyOn(knowledgeDocumentFormService, 'getKnowledgeDocument').mockReturnValue(knowledgeDocument);
      jest.spyOn(knowledgeDocumentService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ knowledgeDocument });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: knowledgeDocument }));
      saveSubject.complete();

      // THEN
      expect(knowledgeDocumentFormService.getKnowledgeDocument).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(knowledgeDocumentService.update).toHaveBeenCalledWith(expect.objectContaining(knowledgeDocument));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IKnowledgeDocument>>();
      const knowledgeDocument = { id: 2351 };
      jest.spyOn(knowledgeDocumentFormService, 'getKnowledgeDocument').mockReturnValue({ id: null });
      jest.spyOn(knowledgeDocumentService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ knowledgeDocument: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: knowledgeDocument }));
      saveSubject.complete();

      // THEN
      expect(knowledgeDocumentFormService.getKnowledgeDocument).toHaveBeenCalled();
      expect(knowledgeDocumentService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IKnowledgeDocument>>();
      const knowledgeDocument = { id: 2351 };
      jest.spyOn(knowledgeDocumentService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ knowledgeDocument });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(knowledgeDocumentService.update).toHaveBeenCalled();
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
