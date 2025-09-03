import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SalesProductComponent } from './sales-graph/sales-product/sales-product.component';
import { SalesByChannelComponent } from './sales-graph/sales-by-channel/sales-by-channel.component';
import { SalesInventoryComponent } from './sales-graph/sales-inventory/sales-inventory.component';
import { SalesReceivableComponent } from './sales-graph/sales-receivable/sales-receivable.component';
import { MatIconModule } from '@angular/material/icon';
import { SalesByPaymentMethodComponent } from './sales-graph/sales-by-payment-method/sales-by-payment-method.component';
import { SalesByPartyComponent } from './sales-graph/sales-by-party/sales-by-party.component';
import { PurchaseProductComponent } from './purchase-graph/purchase-top-product/purchase-product.component';
import { PurchaseByPartyComponent } from './purchase-graph/purchase-by-party/purchase-by-party.component';
import { PurchaseByPaymentMethodComponent } from './purchase-graph/purchase-by-payment-method/purchase-by-payment-method.component';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    SalesProductComponent,
    SalesByPartyComponent,
    SalesByPaymentMethodComponent,
    SalesByChannelComponent,
    SalesInventoryComponent,
    SalesReceivableComponent,

    PurchaseProductComponent,
    PurchaseByPartyComponent,
    PurchaseByPaymentMethodComponent,

    MatIconModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    NgApexchartsModule,
    FormsModule,            
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule, 
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButton
    
  ],
})
export class DashboardModule {}
