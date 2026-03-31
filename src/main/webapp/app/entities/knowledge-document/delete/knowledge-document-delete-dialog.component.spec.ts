jest.mock('@ng-bootstrap/ng-bootstrap');

import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { KnowledgeDocumentService } from '../service/knowledge-document.service';

import { KnowledgeDocumentDeleteDialogComponent } from './knowledge-document-delete-dialog.component';

describe('KnowledgeDocument Management Delete Component', () => {
  let comp: KnowledgeDocumentDeleteDialogComponent;
  let fixture: ComponentFixture<KnowledgeDocumentDeleteDialogComponent>;
  let service: KnowledgeDocumentService;
  let mockActiveModal: NgbActiveModal;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [KnowledgeDocumentDeleteDialogComponent],
      providers: [provideHttpClient(), NgbActiveModal],
    })
      .overrideTemplate(KnowledgeDocumentDeleteDialogComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(KnowledgeDocumentDeleteDialogComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(KnowledgeDocumentService);
    mockActiveModal = TestBed.inject(NgbActiveModal);
  });

  describe('confirmDelete', () => {
    it('should call delete service on confirmDelete', inject(
      [],
      fakeAsync(() => {
        // GIVEN
        jest.spyOn(service, 'delete').mockReturnValue(of(new HttpResponse({ body: {} })));

        // WHEN
        comp.confirmDelete(123);
        tick();

        // THEN
        expect(service.delete).toHaveBeenCalledWith(123);
        expect(mockActiveModal.close).toHaveBeenCalledWith('deleted');
      }),
    ));

    it('should not call delete service on clear', () => {
      // GIVEN
      jest.spyOn(service, 'delete');

      // WHEN
      comp.cancel();

      // THEN
      expect(service.delete).not.toHaveBeenCalled();
      expect(mockActiveModal.close).not.toHaveBeenCalled();
      expect(mockActiveModal.dismiss).toHaveBeenCalled();
    });
  });
});
