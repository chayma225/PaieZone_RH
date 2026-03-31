import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { RubriqueDetailComponent } from './rubrique-detail.component';

describe('Rubrique Management Detail Component', () => {
  let comp: RubriqueDetailComponent;
  let fixture: ComponentFixture<RubriqueDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RubriqueDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./rubrique-detail.component').then(m => m.RubriqueDetailComponent),
              resolve: { rubrique: () => of({ id: 18175 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(RubriqueDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RubriqueDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load rubrique on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', RubriqueDetailComponent);

      // THEN
      expect(instance.rubrique()).toEqual(expect.objectContaining({ id: 18175 }));
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
