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
      },
      {
        path: 'usermanagement',
        loadChildren: () => import('../usermanagement/usermanagement.module').then((m) => m.UserManagementModule),
      },
      {
        path: 'product',
        loadChildren: () => import('./product/product.module').then((m) => m.ProductModule),
      },
      {
        path: 'customer',
        loadChildren: () => import('./customer/customers.module').then((m) => m.CustomersModule),
      },
      {
        path: 'supplier',
        loadChildren: () => import('./vendor/vendor.module').then((m) => m.VendorModule),
      },
      {
        path: 'inventory',
        loadChildren: () => import('./inventory/inventory.module').then((m) =>m.InventoryModule),
      },
      {
        path: 'purchase',
        loadChildren: () => import('./purchase/purchase.module').then((m) =>m.PurchaseModule),
      },
      {
        path: 'sale',
        loadChildren: () => import('./sale/sale.module').then((m) =>m.SaleModule),
      },
    ])
  ]
})
export class AppsModule { }
