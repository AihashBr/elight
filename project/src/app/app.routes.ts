import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Elight · Local AI engine',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  { path: '**', redirectTo: '' },
];
