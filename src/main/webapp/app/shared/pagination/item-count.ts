// app/shared/pagination/item-count.ts
import { Component, computed, input } from '@angular/core';
import TranslateDirective from '../language/translate.directive';

@Component({
  selector: 'pz-item-count',
  template: `<div pzTranslate="global.item-count" [translateValues]="{ first: first(), second: second(), total: total() }"></div>`,
  imports: [TranslateDirective],
})
export default class ItemCount {   // ✅ export default obligatoire
  readonly params = input<{
    page?: number;
    totalItems?: number;
    itemsPerPage?: number;
  }>();

  readonly first = computed(() => {
    const p = this.params();
    if (p?.page && p.totalItems !== undefined && p.itemsPerPage) {
      return (p.page - 1) * p.itemsPerPage + 1;
    }
    return undefined;
  });

  readonly second = computed(() => {
    const p = this.params();
    if (p?.page && p.totalItems !== undefined && p.itemsPerPage) {
      return Math.min(p.page * p.itemsPerPage, p.totalItems);
    }
    return undefined;
  });

  readonly total = computed(() => this.params()?.totalItems);
}
