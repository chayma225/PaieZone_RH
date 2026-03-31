import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { IHrDocument } from '../hr-document.model';

@Component({
  selector: 'pz-hr-document-detail',
  templateUrl: './hr-document-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class HrDocumentDetailComponent {
  hrDocument = input<IHrDocument | null>(null);

  previousState(): void {
    window.history.back();
  }
}
