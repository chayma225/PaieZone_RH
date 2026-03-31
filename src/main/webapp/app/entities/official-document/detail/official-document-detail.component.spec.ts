import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { OfficialDocumentDetailComponent } from './official-document-detail.component';

describe('OfficialDocument Management Detail Component', () => {
  let comp: OfficialDocumentDetailComponent;
  let fixture: ComponentFixture<OfficialDocumentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficialDocumentDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./official-document-detail.component').then(m => m.OfficialDocumentDetailComponent),
              resolve: { officialDocument: () => of({ id: 18816 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(OfficialDocumentDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficialDocumentDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load officialDocument on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', OfficialDocumentDetailComponent);

      // THEN
      expect(instance.officialDocument()).toEqual(expect.objectContaining({ id: 18816 }));
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
