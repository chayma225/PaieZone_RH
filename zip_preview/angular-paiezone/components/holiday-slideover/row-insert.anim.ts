// Trigger réutilisable pour l'insertion d'une ligne dans une liste/tableau,
// avec micro-flash vert qui s'estompe. À importer dans le composant de la LISTE
// des jours fériés et placer sur chaque <tr @rowInsert> rendu par @for.
//
//   import { rowInsert } from '../components/holiday-slideover/row-insert.anim';
//   @Component({ ..., animations: [rowInsert] })
//
//   <tr *ngFor="..." @rowInsert> ... </tr>   (ou @for + [@rowInsert])
//
// La couleur de flash passe par la variable CSS --pz-pos-soft.

import { trigger, transition, style, animate, keyframes } from '@angular/animations';

export const rowInsert = trigger('rowInsert', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-6px)' }),
    // 1) la ligne entre (translate + fade), 2) flash vert qui s'estompe.
    animate('520ms cubic-bezier(.22,1,.36,1)', keyframes([
      style({ opacity: 0, transform: 'translateY(-6px)', backgroundColor: 'rgba(16,185,129,.16)', offset: 0 }),
      style({ opacity: 1, transform: 'translateY(0)',    backgroundColor: 'rgba(16,185,129,.16)', offset: 0.35 }),
      style({ backgroundColor: 'rgba(16,185,129,0)', offset: 1 }),
    ])),
  ]),
  transition(':leave', [
    animate('220ms cubic-bezier(.55,0,1,.45)',
      style({ opacity: 0, transform: 'translateX(12px)' })),
  ]),
]);
