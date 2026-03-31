import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { RegulatoryParamService } from '../service/regulatory-param.service';
import { IRegulatoryParam } from '../regulatory-param.model';
import { RegulatoryParamFormService } from './regulatory-param-form.service';

import { RegulatoryParamUpdateComponent } from './regulatory-param-update.component';

describe('RegulatoryParam Management Update Component', () => {
  let comp: RegulatoryParamUpdateComponent;
  let fixture: ComponentFixture<RegulatoryParamUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let regulatoryParamFormService: RegulatoryParamFormService;
  let regulatoryParamService: RegulatoryParamService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RegulatoryParamUpdateComponent],
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
      .overrideTemplate(RegulatoryParamUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(RegulatoryParamUpdateComponent);
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
      const saveSubject = new Subject<HttpResponse<IRegulatoryParam>>();
      const regulatoryParam = { id: 13111 };
      jest.spyOn(regulatoryParamFormService, 'getRegulatoryParam').mockReturnValue(regulatoryParam);
      jest.spyOn(regulatoryParamService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ regulatoryParam });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: regulatoryParam }));
      saveSubject.complete();

      // THEN
      expect(regulatoryParamFormService.getRegulatoryParam).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(regulatoryParamService.update).toHaveBeenCalledWith(expect.objectContaining(regulatoryParam));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRegulatoryParam>>();
      const regulatoryParam = { id: 13111 };
      jest.spyOn(regulatoryParamFormService, 'getRegulatoryParam').mockReturnValue({ id: null });
      jest.spyOn(regulatoryParamService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ regulatoryParam: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: regulatoryParam }));
      saveSubject.complete();

      // THEN
      expect(regulatoryParamFormService.getRegulatoryParam).toHaveBeenCalled();
      expect(regulatoryParamService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRegulatoryParam>>();
      const regulatoryParam = { id: 13111 };
      jest.spyOn(regulatoryParamService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ regulatoryParam });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(regulatoryParamService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
