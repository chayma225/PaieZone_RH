import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IPublicHoliday } from '../public-holiday.model';
import { PublicHolidayService } from '../service/public-holiday.service';

import { PublicHolidayFormGroup, PublicHolidayFormService } from './public-holiday-form.service';

@Component({
  selector: 'pz-public-holiday-update',
  templateUrl: './public-holiday-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule, NgbInputDatepicker],
})
export class PublicHolidayUpdate implements OnInit {
  readonly isSaving = signal(false);
  publicHoliday: IPublicHoliday | null = null;

  protected publicHolidayService = inject(PublicHolidayService);
  protected publicHolidayFormService = inject(PublicHolidayFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PublicHolidayFormGroup = this.publicHolidayFormService.createPublicHolidayFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ publicHoliday }) => {
      this.publicHoliday = publicHoliday;
      if (publicHoliday) {
        this.updateForm(publicHoliday);
      }
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const publicHoliday = this.publicHolidayFormService.getPublicHoliday(this.editForm);
    if (publicHoliday.id === null) {
      this.subscribeToSaveResponse(this.publicHolidayService.create(publicHoliday));
    } else {
      this.subscribeToSaveResponse(this.publicHolidayService.update(publicHoliday));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IPublicHoliday | null>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving.set(false);
  }

  protected updateForm(publicHoliday: IPublicHoliday): void {
    this.publicHoliday = publicHoliday;
    this.publicHolidayFormService.resetForm(this.editForm, publicHoliday);
  }
}
