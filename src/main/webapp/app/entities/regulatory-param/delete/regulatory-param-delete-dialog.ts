import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IRegulatoryParam } from '../regulatory-param.model';
import { RegulatoryParamService } from '../service/regulatory-param.service';
import TranslateDirective from "../../../shared/language/translate.directive";

@Component({
  standalone: true,
  templateUrl: './regulatory-param-delete-dialog.html',
  imports: [SharedModule, FormsModule, TranslateDirective],
})
export class RegulatoryParamDeleteDialog {
  regulatoryParam?: IRegulatoryParam;

  protected regulatoryParamService = inject(RegulatoryParamService);
  protected activeModal            = inject(NgbActiveModal);

  cancel(): void { this.activeModal.dismiss(); }

  confirmDelete(id: number): void {
    this.regulatoryParamService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
