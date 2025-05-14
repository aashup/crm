import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SharedMaterialModuleModule } from '../../modules/shared-material-module/shared-material-module.module';
import { CustomersComponent } from './customers.component';
import { AddCustomersComponent } from './add-customers/add-customers.component';

const routes: Routes = [
  { path: "", component: CustomersComponent },
  { path: "add", component: AddCustomersComponent },
];

@NgModule({
  declarations: [ CustomersComponent, AddCustomersComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule
  ],
  exports: []
})
export class CustomersModule { }
