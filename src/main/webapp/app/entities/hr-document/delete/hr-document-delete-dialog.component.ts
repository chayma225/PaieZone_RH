import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IHrDocument } from '../hr-document.model';
import { HrDocumentService } from '../service/hr-document.service';

@Component({
  templateUrl: './hr-document-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class HrDocumentDeleteDialogComponent {
  hrDocument?: IHrDocument;

  protected hrDocumentService = inject(HrDocumentService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.hrDocumentService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
