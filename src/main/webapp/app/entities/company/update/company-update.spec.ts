import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { ICompanySubscription } from 'app/entities/company-subscription/company-subscription.model';
import { CompanySubscriptionService } from 'app/entities/company-subscription/service/company-subscription.service';
import { ICompany } from '../company.model';
import { CompanyService } from '../service/company.service';

import { CompanyFormService } from './company-form.service';
import { CompanyUpdate } from './company-update';

describe('Company Management Update Component', () => {
  let comp: CompanyUpdate;
  let fixture: ComponentFixture<CompanyUpdate>;
  let activatedRoute: ActivatedRoute;
  let companyFormService: CompanyFormService;
  let companyService: CompanyService;
  let companySubscriptionService: CompanySubscriptionService;

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

    fixture = TestBed.createComponent(CompanyUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    companyFormService = TestBed.inject(CompanyFormService);
    companyService = TestBed.inject(CompanyService);
    companySubscriptionService = TestBed.inject(CompanySubscriptionService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call companySubscription query and add missing value', () => {
      const company: ICompany = { id: 7586 };
      const companySubscription: ICompanySubscription = { id: 20273 };
      company.companySubscription = companySubscription;

      const companySubscriptionCollection: ICompanySubscription[] = [{ id: 20273 }];
      vitest.spyOn(companySubscriptionService, 'query').mockReturnValue(of(new HttpResponse({ body: companySubscriptionCollection })));
      const expectedCollection: ICompanySubscription[] = [companySubscription, ...companySubscriptionCollection];
      vitest.spyOn(companySubscriptionService, 'addCompanySubscriptionToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ company });
      comp.ngOnInit();

      expect(companySubscriptionService.query).toHaveBeenCalled();
      expect(companySubscriptionService.addCompanySubscriptionToCollectionIfMissing).toHaveBeenCalledWith(
        companySubscriptionCollection,
        companySubscription,
      );
      expect(comp.companySubscriptionsCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const company: ICompany = { id: 7586 };
      const companySubscription: ICompanySubscription = { id: 20273 };
      company.companySubscription = companySubscription;

      activatedRoute.data = of({ company });
      comp.ngOnInit();

      expect(comp.companySubscriptionsCollection()).toContainEqual(companySubscription);
      expect(comp.company).toEqual(company);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<ICompany>();
      const company = { id: 29751 };
      vitest.spyOn(companyFormService, 'getCompany').mockReturnValue(company);
      vitest.spyOn(companyService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ company });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(company);
      saveSubject.complete();

      // THEN
      expect(companyFormService.getCompany).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(companyService.update).toHaveBeenCalledWith(expect.objectContaining(company));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<ICompany>();
      const company = { id: 29751 };
      vitest.spyOn(companyFormService, 'getCompany').mockReturnValue({ id: null });
      vitest.spyOn(companyService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ company: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(company);
      saveSubject.complete();

      // THEN
      expect(companyFormService.getCompany).toHaveBeenCalled();
      expect(companyService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<ICompany>();
      const company = { id: 29751 };
      vitest.spyOn(companyService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ company });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(companyService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareCompanySubscription', () => {
      it('should forward to companySubscriptionService', () => {
        const entity = { id: 20273 };
        const entity2 = { id: 3576 };
        vitest.spyOn(companySubscriptionService, 'compareCompanySubscription');
        comp.compareCompanySubscription(entity, entity2);
        expect(companySubscriptionService.compareCompanySubscription).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
