import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { JobPositionDetailComponent } from './job-position-detail.component';

describe('JobPosition Management Detail Component', () => {
  let comp: JobPositionDetailComponent;
  let fixture: ComponentFixture<JobPositionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobPositionDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./job-position-detail.component').then(m => m.JobPositionDetailComponent),
              resolve: { jobPosition: () => of({ id: 27621 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(JobPositionDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobPositionDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load jobPosition on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', JobPositionDetailComponent);

      // THEN
      expect(instance.jobPosition()).toEqual(expect.objectContaining({ id: 27621 }));
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
