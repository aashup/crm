import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';

import { MatTooltipModule } from '@angular/material/tooltip';
import { InventoryComponent } from './inventory.component';
import { AddInventoryComponent } from './add-inventory/add-inventory.component';
import { InventoryDetailsComponent } from './inventory-details/inventory-details.component';



@NgModule({
  declarations: [ InventoryComponent, AddInventoryComponent,InventoryDetailsComponent],
  imports: [
    CommonModule,
    MatTooltipModule,
    RouterModule.forChild([
         { path: '', component: InventoryComponent },
         { path: 'add', component: AddInventoryComponent },
         {path:':id', component:InventoryDetailsComponent}
       ]),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule
  ],
  exports: [ MatTooltipModule]
})
export class InventoryModule { }
