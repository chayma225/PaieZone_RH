import {
  Component, ChangeDetectionStrategy, signal, output, input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  trigger, transition, style, animate, state,
} from '@angular/animations';
import IconComponent from '../../core/icon/icon.component';

// ───────────────────────────────────────────────────────────────────────────
// pz-holiday-slideover
// Slide-over latéral pour ajouter un jour férié + flash vert à l'insertion.
//
// Usage :
//   <button (click)="sheet.open()">Ajouter jour férié</button>
//   <pz-holiday-slideover #sheet (created)="onHolidayCreated($event)" />
//
// Le composant gère son overlay + le panneau. L'animation d'insertion dans la
// LISTE se fait côté liste via le trigger `listInsert` exporté plus bas (à
// placer sur le *ngFor / @for de ton tableau de jours fériés).
// ───────────────────────────────────────────────────────────────────────────

export interface Holiday {
  id: number;
  date: string;        // ISO yyyy-mm-dd
  label: string;
  type: 'FERIE' | 'PONT' | 'CHOME';
  majoration: number;  // % de majoration paie (ex: 100, 150, 200)
  recurring: boolean;
}

@Component({
  selector: 'pz-holiday-slideover',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Overlay (fond) : simple fade — léger, ne distrait pas.
    trigger('overlay', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('180ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('160ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    // Panneau : glisse depuis la droite. Courbe "premium" ease-out.
    trigger('sheet', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('340ms cubic-bezier(.22,1,.36,1)', style({ transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('260ms cubic-bezier(.55,0,1,.45)', style({ transform: 'translateX(100%)' })),
      ]),
    ]),
    // Champs du formulaire : apparition en cascade (stagger léger).
    trigger('field', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('260ms {{delay}}ms cubic-bezier(.22,1,.36,1)',
          style({ opacity: 1, transform: 'translateY(0)' })),
      ], { params: { delay: 0 } }),
    ]),
  ],
  template: `
    @if (visible()) {
      <div class="ov" [@overlay] (click)="close()"></div>
      <aside class="sheet" [@sheet] role="dialog" aria-label="Ajouter un jour férié">
        <header class="sheet-head">
          <div>
            <div class="eyebrow">Calendrier de paie</div>
            <h2>Ajouter un jour férié</h2>
          </div>
          <button class="x" (click)="close()" aria-label="Fermer">
            <pz-icon name="X" [size]="16" [strokeWidth]="1.6" />
          </button>
        </header>

        <div class="sheet-body">
          <div class="field" [@field]="{ value: '', params: { delay: 40 } }">
            <label>Intitulé</label>
            <input class="in" [(ngModel)]="form.label" placeholder="Ex. Fête du Travail" />
          </div>

          <div class="grid2">
            <div class="field" [@field]="{ value: '', params: { delay: 90 } }">
              <label>Date</label>
              <input class="in mono" type="date" [(ngModel)]="form.date" />
            </div>
            <div class="field" [@field]="{ value: '', params: { delay: 130 } }">
              <label>Type</label>
              <select class="in" [(ngModel)]="form.type">
                <option value="FERIE">Férié légal</option>
                <option value="CHOME">Chômé payé</option>
                <option value="PONT">Pont</option>
              </select>
            </div>
          </div>

          <div class="field" [@field]="{ value: '', params: { delay: 180 } }">
            <label>Majoration des heures travaillées</label>
            <div class="seg">
              @for (m of [100, 150, 200]; track m) {
                <button type="button" class="seg-btn" [class.on]="form.majoration === m"
                        (click)="form.majoration = m">+{{ m }}%</button>
              }
            </div>
            <!-- Impact immédiat : surbrillance de la règle -->
            <div class="impact" [class.show]="form.majoration > 100">
              <pz-icon name="Sparkles" [size]="13" />
              <span>Les heures travaillées ce jour seront payées
                <strong>×{{ form.majoration / 100 }}</strong> (règle appliquée automatiquement au prochain calcul).</span>
            </div>
          </div>

          <label class="check" [@field]="{ value: '', params: { delay: 230 } }">
            <input type="checkbox" [(ngModel)]="form.recurring" />
            <span class="box"><pz-icon name="Check" [size]="11" [strokeWidth]="2.4" /></span>
            Récurrent chaque année
          </label>
        </div>

        <footer class="sheet-foot">
          <button class="btn" (click)="close()">Annuler</button>
          <button class="btn primary" (click)="submit()" [disabled]="!form.label || !form.date">
            <pz-icon name="Plus" [size]="14" [strokeWidth]="1.8" /> Ajouter au calendrier
          </button>
        </footer>
      </aside>
    }
  `,
  styles: [`
    :host { position: fixed; inset: 0; z-index: 60; pointer-events: none; }
    :host:has(.sheet) { pointer-events: auto; }
    .ov { position: absolute; inset: 0; background: rgba(10,10,15,.42);
      backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); }
    .sheet {
      position: absolute; top: 0; right: 0; bottom: 0;
      width: 420px; max-width: 92vw;
      background: var(--pz-surface, #fff);
      box-shadow: -24px 0 60px -20px rgba(10,10,15,.28);
      display: flex; flex-direction: column;
      will-change: transform;            /* promote au compositing → 60fps */
    }
    .sheet-head { display: flex; align-items: flex-start; justify-content: space-between;
      padding: 24px 24px 18px; border-bottom: 1px solid var(--pz-line, #ececea); }
    .eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: .1em;
      font-weight: 700; color: var(--pz-primary, #5b21b6); margin-bottom: 6px; }
    .sheet-head h2 { font-size: 19px; font-weight: 700; letter-spacing: -.02em; margin: 0; }
    .x { width: 32px; height: 32px; border: 0; background: transparent; border-radius: 8px;
      display: grid; place-items: center; cursor: pointer; color: var(--pz-muted, #6b7280); }
    .x:hover { background: var(--pz-surface-2, #f9fafb); color: var(--pz-ink, #0a0a0f); }

    .sheet-body { flex: 1; overflow-y: auto; padding: 22px 24px; display: flex; flex-direction: column; gap: 18px; }
    .field { display: flex; flex-direction: column; gap: 7px; }
    .field label { font-size: 12.5px; font-weight: 600; color: var(--pz-ink-2, #1f2128); }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .in { height: 44px; padding: 0 14px; border: 1px solid var(--pz-line-2, #dcdcd6);
      border-radius: 10px; font: inherit; font-size: 14px; background: #fff; outline: 0;
      transition: border-color .15s, box-shadow .15s; }
    .in:focus { border-color: var(--pz-primary, #5b21b6); box-shadow: 0 0 0 4px rgba(91,33,182,.1); }
    .mono { font-family: 'JetBrains Mono', monospace; }

    .seg { display: flex; gap: 6px; padding: 4px; background: var(--pz-surface-3, #f3f4f6); border-radius: 10px; }
    .seg-btn { flex: 1; height: 34px; border: 0; background: transparent; border-radius: 7px;
      font: inherit; font-weight: 600; font-size: 13px; color: var(--pz-muted, #6b7280);
      cursor: pointer; transition: all .18s cubic-bezier(.22,1,.36,1); }
    .seg-btn.on { background: #fff; color: var(--pz-primary, #5b21b6);
      box-shadow: 0 1px 3px rgba(10,10,15,.1); }

    /* Impact : se révèle en grid-rows (0fr→1fr) = fluide, pas de saut */
    .impact { display: grid; grid-template-rows: 0fr; opacity: 0;
      transition: grid-template-rows .3s cubic-bezier(.22,1,.36,1), opacity .3s;
      font-size: 12.5px; color: var(--pz-primary-ink, #4c1d95); }
    .impact > * { overflow: hidden; display: flex; gap: 8px; align-items: flex-start; }
    .impact.show { grid-template-rows: 1fr; opacity: 1; padding-top: 4px; }
    .impact strong { font-weight: 700; }

    .check { display: flex; align-items: center; gap: 10px; font-size: 13.5px;
      color: var(--pz-ink-3, #3a3d47); cursor: pointer; user-select: none; }
    .check input { position: absolute; opacity: 0; pointer-events: none; }
    .check .box { width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid var(--pz-line-2, #dcdcd6);
      background: #fff; display: grid; place-items: center; color: transparent; transition: all .12s; }
    .check input:checked + .box { background: var(--pz-primary, #5b21b6);
      border-color: var(--pz-primary, #5b21b6); color: #fff; }

    .sheet-foot { display: flex; gap: 10px; padding: 18px 24px; border-top: 1px solid var(--pz-line, #ececea); }
    .btn { flex: 1; height: 44px; border: 1px solid var(--pz-line-2, #dcdcd6); background: #fff;
      border-radius: 10px; font: inherit; font-weight: 600; font-size: 14px; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; gap: 7px;
      transition: all .15s; }
    .btn:hover { background: var(--pz-surface-2, #f9fafb); }
    .btn.primary { background: var(--pz-ink, #0a0a0f); color: #fff; border-color: var(--pz-ink, #0a0a0f); }
    .btn.primary:hover { background: var(--pz-primary, #5b21b6); border-color: var(--pz-primary, #5b21b6); }
    .btn.primary:disabled { opacity: .5; cursor: not-allowed; }

    @media (prefers-reduced-motion: reduce) { .sheet, .impact, .seg-btn { transition: none !important; } }
  `],
})
export default class HolidaySlideoverComponent {
  protected readonly visible = signal(false);
  readonly created = output<Holiday>();

  protected form: Omit<Holiday, 'id'> = {
    label: '', date: '', type: 'FERIE', majoration: 100, recurring: false,
  };

  open(): void {
    this.form = { label: '', date: '', type: 'FERIE', majoration: 100, recurring: false };
    this.visible.set(true);
  }
  close(): void { this.visible.set(false); }

  submit(): void {
    if (!this.form.label || !this.form.date) return;
    this.created.emit({ id: Date.now(), ...this.form });
    this.close();
  }
}
