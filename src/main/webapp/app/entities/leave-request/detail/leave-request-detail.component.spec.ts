import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { LeaveRequestDetailComponent } from './leave-request-detail.component';

describe('LeaveRequest Management Detail Component', () => {
  let comp: LeaveRequestDetailComponent;
  let fixture: ComponentFixture<LeaveRequestDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveRequestDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./leave-request-detail.component').then(m => m.LeaveRequestDetailComponent),
              resolve: { leaveRequest: () => of({ id: 25258 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(LeaveRequestDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveRequestDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load leaveRequest on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', LeaveRequestDetailComponent);

      // THEN
      expect(instance.leaveRequest()).toEqual(expect.objectContaining({ id: 25258 }));
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
