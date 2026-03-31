import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IKnowledgeDocument } from '../knowledge-document.model';
import { KnowledgeDocumentService } from '../service/knowledge-document.service';

@Component({
  templateUrl: './knowledge-document-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class KnowledgeDocumentDeleteDialogComponent {
  knowledgeDocument?: IKnowledgeDocument;

  protected knowledgeDocumentService = inject(KnowledgeDocumentService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.knowledgeDocumentService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
