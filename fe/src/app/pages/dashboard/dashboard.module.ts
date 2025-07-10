import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SalesProductComponent } from './sales-graph/sales-product/sales-product.component';
import { SalesActualTargetComponent } from './sales-graph/sales-actual-target/sales-actual-target.component';
import { SalesByRegionComponent } from './sales-graph/sales-by-region/sales-by-region.component';
import { SalesByChannelComponent } from './sales-graph/sales-by-channel/sales-by-channel.component';
import { SalesInventoryComponent } from './sales-graph/sales-inventory/sales-inventory.component';
import { SalesReceivableComponent } from './sales-graph/sales-receivable/sales-receivable.component';
import { PurchaseGraphComponent } from './purchase-graph/purchase-graph.component';
@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    SalesProductComponent,
    SalesActualTargetComponent,
    SalesByRegionComponent,
    SalesByChannelComponent,
    SalesInventoryComponent,
    SalesReceivableComponent,
    PurchaseGraphComponent,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    NgApexchartsModule
  ],
})
export class DashboardModule {}
