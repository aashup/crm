import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';

import { MatTooltipModule } from '@angular/material/tooltip';
import { AddInventoryComponent } from './add-product-inventory/add-product-inventory.component';
import { SharedMaterialModuleModule } from 'src/app/modules/shared-material-module/shared-material-module.module';
import { ProductInventoryComponent } from './product-inventory.component';



@NgModule({
  declarations: [ ProductInventoryComponent, AddInventoryComponent],
  imports: [
    CommonModule,
    MatTooltipModule,
    RouterModule.forChild([
         { path: '', component: ProductInventoryComponent },
         { path: 'add', component: AddInventoryComponent },
       ]),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule
  ],
  exports: [ MatTooltipModule]
})
export class ProductInventoryModule { }
