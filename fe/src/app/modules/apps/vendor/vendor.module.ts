import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';

import { MatTooltipModule } from '@angular/material/tooltip';
import { VendorComponent } from './vendor.component';
import { AddVendorComponent } from './add-vendor/add-vendor.component';


@NgModule({
  declarations: [ VendorComponent, AddVendorComponent],
  imports: [
    CommonModule,
    MatTooltipModule,
    RouterModule.forChild([
         { path: '', component: VendorComponent },
         { path: 'add', component: AddVendorComponent },
       ]),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule
  ],
  exports: [ MatTooltipModule]
})
export class VendorModule { }
