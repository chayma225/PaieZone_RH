import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { LeaveBalanceDetailComponent } from './leave-balance-detail.component';

describe('LeaveBalance Management Detail Component', () => {
  let comp: LeaveBalanceDetailComponent;
  let fixture: ComponentFixture<LeaveBalanceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveBalanceDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./leave-balance-detail.component').then(m => m.LeaveBalanceDetailComponent),
              resolve: { leaveBalance: () => of({ id: 9581 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(LeaveBalanceDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveBalanceDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load leaveBalance on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', LeaveBalanceDetailComponent);

      // THEN
      expect(instance.leaveBalance()).toEqual(expect.objectContaining({ id: 9581 }));
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
