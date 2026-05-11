// src/main/webapp/app/entities/bonus/list/bonus.component.ts
import { Component, OnInit, inject } from '@angular/core';
import {RouterLink, RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { filter } from 'rxjs';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IBonus } from '../bonus.model';
import { BonusService } from '../service/bonus.service';
import { BonusDeleteDialog} from '../delete/bonus-delete-dialog';
import {DecimalPipe, NgClass} from "@angular/common";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import SharedModule from 'app/shared/shared.module';
import { AlertError } from 'app/shared/alert/alert-error';

const MONTHS = ['','Janv','Févr','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'];

@Component({
  standalone: true, selector: 'jhi-bonus',
  templateUrl: './bonus.html',
  imports: [ReactiveFormsModule,SharedModule, AlertError,FormsModule, RouterLink, NgClass, DecimalPipe, FaIconComponent,],
})
export class Bonus implements OnInit {
  bonuses?: IBonus[];
  isLoading = false;
  filterEmployeeId?: number;
  months = MONTHS;

  protected service = inject(BonusService);
  protected modal   = inject(NgbModal);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    const req: any = { sort: ['year,desc','month,desc'] };
    if (this.filterEmployeeId) req['employeeId.equals'] = this.filterEmployeeId;
    this.service.query(req).subscribe({
      next: r => { this.bonuses = r.body ?? []; this.isLoading = false; },
      error: () => { this.isLoading = false; },
    });
  }

  delete(bonus: IBonus): void {
    const ref = this.modal.open(BonusDeleteDialog, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.bonus = bonus;
    ref.closed.pipe(filter(r => r === ITEM_DELETED_EVENT)).subscribe(() => this.load());
  }

  trackId = (_i: number, b: IBonus) => b.id;
}
