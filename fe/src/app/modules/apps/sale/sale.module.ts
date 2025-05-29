import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';

import { MatTooltipModule } from '@angular/material/tooltip';
import { SaleComponent } from './sale.component';
import { AddSaleComponent } from './add-sale/add-sale.component';

@NgModule({
  declarations: [ SaleComponent, AddSaleComponent],
  imports: [
    CommonModule,
    MatTooltipModule,
    RouterModule.forChild([
         { path: '', component: SaleComponent },
         { path: 'add', component: AddSaleComponent },
       ]),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule
  ],
  exports: [ MatTooltipModule]
})
export class SaleModule { }
