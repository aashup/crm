import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';
import { CustomersComponent } from './customers.component';
import { AddCustomersComponent } from './add-customers/add-customers.component';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [ CustomersComponent, AddCustomersComponent],
  imports: [
    CommonModule,
    MatTooltipModule,
    RouterModule.forChild([
         { path: '', component: CustomersComponent },
         { path: 'add', component: AddCustomersComponent },
       ]),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule
  ],
  exports: [ MatTooltipModule]
})
export class CustomersModule { }
