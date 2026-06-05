import {
  Component, ChangeDetectionStrategy, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import IconComponent from '../../core/icon/icon.component';

// ───────────────────────────────────────────────────────────────────────────
// pz-rubriques-config
// Configuration des rubriques & primes : toggle premium animé (cubic-bezier)
// pour (dés)activer une rubrique pour un groupe d'employés, + révélation
// élégante des formules de calcul complexes (accordéon + "chips" de formule).
//
//   <pz-rubriques-config />
// ───────────────────────────────────────────────────────────────────────────

interface Rubrique {
  id: number;
  code: string;
  label: string;
  cat: 'GAIN' | 'RETENUE';
  scope: string;          // cible (catégorie / tous)
  active: boolean;
  formula?: { expr: string; vars: { k: string; v: string }[] };
}

@Component({
  selector: 'pz-rubriques-config',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('list', [
      transition(':enter', [
        query('.rub', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger(55, animate('300ms cubic-bezier(.22,1,.36,1)',
            style({ opacity: 1, transform: 'translateY(0)' }))),
        ], { optional: true }),
      ]),
    ]),
    // Révélation de la formule : grid-rows 0fr→1fr = fluide, pas de "jump".
    trigger('reveal', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('280ms cubic-bezier(.22,1,.36,1)', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
  template: `
    <div class="wrap" [@list]>
      @for (r of rubriques(); track r.id) {
        <div class="rub" [class.off]="!r.active">
          <div class="rub-main">
            <span class="badge" [class.gain]="r.cat === 'GAIN'" [class.ret]="r.cat === 'RETENUE'">
              {{ r.cat === 'GAIN' ? 'Gain' : 'Retenue' }}
            </span>
            <div class="rub-id">
              <div class="rub-label">{{ r.label }}</div>
              <div class="rub-sub mono">{{ r.code }} · {{ r.scope }}</div>
            </div>

            @if (r.formula) {
              <button class="formula-toggle" [class.open]="expanded() === r.id"
                      (click)="toggleFormula(r.id)">
                <pz-icon name="Sparkles" [size]="13" /> Formule
                <pz-icon name="Caret" [size]="11" [strokeWidth]="2" class="caret" />
              </button>
            }

            <!-- Toggle premium animé -->
            <button class="tgl" [class.on]="r.active" role="switch" [attr.aria-checked]="r.active"
                    (click)="toggle(r)">
              <span class="knob"></span>
            </button>
          </div>

          @if (r.formula && expanded() === r.id) {
            <div class="formula" [@reveal]>
              <div class="formula-inner">
                <div class="f-expr mono">{{ r.formula.expr }}</div>
                <div class="f-vars">
                  @for (v of r.formula.vars; track v.k) {
                    <span class="chip"><b class="mono">{{ v.k }}</b> {{ v.v }}</span>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 8px; }
    .rub { border: 1px solid var(--pz-line, #ececea); border-radius: 14px; background: #fff;
      transition: border-color .2s, opacity .2s, background .2s; overflow: hidden; }
    .rub:hover { border-color: var(--pz-line-2, #dcdcd6); }
    .rub.off { opacity: .6; background: var(--pz-surface-2, #f9fafb); }

    .rub-main { display: flex; align-items: center; gap: 14px; padding: 14px 16px; }
    .badge { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em;
      padding: 3px 8px; border-radius: 6px; flex-shrink: 0; }
    .badge.gain { background: var(--pz-pos-soft, #ecfdf5); color: var(--pz-pos-ink, #047857); }
    .badge.ret  { background: #fef2f2; color: #b91c1c; }
    .rub-id { flex: 1; min-width: 0; }
    .rub-label { font-size: 14px; font-weight: 600; color: var(--pz-ink, #0a0a0f); }
    .rub-sub { font-size: 11.5px; color: var(--pz-muted, #6b7280); margin-top: 1px; }
    .mono { font-family: 'JetBrains Mono', monospace; }

    .formula-toggle { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px;
      border: 1px solid var(--pz-line-2, #dcdcd6); background: #fff; border-radius: 999px;
      font: inherit; font-size: 12px; font-weight: 600; color: var(--pz-ink-3, #3a3d47);
      cursor: pointer; transition: all .15s; }
    .formula-toggle:hover { border-color: var(--pz-primary, #5b21b6); color: var(--pz-primary, #5b21b6); }
    .formula-toggle.open { background: var(--pz-primary-soft, #f3eefe); border-color: var(--pz-primary, #5b21b6);
      color: var(--pz-primary-ink, #4c1d95); }
    .formula-toggle .caret { transition: transform .25s cubic-bezier(.22,1,.36,1); }
    .formula-toggle.open .caret { transform: rotate(180deg); }

    /* Toggle premium : courbe cubic-bezier sur le knob */
    .tgl { position: relative; width: 46px; height: 26px; border: 0; border-radius: 999px;
      background: var(--pz-line-2, #dcdcd6); cursor: pointer; flex-shrink: 0; padding: 0;
      transition: background .25s cubic-bezier(.22,1,.36,1); }
    .tgl.on { background: var(--pz-primary, #5b21b6); }
    .knob { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%;
      background: #fff; box-shadow: 0 1px 3px rgba(10,10,15,.3);
      transition: transform .28s cubic-bezier(.34,1.56,.64,1); will-change: transform; }
    .tgl.on .knob { transform: translateX(20px); }

    /* Formule révélée */
    .formula { overflow: hidden; }
    .formula-inner { padding: 0 16px 16px 16px; }
    .f-expr { background: var(--pz-ink, #0a0a0f); color: #c4b5fd; font-size: 13px; font-weight: 500;
      padding: 12px 14px; border-radius: 10px; line-height: 1.5; }
    .f-vars { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .chip { font-size: 12px; color: var(--pz-ink-3, #3a3d47); background: var(--pz-surface-2, #f9fafb);
      border: 1px solid var(--pz-line, #ececea); padding: 4px 10px; border-radius: 8px; }
    .chip b { color: var(--pz-primary, #5b21b6); margin-right: 4px; }

    @media (prefers-reduced-motion: reduce) {
      .knob, .tgl, .caret { transition: none !important; }
    }
  `],
})
export default class RubriquesConfigComponent {
  protected readonly expanded = signal<number | null>(2);

  protected readonly rubriques = signal<Rubrique[]>([
    { id: 1, code: 'R-001', label: 'Salaire de base', cat: 'GAIN', scope: 'Tous les employés', active: true },
    { id: 2, code: 'R-014', label: 'Prime de rendement', cat: 'GAIN', scope: 'Cadres · Techniciens', active: true,
      formula: { expr: '(note / 20) × salaire_base × 0,15', vars: [
        { k: 'note', v: 'évaluation 0–20' }, { k: 'salaire_base', v: 'mensuel brut' }, { k: '0,15', v: 'coefficient max 15%' },
      ] } },
    { id: 3, code: 'R-021', label: 'Indemnité de transport', cat: 'GAIN', scope: 'Tous les employés', active: true,
      formula: { expr: 'forfait_zone × jours_présence', vars: [
        { k: 'forfait_zone', v: '80 TND (Grand Tunis)' }, { k: 'jours_présence', v: 'pointage du mois' },
      ] } },
    { id: 4, code: 'R-103', label: 'CNSS salarié', cat: 'RETENUE', scope: 'Tous les employés', active: true,
      formula: { expr: 'brut_imposable × 9,18 %', vars: [
        { k: '9,18 %', v: 'taux légal JORT n°3-2026' },
      ] } },
    { id: 5, code: 'R-118', label: 'Prime de transport exceptionnelle', cat: 'GAIN', scope: 'Commerciaux', active: false },
  ]);

  toggle(r: Rubrique): void {
    this.rubriques.update(list => list.map(x => x.id === r.id ? { ...x, active: !x.active } : x));
  }

  toggleFormula(id: number): void {
    this.expanded.update(cur => cur === id ? null : id);
  }
}
