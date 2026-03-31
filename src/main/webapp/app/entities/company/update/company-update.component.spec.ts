import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ICompanySubscription } from 'app/entities/company-subscription/company-subscription.model';
import { CompanySubscriptionService } from 'app/entities/company-subscription/service/company-subscription.service';
import { CompanyService } from '../service/company.service';
import { ICompany } from '../company.model';
import { CompanyFormService } from './company-form.service';

import { CompanyUpdateComponent } from './company-update.component';

describe('Company Management Update Component', () => {
  let comp: CompanyUpdateComponent;
  let fixture: ComponentFixture<CompanyUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let companyFormService: CompanyFormService;
  let companyService: CompanyService;
  let companySubscriptionService: CompanySubscriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CompanyUpdateComponent],
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
      .overrideTemplate(CompanyUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(CompanyUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    companyFormService = TestBed.inject(CompanyFormService);
    companyService = TestBed.inject(CompanyService);
    companySubscriptionService = TestBed.inject(CompanySubscriptionService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call subscription query and add missing value', () => {
      const company: ICompany = { id: 7586 };
      const subscription: ICompanySubscription = { id: 20273 };
      company.subscription = subscription;

      const subscriptionCollection: ICompanySubscription[] = [{ id: 20273 }];
      jest.spyOn(companySubscriptionService, 'query').mockReturnValue(of(new HttpResponse({ body: subscriptionCollection })));
      const expectedCollection: ICompanySubscription[] = [subscription, ...subscriptionCollection];
      jest.spyOn(companySubscriptionService, 'addCompanySubscriptionToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ company });
      comp.ngOnInit();

      expect(companySubscriptionService.query).toHaveBeenCalled();
      expect(companySubscriptionService.addCompanySubscriptionToCollectionIfMissing).toHaveBeenCalledWith(
        subscriptionCollection,
        subscription,
      );
      expect(comp.subscriptionsCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const company: ICompany = { id: 7586 };
      const subscription: ICompanySubscription = { id: 20273 };
      company.subscription = subscription;

      activatedRoute.data = of({ company });
      comp.ngOnInit();

      expect(comp.subscriptionsCollection).toContainEqual(subscription);
      expect(comp.company).toEqual(company);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ICompany>>();
      const company = { id: 29751 };
      jest.spyOn(companyFormService, 'getCompany').mockReturnValue(company);
      jest.spyOn(companyService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ company });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: company }));
      saveSubject.complete();

      // THEN
      expect(companyFormService.getCompany).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(companyService.update).toHaveBeenCalledWith(expect.objectContaining(company));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ICompany>>();
      const company = { id: 29751 };
      jest.spyOn(companyFormService, 'getCompany').mockReturnValue({ id: null });
      jest.spyOn(companyService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ company: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: company }));
      saveSubject.complete();

      // THEN
      expect(companyFormService.getCompany).toHaveBeenCalled();
      expect(companyService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ICompany>>();
      const company = { id: 29751 };
      jest.spyOn(companyService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ company });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(companyService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareCompanySubscription', () => {
      it('should forward to companySubscriptionService', () => {
        const entity = { id: 20273 };
        const entity2 = { id: 3576 };
        jest.spyOn(companySubscriptionService, 'compareCompanySubscription');
        comp.compareCompanySubscription(entity, entity2);
        expect(companySubscriptionService.compareCompanySubscription).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
