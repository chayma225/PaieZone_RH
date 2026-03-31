import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { BonusDetailComponent } from './bonus-detail.component';

describe('Bonus Management Detail Component', () => {
  let comp: BonusDetailComponent;
  let fixture: ComponentFixture<BonusDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonusDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./bonus-detail.component').then(m => m.BonusDetailComponent),
              resolve: { bonus: () => of({ id: 9352 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(BonusDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BonusDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load bonus on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', BonusDetailComponent);

      // THEN
      expect(instance.bonus()).toEqual(expect.objectContaining({ id: 9352 }));
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
