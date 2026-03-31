import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { PaySlipDetailComponent } from './pay-slip-detail.component';

describe('PaySlip Management Detail Component', () => {
  let comp: PaySlipDetailComponent;
  let fixture: ComponentFixture<PaySlipDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaySlipDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./pay-slip-detail.component').then(m => m.PaySlipDetailComponent),
              resolve: { paySlip: () => of({ id: 6421 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(PaySlipDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaySlipDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load paySlip on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', PaySlipDetailComponent);

      // THEN
      expect(instance.paySlip()).toEqual(expect.objectContaining({ id: 6421 }));
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
