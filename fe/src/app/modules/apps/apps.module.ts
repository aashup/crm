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
        path: 'supplier',
        loadChildren: () => import('./vendor/vendor.module').then((m) => m.VendorModule),
      },
      {
        path: 'parties',
        loadChildren: () => import('../apps/parties/parties.module').then((m) => m.PartiesModule),
      },
      {
        path: 'party',
        loadChildren: () => import('../apps/parties/add-parties/add-parties.module').then((m) => m.AddPartiesModule),
      },
      {
        path: 'tax-rates',
        loadChildren: () => import('./tax-rate/tax-rate.module').then((m) => m.TaxRateModule),
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
        path: 'direct-sale',
        loadChildren: () => import('./direct-sale/direct-sale.module').then((m) =>m.DirectSaleModule),
      },
      {
        path: 'sale/:id',
        loadChildren: () => import('./sale/sale.module').then((m) =>m.SaleModule),
      },
      {
        path: 'expense',
        loadChildren: () => import('./expense/expense.module').then((m) =>m.ExpenseModule),
      },
    ])
  ]
})
export class AppsModule { }
