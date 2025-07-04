import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedMaterialModuleModule } from 'src/app/modules/shared-material-module/shared-material-module.module';
import { ProductSellerComponent } from './product-seller.component';
import { AddProductSellerComponent } from './add-product-seller/add-product-seller.component';


@NgModule({
  declarations: [ ProductSellerComponent, AddProductSellerComponent],
  imports: [
    CommonModule,
    MatTooltipModule,
    RouterModule.forChild([
         { path: '', component: ProductSellerComponent },
         { path: 'add', component: AddProductSellerComponent },
       ]),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule
  ],
  exports: [ MatTooltipModule]
})
export class ProductSellerModule { }
