import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'city',
    loadChildren: () => import('./city/city.module').then((m) => m.CityModule),
  },
  {
    path: 'state',
    loadChildren: () => import('./state/state.module').then((m) => m.StateModule),
  },
  {
    path: 'country',
    loadChildren: () => import('./country/country.module').then((m) => m.CountryModule),
  },
  {
    path: 'permission',
    loadChildren: () => import('./permission/permission.module').then((m) => m.PermissionModule),
  },
  {
    path: 'menu',
    loadChildren: () => import('./menu/menu.module').then((m) => m.MenuModule),
  },
  { path: '**', redirectTo: 'setting/city' },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsModule {}
