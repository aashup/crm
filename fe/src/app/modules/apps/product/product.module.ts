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


import { CompleteComponent } from './complete/complete.component';
import { UnitConversionComponent } from './unit-conversion/unitconversion.component';
import { AddUnitConversionComponent } from './unit-conversion/add-unit-conversion/add-unit-conversion.component';
import { ProductInventoryComponent } from './product-inventory/product-inventory.component';
import { AddProductInventoryComponent } from './product-inventory/add-product-inventory/add-product-inventory.component';
import { ProductSellerComponent } from './product-seller/product-seller.component';
import { AddProductSellerComponent } from './product-seller/add-product-seller/add-product-seller.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
@NgModule({
  declarations: [
    ProductComponent,
    AddProductComponent,
    ProductUnitComponent,
    StepperComponent,
    AddProductUnitComponent,
    AddProductInventoryComponent,
    UnitConversionComponent,
    AddUnitConversionComponent,
    ProductInventoryComponent,
    ProductSellerComponent,
    AddProductSellerComponent,
    CompleteComponent,
    ProductDetailsComponent
  ],
  imports: [
    CommonModule,
    SharedMaterialModuleModule,
    RouterModule.forChild([
      { path: '', component: ProductComponent },
      { path: 'add', component: StepperComponent },
      { path: 'add/:id', component: StepperComponent },
      {path:':id',component:ProductDetailsComponent}
    ]),
    NgxPermissionsModule.forChild(),
    SharedModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
  ],
})
export class ProductModule {}
