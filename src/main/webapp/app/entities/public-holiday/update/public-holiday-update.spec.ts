import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IPublicHoliday } from '../public-holiday.model';
import { PublicHolidayService } from '../service/public-holiday.service';

import { PublicHolidayFormService } from './public-holiday-form.service';
import { PublicHolidayUpdate } from './public-holiday-update';

describe('PublicHoliday Management Update Component', () => {
  let comp: PublicHolidayUpdate;
  let fixture: ComponentFixture<PublicHolidayUpdate>;
  let activatedRoute: ActivatedRoute;
  let publicHolidayFormService: PublicHolidayFormService;
  let publicHolidayService: PublicHolidayService;

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

    fixture = TestBed.createComponent(PublicHolidayUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    publicHolidayFormService = TestBed.inject(PublicHolidayFormService);
    publicHolidayService = TestBed.inject(PublicHolidayService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const publicHoliday: IPublicHoliday = { id: 8793 };

      activatedRoute.data = of({ publicHoliday });
      comp.ngOnInit();

      expect(comp.publicHoliday).toEqual(publicHoliday);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IPublicHoliday>();
      const publicHoliday = { id: 12391 };
      vitest.spyOn(publicHolidayFormService, 'getPublicHoliday').mockReturnValue(publicHoliday);
      vitest.spyOn(publicHolidayService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ publicHoliday });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(publicHoliday);
      saveSubject.complete();

      // THEN
      expect(publicHolidayFormService.getPublicHoliday).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(publicHolidayService.update).toHaveBeenCalledWith(expect.objectContaining(publicHoliday));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IPublicHoliday>();
      const publicHoliday = { id: 12391 };
      vitest.spyOn(publicHolidayFormService, 'getPublicHoliday').mockReturnValue({ id: null });
      vitest.spyOn(publicHolidayService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ publicHoliday: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(publicHoliday);
      saveSubject.complete();

      // THEN
      expect(publicHolidayFormService.getPublicHoliday).toHaveBeenCalled();
      expect(publicHolidayService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IPublicHoliday>();
      const publicHoliday = { id: 12391 };
      vitest.spyOn(publicHolidayService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ publicHoliday });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(publicHolidayService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
