import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { CnssRateDetailComponent } from './cnss-rate-detail.component';

describe('CnssRate Management Detail Component', () => {
  let comp: CnssRateDetailComponent;
  let fixture: ComponentFixture<CnssRateDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnssRateDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./cnss-rate-detail.component').then(m => m.CnssRateDetailComponent),
              resolve: { cnssRate: () => of({ id: 30932 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(CnssRateDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CnssRateDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load cnssRate on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', CnssRateDetailComponent);

      // THEN
      expect(instance.cnssRate()).toEqual(expect.objectContaining({ id: 30932 }));
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
