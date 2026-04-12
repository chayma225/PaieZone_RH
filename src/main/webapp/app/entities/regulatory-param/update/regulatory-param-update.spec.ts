import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IRegulatoryParam } from '../regulatory-param.model';
import { RegulatoryParamService } from '../service/regulatory-param.service';

import { RegulatoryParamFormService } from './regulatory-param-form.service';
import { RegulatoryParamUpdate } from './regulatory-param-update';

describe('RegulatoryParam Management Update Component', () => {
  let comp: RegulatoryParamUpdate;
  let fixture: ComponentFixture<RegulatoryParamUpdate>;
  let activatedRoute: ActivatedRoute;
  let regulatoryParamFormService: RegulatoryParamFormService;
  let regulatoryParamService: RegulatoryParamService;

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

    fixture = TestBed.createComponent(RegulatoryParamUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    regulatoryParamFormService = TestBed.inject(RegulatoryParamFormService);
    regulatoryParamService = TestBed.inject(RegulatoryParamService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const regulatoryParam: IRegulatoryParam = { id: 25715 };

      activatedRoute.data = of({ regulatoryParam });
      comp.ngOnInit();

      expect(comp.regulatoryParam).toEqual(regulatoryParam);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IRegulatoryParam>();
      const regulatoryParam = { id: 13111 };
      vitest.spyOn(regulatoryParamFormService, 'getRegulatoryParam').mockReturnValue(regulatoryParam);
      vitest.spyOn(regulatoryParamService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ regulatoryParam });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(regulatoryParam);
      saveSubject.complete();

      // THEN
      expect(regulatoryParamFormService.getRegulatoryParam).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(regulatoryParamService.update).toHaveBeenCalledWith(expect.objectContaining(regulatoryParam));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IRegulatoryParam>();
      const regulatoryParam = { id: 13111 };
      vitest.spyOn(regulatoryParamFormService, 'getRegulatoryParam').mockReturnValue({ id: null });
      vitest.spyOn(regulatoryParamService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ regulatoryParam: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(regulatoryParam);
      saveSubject.complete();

      // THEN
      expect(regulatoryParamFormService.getRegulatoryParam).toHaveBeenCalled();
      expect(regulatoryParamService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IRegulatoryParam>();
      const regulatoryParam = { id: 13111 };
      vitest.spyOn(regulatoryParamService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ regulatoryParam });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(regulatoryParamService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
