import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IPublicHoliday } from '../public-holiday.model';
import { PublicHolidayService } from '../service/public-holiday.service';
import { PublicHolidayFormGroup, PublicHolidayFormService } from './public-holiday-form.service';

@Component({
  selector: 'pz-public-holiday-update',
  templateUrl: './public-holiday-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class PublicHolidayUpdateComponent implements OnInit {
  isSaving = false;
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
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const publicHoliday = this.publicHolidayFormService.getPublicHoliday(this.editForm);
    if (publicHoliday.id !== null) {
      this.subscribeToSaveResponse(this.publicHolidayService.update(publicHoliday));
    } else {
      this.subscribeToSaveResponse(this.publicHolidayService.create(publicHoliday));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPublicHoliday>>): void {
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
    this.isSaving = false;
  }

  protected updateForm(publicHoliday: IPublicHoliday): void {
    this.publicHoliday = publicHoliday;
    this.publicHolidayFormService.resetForm(this.editForm, publicHoliday);
  }
}
