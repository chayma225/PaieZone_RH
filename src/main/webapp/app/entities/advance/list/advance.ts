import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { filter } from 'rxjs';
import SharedModule from 'app/shared/shared.module';
import { AlertError} from 'app/shared/alert/alert-error';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IAdvance, ADVANCE_STATUS_COLORS, ADVANCE_STATUS_LABELS } from '../advance.model';
import { AdvanceService } from '../service/advance.service';
import { AdvanceDeleteDialog } from '../delete/advance-delete-dialog';

const MONTHS = ['','Janv','Févr','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'];

@Component({
  standalone: true,
  selector: 'jhi-advance',
  templateUrl: './advance.html',
  imports: [ReactiveFormsModule,RouterModule, FormsModule, SharedModule,AlertError],
})
export class Advance implements OnInit {
  advances?: IAdvance[];
  isLoading = false;
  filterEmployeeId?: number;
  months = MONTHS;
  statusColors = ADVANCE_STATUS_COLORS;
  statusLabels = ADVANCE_STATUS_LABELS;

  protected service = inject(AdvanceService);
  protected modal   = inject(NgbModal);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    const req: any = { sort: ['requestDate,desc'] };
    if (this.filterEmployeeId) req['employeeId.equals'] = this.filterEmployeeId;
    this.service.query(req).subscribe({
      next: r => { this.advances = r.body ?? []; this.isLoading = false; },
      error: () => { this.isLoading = false; },
    });
  }

  canEdit(a: IAdvance): boolean { return a.status === 'REQUESTED'; }

  delete(advance: IAdvance): void {
    const ref = this.modal.open(AdvanceDeleteDialog, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.advance = advance;
    ref.closed.pipe(filter(r => r === ITEM_DELETED_EVENT)).subscribe(() => this.load());
  }

  trackId = (_i: number, a: IAdvance) => a.id;
}
