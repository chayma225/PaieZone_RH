import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { ICompany } from 'app/entities/company/company.model';
import { CompanyService } from 'app/entities/company/service/company.service';
import { IKnowledgeDocument } from '../knowledge-document.model';
import { KnowledgeDocumentService } from '../service/knowledge-document.service';

import { KnowledgeDocumentFormService } from './knowledge-document-form.service';
import { KnowledgeDocumentUpdate } from './knowledge-document-update';

describe('KnowledgeDocument Management Update Component', () => {
  let comp: KnowledgeDocumentUpdate;
  let fixture: ComponentFixture<KnowledgeDocumentUpdate>;
  let activatedRoute: ActivatedRoute;
  let knowledgeDocumentFormService: KnowledgeDocumentFormService;
  let knowledgeDocumentService: KnowledgeDocumentService;
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

    fixture = TestBed.createComponent(KnowledgeDocumentUpdate);
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
      vitest.spyOn(companyService, 'query').mockReturnValue(of(new HttpResponse({ body: companyCollection })));
      const additionalCompanies = [company];
      const expectedCollection: ICompany[] = [...additionalCompanies, ...companyCollection];
      vitest.spyOn(companyService, 'addCompanyToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ knowledgeDocument });
      comp.ngOnInit();

      expect(companyService.query).toHaveBeenCalled();
      expect(companyService.addCompanyToCollectionIfMissing).toHaveBeenCalledWith(
        companyCollection,
        ...additionalCompanies.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.companiesSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const knowledgeDocument: IKnowledgeDocument = { id: 28934 };
      const company: ICompany = { id: 29751 };
      knowledgeDocument.company = company;

      activatedRoute.data = of({ knowledgeDocument });
      comp.ngOnInit();

      expect(comp.companiesSharedCollection()).toContainEqual(company);
      expect(comp.knowledgeDocument).toEqual(knowledgeDocument);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IKnowledgeDocument>();
      const knowledgeDocument = { id: 2351 };
      vitest.spyOn(knowledgeDocumentFormService, 'getKnowledgeDocument').mockReturnValue(knowledgeDocument);
      vitest.spyOn(knowledgeDocumentService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ knowledgeDocument });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(knowledgeDocument);
      saveSubject.complete();

      // THEN
      expect(knowledgeDocumentFormService.getKnowledgeDocument).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(knowledgeDocumentService.update).toHaveBeenCalledWith(expect.objectContaining(knowledgeDocument));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IKnowledgeDocument>();
      const knowledgeDocument = { id: 2351 };
      vitest.spyOn(knowledgeDocumentFormService, 'getKnowledgeDocument').mockReturnValue({ id: null });
      vitest.spyOn(knowledgeDocumentService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ knowledgeDocument: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(knowledgeDocument);
      saveSubject.complete();

      // THEN
      expect(knowledgeDocumentFormService.getKnowledgeDocument).toHaveBeenCalled();
      expect(knowledgeDocumentService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IKnowledgeDocument>();
      const knowledgeDocument = { id: 2351 };
      vitest.spyOn(knowledgeDocumentService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ knowledgeDocument });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(knowledgeDocumentService.update).toHaveBeenCalled();
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
