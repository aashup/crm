import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { PurchaseComponent } from './purchase/purchase.component';
import { SaleDetailsComponent } from './sale/sale-details/sale-details.component';
import { PurchaseDetailsComponent } from './purchase/purchase-details/purchase-details.component';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatTableModule,
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
        path: 'purchase/:id',
        component:PurchaseDetailsComponent
      },
      {
        path: 'sale',
        loadChildren: () => import('./sale/sale.module').then((m) =>m.SaleModule),
      },
      {
        path: 'sale/:id',
        loadChildren: () => import('./sale/sale.module').then((m) =>m.SaleModule),
      },
    ])
  ]
})
export class AppsModule { }
