import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';

import { MatTooltipModule } from '@angular/material/tooltip';
import { PurchaseComponent } from './purchase.component';
import { AddPurchaseComponent } from './add-purchase/add-purchase.component';
import { PurchaseDetailsComponent } from './purchase-details/purchase-details.component';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
@NgModule({
  declarations: [PurchaseComponent, AddPurchaseComponent, PurchaseDetailsComponent],
  imports: [
    CommonModule,
    MatTooltipModule,
    MatCardModule,
    MatListModule,
    MatTableModule,
    RouterModule.forChild([
      { path: '', component: PurchaseComponent },
      { path: 'add', component: AddPurchaseComponent },
      { path: 'direct-purchase', component: AddPurchaseComponent },
      { path: ':id', component: PurchaseDetailsComponent },
    ]),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule,
  ],
  exports: [MatTooltipModule],
})
export class PurchaseModule {}
