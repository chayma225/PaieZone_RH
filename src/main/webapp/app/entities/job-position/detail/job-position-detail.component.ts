import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IJobPosition } from '../job-position.model';

@Component({
  selector: 'pz-job-position-detail',
  templateUrl: './job-position-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class JobPositionDetailComponent {
  jobPosition = input<IJobPosition | null>(null);

  previousState(): void {
    window.history.back();
  }
}
