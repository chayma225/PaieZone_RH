import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./user-management-list'),
    title: 'Gestion des utilisateurs',
  },
  {
    path: 'new',
    loadComponent: () => import('./user-management-update'),
    title: 'Créer un utilisateur',
  },
  {
    path: ':login/edit',
    loadComponent: () => import('./user-management-update'),
    title: 'Modifier un utilisateur',
  },
];

export default routes;
