// src/main/webapp/app/entities/advance/delete/advance-delete-dialog.component.ts
import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IAdvance } from '../advance.model';
import { AdvanceService } from '../service/advance.service';
import {FormsModule} from "@angular/forms";
import {DecimalPipe} from "@angular/common";

@Component({ standalone: true, templateUrl: './advance-delete-dialog.html', imports: [
    FormsModule,
    DecimalPipe
  ]
})
export class AdvanceDeleteDialog {
  advance?: IAdvance;
  protected service     = inject(AdvanceService);
  protected activeModal = inject(NgbActiveModal);
  cancel(): void { this.activeModal.dismiss(); }
  confirmDelete(id: number): void {
    this.service.delete(id).subscribe(() => this.activeModal.close(ITEM_DELETED_EVENT));
  }
}
