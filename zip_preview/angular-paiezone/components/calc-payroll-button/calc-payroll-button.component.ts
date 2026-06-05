import {
  Component, ChangeDetectionStrategy, signal, input, output, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import IconComponent from '../../core/icon/icon.component';

// ───────────────────────────────────────────────────────────────────────────
// pz-calc-payroll-button
// Le bouton "Calculer la paie" se transforme en barre de progression intégrée
// avec libellés d'étapes qui défilent (Vérification profils → Rubriques →
// IRPP → Génération bulletins). Feedback "le backend Spring Boot travaille".
//
//   <pz-calc-payroll-button [count]="42" (done)="onPayrollDone()" />
//
// En production : remplace le timer `runStep` par ton flux réel (SSE / WS
// depuis Spring Boot) en poussant l'index d'étape + le compteur traité.
// ───────────────────────────────────────────────────────────────────────────

const STEPS = [
  'Vérification des profils…',
  'Application des rubriques…',
  'Calcul des cotisations CNSS…',
  'Calcul de l\u2019IRPP…',
  'Génération des bulletins…',
];

@Component({
  selector: 'pz-calc-payroll-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('swap', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(6px)' }),
        animate('200ms cubic-bezier(.22,1,.36,1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('140ms ease-in', style({ opacity: 0, transform: 'translateY(-6px)' })),
      ]),
    ]),
    trigger('stepText', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('220ms cubic-bezier(.22,1,.36,1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        style({ position: 'absolute' }),
        animate('180ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' })),
      ]),
    ]),
  ],
  template: `
    @switch (state()) {
      @case ('idle') {
        <button class="cbtn" [@swap] (click)="start()">
          <pz-icon name="Sparkles" [size]="16" [strokeWidth]="1.6" />
          Calculer la paie
        </button>
      }
      @case ('running') {
        <div class="cbar" [@swap]>
          <div class="cbar-fill" [style.width.%]="progress()"></div>
          <div class="cbar-inner">
            <span class="spin"></span>
            <div class="step-wrap">
              @for (s of [currentStep()]; track s) {
                <span class="step" [@stepText]>{{ STEPS[s] }}</span>
              }
            </div>
            <span class="count mono">{{ processed() }}/{{ count() }}</span>
          </div>
        </div>
      }
      @case ('done') {
        <button class="cbtn ok" [@swap] (click)="reset()">
          <span class="ok-ring"><pz-icon name="Check" [size]="15" [strokeWidth]="2.2" /></span>
          {{ count() }} bulletins générés · {{ elapsed() }}s
        </button>
      }
    }
  `,
  styles: [`
    :host { display: inline-block; min-width: 280px; }
    .cbtn { width: 100%; height: 44px; padding: 0 18px; border: 1px solid var(--pz-ink, #0a0a0f);
      background: var(--pz-ink, #0a0a0f); color: #fff; border-radius: 999px;
      font: inherit; font-weight: 600; font-size: 14px; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      transition: background .15s, transform .12s; }
    .cbtn:hover { background: var(--pz-primary, #5b21b6); border-color: var(--pz-primary, #5b21b6); }
    .cbtn:active { transform: scale(.98); }
    .cbtn.ok { background: var(--pz-pos, #10b981); border-color: var(--pz-pos, #10b981); cursor: default; }
    .ok-ring { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%;
      background: rgba(255,255,255,.22); }

    /* Barre de progression intégrée */
    .cbar { position: relative; width: 100%; height: 44px; border-radius: 999px; overflow: hidden;
      background: var(--pz-surface-3, #f3f4f6); border: 1px solid var(--pz-line-2, #dcdcd6); }
    .cbar-fill { position: absolute; inset: 0 auto 0 0; height: 100%;
      background: linear-gradient(90deg, var(--pz-primary, #5b21b6), #7c3aed);
      width: 0%; transition: width .4s cubic-bezier(.22,1,.36,1); will-change: width; }
    .cbar-inner { position: relative; height: 100%; display: flex; align-items: center; gap: 10px;
      padding: 0 16px; color: #fff; mix-blend-mode: normal; }
    .step-wrap { position: relative; flex: 1; height: 20px; overflow: hidden; }
    .step { position: absolute; left: 0; top: 0; font-size: 13px; font-weight: 600; white-space: nowrap;
      text-shadow: 0 1px 2px rgba(0,0,0,.25); }
    .count { font-size: 12.5px; font-weight: 700; opacity: .9; }
    .spin { width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0;
      border: 2px solid rgba(255,255,255,.35); border-top-color: #fff;
      animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .mono { font-family: 'JetBrains Mono', monospace; }
    @media (prefers-reduced-motion: reduce) { .spin { animation-duration: 1.4s; } .cbar-fill { transition: none; } }
  `],
})
export default class CalcPayrollButtonComponent {
  readonly count = input<number>(42);
  readonly done = output<void>();

  protected readonly STEPS = STEPS;
  protected readonly state = signal<'idle' | 'running' | 'done'>('idle');
  protected readonly processed = signal(0);
  protected readonly currentStep = signal(0);
  protected readonly elapsed = signal(0);
  protected readonly progress = computed(() =>
    this.count() ? Math.round((this.processed() / this.count()) * 100) : 0);

  private timer: any;
  private t0 = 0;

  start(): void {
    this.state.set('running');
    this.processed.set(0);
    this.currentStep.set(0);
    this.t0 = performance.now();

    const total = this.count();
    // setInterval (pas rAF) → continue même si l'onglet passe en arrière-plan.
    this.timer = setInterval(() => {
      const next = Math.min(total, this.processed() + Math.max(1, Math.round(total / 28)));
      this.processed.set(next);
      // Étape pilotée par la progression (en prod : valeur poussée par le backend)
      const stepIdx = Math.min(STEPS.length - 1, Math.floor((next / total) * STEPS.length));
      if (stepIdx !== this.currentStep()) this.currentStep.set(stepIdx);
      if (next >= total) {
        clearInterval(this.timer);
        this.elapsed.set(+((performance.now() - this.t0) / 1000).toFixed(1));
        this.state.set('done');
        this.done.emit();
      }
    }, 90);
  }

  reset(): void { this.state.set('idle'); }
}
