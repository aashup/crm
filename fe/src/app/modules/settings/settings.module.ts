import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: 'city',
    loadChildren: () =>
      import('./city/city.module').then((m) => m.CityModule),
  },
  { path: '**', redirectTo: 'error/404' },
];

@NgModule({
  declarations: [],

  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class SettingsModule { }
