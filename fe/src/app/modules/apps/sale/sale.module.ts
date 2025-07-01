import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';

import { MatTooltipModule } from '@angular/material/tooltip';
import { SaleComponent } from './sale.component';
import { AddSaleComponent } from './add-sale/add-sale.component';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { SaleDetailsComponent } from './sale-details/sale-details.component';

@NgModule({
  declarations: [SaleComponent, AddSaleComponent,SaleDetailsComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatTableModule,
    MatTooltipModule,
    RouterModule.forChild([
      { path: '', component: SaleComponent },
      { path: 'add', component: AddSaleComponent },
      { path: ':id', component: SaleDetailsComponent },
    ]),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule,
  ],
  exports: [MatTooltipModule],
})
export class SaleModule {}
