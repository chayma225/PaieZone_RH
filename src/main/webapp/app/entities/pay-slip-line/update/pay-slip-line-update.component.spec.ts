import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IPaySlip } from 'app/entities/pay-slip/pay-slip.model';
import { PaySlipService } from 'app/entities/pay-slip/service/pay-slip.service';
import { IRubrique } from 'app/entities/rubrique/rubrique.model';
import { RubriqueService } from 'app/entities/rubrique/service/rubrique.service';
import { IPaySlipLine } from '../pay-slip-line.model';
import { PaySlipLineService } from '../service/pay-slip-line.service';
import { PaySlipLineFormService } from './pay-slip-line-form.service';

import { PaySlipLineUpdateComponent } from './pay-slip-line-update.component';

describe('PaySlipLine Management Update Component', () => {
  let comp: PaySlipLineUpdateComponent;
  let fixture: ComponentFixture<PaySlipLineUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let paySlipLineFormService: PaySlipLineFormService;
  let paySlipLineService: PaySlipLineService;
  let paySlipService: PaySlipService;
  let rubriqueService: RubriqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PaySlipLineUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(PaySlipLineUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PaySlipLineUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    paySlipLineFormService = TestBed.inject(PaySlipLineFormService);
    paySlipLineService = TestBed.inject(PaySlipLineService);
    paySlipService = TestBed.inject(PaySlipService);
    rubriqueService = TestBed.inject(RubriqueService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call PaySlip query and add missing value', () => {
      const paySlipLine: IPaySlipLine = { id: 10105 };
      const paySlip: IPaySlip = { id: 6421 };
      paySlipLine.paySlip = paySlip;

      const paySlipCollection: IPaySlip[] = [{ id: 6421 }];
      jest.spyOn(paySlipService, 'query').mockReturnValue(of(new HttpResponse({ body: paySlipCollection })));
      const additionalPaySlips = [paySlip];
      const expectedCollection: IPaySlip[] = [...additionalPaySlips, ...paySlipCollection];
      jest.spyOn(paySlipService, 'addPaySlipToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ paySlipLine });
      comp.ngOnInit();

      expect(paySlipService.query).toHaveBeenCalled();
      expect(paySlipService.addPaySlipToCollectionIfMissing).toHaveBeenCalledWith(
        paySlipCollection,
        ...additionalPaySlips.map(expect.objectContaining),
      );
      expect(comp.paySlipsSharedCollection).toEqual(expectedCollection);
    });

    it('should call Rubrique query and add missing value', () => {
      const paySlipLine: IPaySlipLine = { id: 10105 };
      const rubrique: IRubrique = { id: 18175 };
      paySlipLine.rubrique = rubrique;

      const rubriqueCollection: IRubrique[] = [{ id: 18175 }];
      jest.spyOn(rubriqueService, 'query').mockReturnValue(of(new HttpResponse({ body: rubriqueCollection })));
      const additionalRubriques = [rubrique];
      const expectedCollection: IRubrique[] = [...additionalRubriques, ...rubriqueCollection];
      jest.spyOn(rubriqueService, 'addRubriqueToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ paySlipLine });
      comp.ngOnInit();

      expect(rubriqueService.query).toHaveBeenCalled();
      expect(rubriqueService.addRubriqueToCollectionIfMissing).toHaveBeenCalledWith(
        rubriqueCollection,
        ...additionalRubriques.map(expect.objectContaining),
      );
      expect(comp.rubriquesSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const paySlipLine: IPaySlipLine = { id: 10105 };
      const paySlip: IPaySlip = { id: 6421 };
      paySlipLine.paySlip = paySlip;
      const rubrique: IRubrique = { id: 18175 };
      paySlipLine.rubrique = rubrique;

      activatedRoute.data = of({ paySlipLine });
      comp.ngOnInit();

      expect(comp.paySlipsSharedCollection).toContainEqual(paySlip);
      expect(comp.rubriquesSharedCollection).toContainEqual(rubrique);
      expect(comp.paySlipLine).toEqual(paySlipLine);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPaySlipLine>>();
      const paySlipLine = { id: 17388 };
      jest.spyOn(paySlipLineFormService, 'getPaySlipLine').mockReturnValue(paySlipLine);
      jest.spyOn(paySlipLineService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ paySlipLine });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: paySlipLine }));
      saveSubject.complete();

      // THEN
      expect(paySlipLineFormService.getPaySlipLine).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(paySlipLineService.update).toHaveBeenCalledWith(expect.objectContaining(paySlipLine));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPaySlipLine>>();
      const paySlipLine = { id: 17388 };
      jest.spyOn(paySlipLineFormService, 'getPaySlipLine').mockReturnValue({ id: null });
      jest.spyOn(paySlipLineService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ paySlipLine: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: paySlipLine }));
      saveSubject.complete();

      // THEN
      expect(paySlipLineFormService.getPaySlipLine).toHaveBeenCalled();
      expect(paySlipLineService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPaySlipLine>>();
      const paySlipLine = { id: 17388 };
      jest.spyOn(paySlipLineService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ paySlipLine });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(paySlipLineService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('comparePaySlip', () => {
      it('should forward to paySlipService', () => {
        const entity = { id: 6421 };
        const entity2 = { id: 15030 };
        jest.spyOn(paySlipService, 'comparePaySlip');
        comp.comparePaySlip(entity, entity2);
        expect(paySlipService.comparePaySlip).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareRubrique', () => {
      it('should forward to rubriqueService', () => {
        const entity = { id: 18175 };
        const entity2 = { id: 14496 };
        jest.spyOn(rubriqueService, 'compareRubrique');
        comp.compareRubrique(entity, entity2);
        expect(rubriqueService.compareRubrique).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
