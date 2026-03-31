import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { PaySlipLineDetailComponent } from './pay-slip-line-detail.component';

describe('PaySlipLine Management Detail Component', () => {
  let comp: PaySlipLineDetailComponent;
  let fixture: ComponentFixture<PaySlipLineDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaySlipLineDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./pay-slip-line-detail.component').then(m => m.PaySlipLineDetailComponent),
              resolve: { paySlipLine: () => of({ id: 17388 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(PaySlipLineDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaySlipLineDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load paySlipLine on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', PaySlipLineDetailComponent);

      // THEN
      expect(instance.paySlipLine()).toEqual(expect.objectContaining({ id: 17388 }));
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
