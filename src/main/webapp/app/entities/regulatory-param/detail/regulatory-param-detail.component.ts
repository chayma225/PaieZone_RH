import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { IRegulatoryParam } from '../regulatory-param.model';

@Component({
  selector: 'pz-regulatory-param-detail',
  templateUrl: './regulatory-param-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe],
})
export class RegulatoryParamDetailComponent {
  regulatoryParam = input<IRegulatoryParam | null>(null);

  previousState(): void {
    window.history.back();
  }
}
