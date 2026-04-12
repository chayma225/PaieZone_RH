import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Data, ParamMap, Router, RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, combineLatest, filter, tap } from 'rxjs';

import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { FormatMediumDatePipe } from 'app/shared/date';
import { TranslateDirective } from 'app/shared/language';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { ICnssRate } from '../cnss-rate.model';
import { CnssRateDeleteDialog } from '../delete/cnss-rate-delete-dialog';
import { CnssRateService } from '../service/cnss-rate.service';

@Component({
  selector: 'pz-cnss-rate',
  templateUrl: './cnss-rate.html',
  imports: [
    RouterLink,
    FormsModule,
    FontAwesomeModule,
    AlertError,
    Alert,
    SortDirective,
    SortByDirective,
    TranslateDirective,
    TranslateModule,
    FormatMediumDatePipe,
  ],
})
export class CnssRate implements OnInit {
  subscription: Subscription | null = null;
  readonly cnssRates = signal<ICnssRate[]>([]);

  sortState = sortStateSignal({});

  readonly router = inject(Router);
  protected readonly cnssRateService = inject(CnssRateService);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  readonly isLoading = this.cnssRateService.cnssRatesResource.isLoading;
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);

  constructor() {
    effect(() => {
      this.cnssRates.set(this.fillComponentAttributesFromResponseBody([...this.cnssRateService.cnssRates()]));
    });
  }

  trackId = (item: ICnssRate): number => this.cnssRateService.getCnssRateIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => {
          if (this.cnssRates().length === 0) {
            this.load();
          }
        }),
      )
      .subscribe();
  }

  delete(cnssRate: ICnssRate): void {
    const modalRef = this.modalService.open(CnssRateDeleteDialog, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.cnssRate = cnssRate;
    // unsubscribe not needed because closed completes on modal close
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

  protected refineData(data: ICnssRate[]): ICnssRate[] {
    const { predicate, order } = this.sortState();
    return predicate && order ? data.sort(this.sortService.startSort({ predicate, order })) : data;
  }

  protected fillComponentAttributesFromResponseBody(data: ICnssRate[]): ICnssRate[] {
    return this.refineData(data);
  }

  protected queryBackend(): void {
    const queryObject: any = {
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    this.cnssRateService.cnssRatesParams.set(queryObject);
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
