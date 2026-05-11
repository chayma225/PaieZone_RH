import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Data, ParamMap, Router, RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, combineLatest, filter, tap } from 'rxjs';

import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { LeaveTypeDeleteDialog } from '../delete/leave-type-delete-dialog';
import { ILeaveType } from '../leave-type.model';
import { LeaveTypeService } from '../service/leave-type.service';

@Component({
  selector: 'pz-leave-type',
  templateUrl: './leave-type.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    FontAwesomeModule,
    AlertError,
    Alert,
    SortDirective,
    SortByDirective,
    TranslateDirective,
    TranslateModule,
  ],
})
export class LeaveType implements OnInit {
  subscription: Subscription | null = null;
  readonly leaveTypes = signal<ILeaveType[]>([]);

  sortState = sortStateSignal({});

  readonly router = inject(Router);
  protected readonly leaveTypeService = inject(LeaveTypeService);
  readonly isLoading = this.leaveTypeService.leaveTypesResource.isLoading;
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);

  constructor() {
    effect(() => {
      const data = this.leaveTypeService.leaveTypes() ?? [];
      this.leaveTypes.set(this.fillComponentAttributesFromResponseBody([...data]));
    }, { allowSignalWrites: true });
  }


  getBadgeStyle(name: string): { color: string, bg: string, border: string } {
    const styles: Record<string, { color: string, bg: string, border: string }> = {
      ANNUAL: { color: '#1d4ed8', bg: '#eff6ff', border: '#dbeafe' },      // Bleu
      SICK: { color: '#dc2626', bg: '#fef2f2', border: '#fee2e2' },        // Rouge
      MATERNITY: { color: '#7c3aed', bg: '#f5f3ff', border: '#ede9fe' },   // Violet
      PATERNITY: { color: '#2563eb', bg: '#eff6ff', border: '#dbeafe' },   // Bleu clair
      UNPAID: { color: '#d97706', bg: '#fffbeb', border: '#fef3c7' },      // Orange
      MARRIAGE: { color: '#db2777', bg: '#fdf2f8', border: '#fce7f3' },    // Rose
      BEREAVEMENT: { color: '#4b5563', bg: '#f9fafb', border: '#f3f4f6' }, // Gris
      EXCEPTIONAL: { color: '#059669', bg: '#f0fdf4', border: '#dcfce7' }, // Vert
    };
    return styles[name] || { color: '#475569', bg: '#f1f5f9', border: '#e2e8f0' };
  }

  trackId = (item: ILeaveType): number => this.leaveTypeService.getLeaveTypeIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();
  }

  delete(leaveType: ILeaveType): void {
    const modalRef = this.modalService.open(LeaveTypeDeleteDialog, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.leaveType = leaveType;
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        tap(() => this.load()),
      )
      .subscribe();
  }

  load(): void {
    this.queryBackend();
  }

  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(event);
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected refineData(data: ILeaveType[]): ILeaveType[] {
    const { predicate, order } = this.sortState();
    return predicate && order ? data.sort(this.sortService.startSort({ predicate, order })) : data;
  }

  protected fillComponentAttributesFromResponseBody(data: ILeaveType[]): ILeaveType[] {
    return this.refineData(data);
  }

  protected queryBackend(): void {
    const queryObject: any = {
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    this.leaveTypeService.leaveTypesParams.set(queryObject);
  }

  protected handleNavigation(sortState: SortState): void {
    const queryParamsObj = {
      sort: this.sortService.buildSortParam(sortState),
    };

    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute,
      queryParams: queryParamsObj,
    });
  }
}
