import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.module').then((m) => m.SettingsModule),
        // data: { layout: 'light-sidebar' },
      },
      {
        path: 'usermanagement',
        loadChildren: () => import('../usermanagement/usermanagement.module').then((m) => m.UserManagementModule),
        // data: { layout: 'light-sidebar' },
      },
      {
        path: 'product',
        loadChildren: () => import('./product/product.module').then((m) => m.ProductModule),
        // data: { layout: 'light-sidebar' },
      },
    ])
  ]
})
export class AppsModule { }
