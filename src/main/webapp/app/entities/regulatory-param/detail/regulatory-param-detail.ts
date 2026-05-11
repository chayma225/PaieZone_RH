
import { Component, inject } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import SharedModule from 'app/shared/shared.module';
import {
  IRegulatoryParam,
  PARAM_FORMAT,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from '../regulatory-param.model';

@Component({
  standalone: true,
  selector: 'jhi-regulatory-param-detail',
  templateUrl: './regulatory-param-detail.html',
  imports: [SharedModule, RouterModule],
})
export class RegulatoryParamDetail {
  // ✅ Non-null assertion — le resolve garantit toujours une valeur ou redirige vers 404
  regulatoryParam!: IRegulatoryParam;

  readonly paramFormat    = PARAM_FORMAT;
  readonly categoryColors = CATEGORY_COLORS;
  readonly categoryLabels = CATEGORY_LABELS;

  protected activatedRoute = inject(ActivatedRoute);

  constructor() {
    this.activatedRoute.data.subscribe(({ regulatoryParam }) => {
      this.regulatoryParam = regulatoryParam;
    });
  }

  previousState(): void { window.history.back(); }

  formatValue(): string {
    const fmt = this.paramFormat[this.regulatoryParam.paramKey ?? ''];
    const v = this.regulatoryParam.numericValue ?? 0;
    if (!fmt) return v.toFixed(4);
    if (fmt.isPercent) return `${(v * 100).toFixed(2)} %`;
    if (fmt.unit === 'DT') return `${v.toFixed(3)} DT`;
    if (fmt.unit === '×') return `× ${v.toFixed(2)}`;
    return `${v} ${fmt.unit}`;
  }

  getUnit(): string {
    const fmt = this.paramFormat[this.regulatoryParam.paramKey ?? ''];
    return fmt?.unit || '';
  }
}
