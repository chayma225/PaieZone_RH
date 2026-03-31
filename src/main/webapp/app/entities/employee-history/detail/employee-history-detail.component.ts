import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { IEmployeeHistory } from '../employee-history.model';

@Component({
  selector: 'pz-employee-history-detail',
  templateUrl: './employee-history-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class EmployeeHistoryDetailComponent {
  employeeHistory = input<IEmployeeHistory | null>(null);

  previousState(): void {
    window.history.back();
  }
}
