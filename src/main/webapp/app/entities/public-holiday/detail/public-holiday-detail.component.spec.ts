import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { PublicHolidayDetailComponent } from './public-holiday-detail.component';

describe('PublicHoliday Management Detail Component', () => {
  let comp: PublicHolidayDetailComponent;
  let fixture: ComponentFixture<PublicHolidayDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicHolidayDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./public-holiday-detail.component').then(m => m.PublicHolidayDetailComponent),
              resolve: { publicHoliday: () => of({ id: 12391 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(PublicHolidayDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicHolidayDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load publicHoliday on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', PublicHolidayDetailComponent);

      // THEN
      expect(instance.publicHoliday()).toEqual(expect.objectContaining({ id: 12391 }));
    });
  });

  describe('PreviousState', () => {
    it('should navigate to previous state', () => {
      jest.spyOn(window.history, 'back');
      comp.previousState();
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});
