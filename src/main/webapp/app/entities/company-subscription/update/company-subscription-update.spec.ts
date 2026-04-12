import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { ICompanySubscription } from '../company-subscription.model';
import { CompanySubscriptionService } from '../service/company-subscription.service';

import { CompanySubscriptionFormService } from './company-subscription-form.service';
import { CompanySubscriptionUpdate } from './company-subscription-update';

describe('CompanySubscription Management Update Component', () => {
  let comp: CompanySubscriptionUpdate;
  let fixture: ComponentFixture<CompanySubscriptionUpdate>;
  let activatedRoute: ActivatedRoute;
  let companySubscriptionFormService: CompanySubscriptionFormService;
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

    fixture = TestBed.createComponent(CompanySubscriptionUpdate);
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
      const saveSubject = new Subject<ICompanySubscription>();
      const companySubscription = { id: 20273 };
      vitest.spyOn(companySubscriptionFormService, 'getCompanySubscription').mockReturnValue(companySubscription);
      vitest.spyOn(companySubscriptionService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ companySubscription });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(companySubscription);
      saveSubject.complete();

      // THEN
      expect(companySubscriptionFormService.getCompanySubscription).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(companySubscriptionService.update).toHaveBeenCalledWith(expect.objectContaining(companySubscription));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<ICompanySubscription>();
      const companySubscription = { id: 20273 };
      vitest.spyOn(companySubscriptionFormService, 'getCompanySubscription').mockReturnValue({ id: null });
      vitest.spyOn(companySubscriptionService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ companySubscription: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(companySubscription);
      saveSubject.complete();

      // THEN
      expect(companySubscriptionFormService.getCompanySubscription).toHaveBeenCalled();
      expect(companySubscriptionService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<ICompanySubscription>();
      const companySubscription = { id: 20273 };
      vitest.spyOn(companySubscriptionService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ companySubscription });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(companySubscriptionService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
