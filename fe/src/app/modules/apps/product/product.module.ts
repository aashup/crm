import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';
import { RouterModule } from '@angular/router';
import { ProductComponent } from './product.component';
import { AddProductComponent } from './add-product/add-product.component';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { ProductUnitComponent } from './product-unit/product-unit.component';
import { StepperComponent } from './stepper/stepper.component';

@NgModule({
  declarations: [ProductComponent, AddProductComponent, ProductUnitComponent, StepperComponent],
  imports: [
    CommonModule,
    SharedMaterialModuleModule,
    RouterModule.forChild([
      { path: '', component: ProductComponent },
      { path: 'add', component: StepperComponent },
      { path: 'add/:id', component: StepperComponent },
    ]),
    SharedModule
  ],
})
export class ProductModule {}
