import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';
import { RouterModule } from '@angular/router';
import { ProductComponent } from './product.component';
import { AddProductComponent } from './add-product/add-product.component';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { ProductUnitComponent } from './product-unit/product-unit.component';
import { StepperComponent } from './stepper/stepper.component';
import { AddProductUnitComponent } from './add-product-unit/add-product-unit.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { AddInventoryComponent } from '../inventory/add-inventory/add-inventory.component';
import { AddProductInventryComponent } from './add-product-inventry /add-product-inventry.component';
import { ProductInventryComponent } from './product-inventry/product-inventry.component';
import { ProductSellerComponent } from './product-seller/product-seller.component';
import { AddProductSellerComponent } from './add-product-seller/add-product-seller.component';
import { CompleteComponent } from './complete/complete.component';

@NgModule({
  declarations: [
    ProductComponent,
    AddProductComponent,
    ProductUnitComponent,
    StepperComponent,
    AddProductUnitComponent,
    AddProductInventryComponent,
    ProductInventryComponent,
    ProductSellerComponent,
    AddProductSellerComponent,
    CompleteComponent
  ],
  imports: [
    CommonModule,
    SharedMaterialModuleModule,
    RouterModule.forChild([
      { path: '', component: ProductComponent },
      { path: 'add', component: StepperComponent },
      { path: 'add/:id', component: StepperComponent },
    ]),
    NgxPermissionsModule.forChild(),
    SharedModule,
  ],
})
export class ProductModule {}
