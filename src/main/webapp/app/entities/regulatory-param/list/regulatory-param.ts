
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { filter } from 'rxjs';
import SharedModule from 'app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import {
  IRegulatoryParam,
  PARAM_FORMAT,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from '../regulatory-param.model';
import { RegulatoryParamService } from '../service/regulatory-param.service';
import { RegulatoryParamDeleteDialog } from '../delete/regulatory-param-delete-dialog';

@Component({
  standalone: true,
  selector: 'jhi-regulatory-param',
  templateUrl: './regulatory-param.html',
  imports: [RouterModule, FormsModule, SharedModule],
})
export class RegulatoryParam implements OnInit {
  regulatoryParams?: IRegulatoryParam[];
  isLoading       = false;
  filterCategory  = '';
  filterKey       = '';
  errorMsg        = '';

  readonly paramFormat     = PARAM_FORMAT;
  readonly categoryColors  = CATEGORY_COLORS;
  readonly categoryLabels  = CATEGORY_LABELS;

  protected regulatoryParamService = inject(RegulatoryParamService);
  protected modalService           = inject(NgbModal);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.errorMsg  = '';
    this.regulatoryParamService.query({ sort: ['category,asc', 'paramKey,asc'] }).subscribe({
      next:  res => { this.regulatoryParams = res.body ?? []; this.isLoading = false; },
      error: ()  => { this.errorMsg = 'Erreur lors du chargement.'; this.isLoading = false; },
    });
  }

  // ── Formatage de la valeur ────────────────────────────────

  formatValue(p: IRegulatoryParam): string {
    const fmt = this.paramFormat[p.paramKey ?? ''];
    const v   = p.numericValue ?? 0;
    if (!fmt) return v.toFixed(4);
    if (fmt.isPercent) return `${(v * 100).toFixed(2)} %`;
    if (fmt.unit === 'DT') return `${v.toFixed(3)} DT`;
    if (fmt.unit === '×') return `× ${v.toFixed(2)}`;
    return `${v} ${fmt.unit}`;
  }

  // ── Filtres ───────────────────────────────────────────────

  get filteredParams(): IRegulatoryParam[] {
    return (this.regulatoryParams ?? []).filter(p =>
      (!this.filterCategory || p.category === this.filterCategory) &&
      (!this.filterKey || (p.paramKey ?? '').toLowerCase().includes(this.filterKey.toLowerCase())),
    );
  }

  get categories(): string[] {
    return [...new Set((this.regulatoryParams ?? []).map(p => p.category ?? '').filter(Boolean))];
  }

  // ── Suppression ───────────────────────────────────────────

  delete(p: IRegulatoryParam): void {
    const ref = this.modalService.open(RegulatoryParamDeleteDialog, {
      size: 'lg',
      backdrop: 'static',
    });
    ref.componentInstance.regulatoryParam = p;
    ref.closed.pipe(filter(r => r === ITEM_DELETED_EVENT)).subscribe(() => this.load());
  }

  trackId = (_i: number, p: IRegulatoryParam): number => p.id;
}
