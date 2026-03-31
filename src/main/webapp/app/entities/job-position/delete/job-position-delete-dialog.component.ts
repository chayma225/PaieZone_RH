import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IJobPosition } from '../job-position.model';
import { JobPositionService } from '../service/job-position.service';

@Component({
  templateUrl: './job-position-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class JobPositionDeleteDialogComponent {
  jobPosition?: IJobPosition;

  protected jobPositionService = inject(JobPositionService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.jobPositionService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
