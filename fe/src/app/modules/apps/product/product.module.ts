import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';
import { RouterModule } from '@angular/router';
import path from 'path';
import { ProductComponent } from './product.component';

@NgModule({
  declarations: [ProductComponent],
  imports: [
    CommonModule,
    SharedMaterialModuleModule,
    RouterModule.forChild([
      { path: '', component: ProductComponent },
      { path: 'add', component: ProductComponent },
    ]),
  ],
})
export class ProductModule {}
