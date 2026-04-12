import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IPaySlip } from 'app/entities/pay-slip/pay-slip.model';
import { PaySlipService } from 'app/entities/pay-slip/service/pay-slip.service';
import { IRubrique } from 'app/entities/rubrique/rubrique.model';
import { RubriqueService } from 'app/entities/rubrique/service/rubrique.service';
import { IPaySlipLine } from '../pay-slip-line.model';
import { PaySlipLineService } from '../service/pay-slip-line.service';

import { PaySlipLineFormService } from './pay-slip-line-form.service';
import { PaySlipLineUpdate } from './pay-slip-line-update';

describe('PaySlipLine Management Update Component', () => {
  let comp: PaySlipLineUpdate;
  let fixture: ComponentFixture<PaySlipLineUpdate>;
  let activatedRoute: ActivatedRoute;
  let paySlipLineFormService: PaySlipLineFormService;
  let paySlipLineService: PaySlipLineService;
  let paySlipService: PaySlipService;
  let rubriqueService: RubriqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    });

    fixture = TestBed.createComponent(PaySlipLineUpdate);
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
      vitest.spyOn(paySlipService, 'query').mockReturnValue(of(new HttpResponse({ body: paySlipCollection })));
      const additionalPaySlips = [paySlip];
      const expectedCollection: IPaySlip[] = [...additionalPaySlips, ...paySlipCollection];
      vitest.spyOn(paySlipService, 'addPaySlipToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ paySlipLine });
      comp.ngOnInit();

      expect(paySlipService.query).toHaveBeenCalled();
      expect(paySlipService.addPaySlipToCollectionIfMissing).toHaveBeenCalledWith(
        paySlipCollection,
        ...additionalPaySlips.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.paySlipsSharedCollection()).toEqual(expectedCollection);
    });

    it('should call Rubrique query and add missing value', () => {
      const paySlipLine: IPaySlipLine = { id: 10105 };
      const rubrique: IRubrique = { id: 18175 };
      paySlipLine.rubrique = rubrique;

      const rubriqueCollection: IRubrique[] = [{ id: 18175 }];
      vitest.spyOn(rubriqueService, 'query').mockReturnValue(of(new HttpResponse({ body: rubriqueCollection })));
      const additionalRubriques = [rubrique];
      const expectedCollection: IRubrique[] = [...additionalRubriques, ...rubriqueCollection];
      vitest.spyOn(rubriqueService, 'addRubriqueToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ paySlipLine });
      comp.ngOnInit();

      expect(rubriqueService.query).toHaveBeenCalled();
      expect(rubriqueService.addRubriqueToCollectionIfMissing).toHaveBeenCalledWith(
        rubriqueCollection,
        ...additionalRubriques.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.rubriquesSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const paySlipLine: IPaySlipLine = { id: 10105 };
      const paySlip: IPaySlip = { id: 6421 };
      paySlipLine.paySlip = paySlip;
      const rubrique: IRubrique = { id: 18175 };
      paySlipLine.rubrique = rubrique;

      activatedRoute.data = of({ paySlipLine });
      comp.ngOnInit();

      expect(comp.paySlipsSharedCollection()).toContainEqual(paySlip);
      expect(comp.rubriquesSharedCollection()).toContainEqual(rubrique);
      expect(comp.paySlipLine).toEqual(paySlipLine);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IPaySlipLine>();
      const paySlipLine = { id: 17388 };
      vitest.spyOn(paySlipLineFormService, 'getPaySlipLine').mockReturnValue(paySlipLine);
      vitest.spyOn(paySlipLineService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ paySlipLine });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(paySlipLine);
      saveSubject.complete();

      // THEN
      expect(paySlipLineFormService.getPaySlipLine).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(paySlipLineService.update).toHaveBeenCalledWith(expect.objectContaining(paySlipLine));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IPaySlipLine>();
      const paySlipLine = { id: 17388 };
      vitest.spyOn(paySlipLineFormService, 'getPaySlipLine').mockReturnValue({ id: null });
      vitest.spyOn(paySlipLineService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ paySlipLine: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(paySlipLine);
      saveSubject.complete();

      // THEN
      expect(paySlipLineFormService.getPaySlipLine).toHaveBeenCalled();
      expect(paySlipLineService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IPaySlipLine>();
      const paySlipLine = { id: 17388 };
      vitest.spyOn(paySlipLineService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ paySlipLine });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(paySlipLineService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('comparePaySlip', () => {
      it('should forward to paySlipService', () => {
        const entity = { id: 6421 };
        const entity2 = { id: 15030 };
        vitest.spyOn(paySlipService, 'comparePaySlip');
        comp.comparePaySlip(entity, entity2);
        expect(paySlipService.comparePaySlip).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareRubrique', () => {
      it('should forward to rubriqueService', () => {
        const entity = { id: 18175 };
        const entity2 = { id: 14496 };
        vitest.spyOn(rubriqueService, 'compareRubrique');
        comp.compareRubrique(entity, entity2);
        expect(rubriqueService.compareRubrique).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
