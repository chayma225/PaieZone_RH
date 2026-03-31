import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { PublicHolidayService } from '../service/public-holiday.service';
import { IPublicHoliday } from '../public-holiday.model';
import { PublicHolidayFormService } from './public-holiday-form.service';

import { PublicHolidayUpdateComponent } from './public-holiday-update.component';

describe('PublicHoliday Management Update Component', () => {
  let comp: PublicHolidayUpdateComponent;
  let fixture: ComponentFixture<PublicHolidayUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let publicHolidayFormService: PublicHolidayFormService;
  let publicHolidayService: PublicHolidayService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PublicHolidayUpdateComponent],
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
      .overrideTemplate(PublicHolidayUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PublicHolidayUpdateComponent);
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
      const saveSubject = new Subject<HttpResponse<IPublicHoliday>>();
      const publicHoliday = { id: 12391 };
      jest.spyOn(publicHolidayFormService, 'getPublicHoliday').mockReturnValue(publicHoliday);
      jest.spyOn(publicHolidayService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ publicHoliday });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: publicHoliday }));
      saveSubject.complete();

      // THEN
      expect(publicHolidayFormService.getPublicHoliday).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(publicHolidayService.update).toHaveBeenCalledWith(expect.objectContaining(publicHoliday));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPublicHoliday>>();
      const publicHoliday = { id: 12391 };
      jest.spyOn(publicHolidayFormService, 'getPublicHoliday').mockReturnValue({ id: null });
      jest.spyOn(publicHolidayService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ publicHoliday: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: publicHoliday }));
      saveSubject.complete();

      // THEN
      expect(publicHolidayFormService.getPublicHoliday).toHaveBeenCalled();
      expect(publicHolidayService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPublicHoliday>>();
      const publicHoliday = { id: 12391 };
      jest.spyOn(publicHolidayService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ publicHoliday });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(publicHolidayService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
