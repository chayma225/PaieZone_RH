import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { CompanySubscriptionService } from '../service/company-subscription.service';
import { ICompanySubscription } from '../company-subscription.model';
import { CompanySubscriptionFormService } from './company-subscription-form.service';

import { CompanySubscriptionUpdateComponent } from './company-subscription-update.component';

describe('CompanySubscription Management Update Component', () => {
  let comp: CompanySubscriptionUpdateComponent;
  let fixture: ComponentFixture<CompanySubscriptionUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let companySubscriptionFormService: CompanySubscriptionFormService;
  let companySubscriptionService: CompanySubscriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CompanySubscriptionUpdateComponent],
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
      .overrideTemplate(CompanySubscriptionUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(CompanySubscriptionUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    companySubscriptionFormService = TestBed.inject(CompanySubscriptionFormService);
    companySubscriptionService = TestBed.inject(CompanySubscriptionService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const companySubscription: ICompanySubscription = { id: 3576 };

      activatedRoute.data = of({ companySubscription });
      comp.ngOnInit();

      expect(comp.companySubscription).toEqual(companySubscription);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ICompanySubscription>>();
      const companySubscription = { id: 20273 };
      jest.spyOn(companySubscriptionFormService, 'getCompanySubscription').mockReturnValue(companySubscription);
      jest.spyOn(companySubscriptionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ companySubscription });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: companySubscription }));
      saveSubject.complete();

      // THEN
      expect(companySubscriptionFormService.getCompanySubscription).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(companySubscriptionService.update).toHaveBeenCalledWith(expect.objectContaining(companySubscription));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ICompanySubscription>>();
      const companySubscription = { id: 20273 };
      jest.spyOn(companySubscriptionFormService, 'getCompanySubscription').mockReturnValue({ id: null });
      jest.spyOn(companySubscriptionService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ companySubscription: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: companySubscription }));
      saveSubject.complete();

      // THEN
      expect(companySubscriptionFormService.getCompanySubscription).toHaveBeenCalled();
      expect(companySubscriptionService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ICompanySubscription>>();
      const companySubscription = { id: 20273 };
      jest.spyOn(companySubscriptionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ companySubscription });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(companySubscriptionService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
