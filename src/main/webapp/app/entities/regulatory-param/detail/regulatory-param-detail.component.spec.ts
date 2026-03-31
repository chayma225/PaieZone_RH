import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { RegulatoryParamDetailComponent } from './regulatory-param-detail.component';

describe('RegulatoryParam Management Detail Component', () => {
  let comp: RegulatoryParamDetailComponent;
  let fixture: ComponentFixture<RegulatoryParamDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegulatoryParamDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./regulatory-param-detail.component').then(m => m.RegulatoryParamDetailComponent),
              resolve: { regulatoryParam: () => of({ id: 13111 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(RegulatoryParamDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegulatoryParamDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load regulatoryParam on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', RegulatoryParamDetailComponent);

      // THEN
      expect(instance.regulatoryParam()).toEqual(expect.objectContaining({ id: 13111 }));
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
