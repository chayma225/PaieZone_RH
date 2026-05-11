// src/main/webapp/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

// ── default exports (sans accolades) ──────────────────────────────
import { Alert } from './alert/alert';
import { AlertError } from './alert/alert-error';
import HasAnyAuthorityDirective from './auth/has-any-authority.directive';
import FormatMediumDatePipe from './date/format-medium-date.pipe';
import FormatMediumDatetimePipe from './date/format-medium-datetime.pipe';
import DurationPipe from './date/duration.pipe';

// ── named exports (avec accolades) ────────────────────────────────
import { SortDirective } from './sort/sort.directive';
import { SortByDirective } from './sort/sort-by.directive';
import { ItemCount } from './pagination';

const MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,
  NgbModule,
  FontAwesomeModule,
  TranslateModule,
  Alert,
  AlertError,
  HasAnyAuthorityDirective,
  DurationPipe,
  FormatMediumDatePipe,
  FormatMediumDatetimePipe,
  SortDirective,
  SortByDirective,
  ItemCount,
];

@NgModule({
  imports: MODULES,
  exports: MODULES,
})
export default class SharedModule {}
