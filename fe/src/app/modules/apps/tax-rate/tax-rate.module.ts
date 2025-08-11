import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import { TaxRateComponent } from './tax-rate.component';
import { AddTaxRateComponent } from './add-tax-rate/add-tax-rate.component';


const routes: Routes = [
  { path: '', component: TaxRateComponent },
  { path: 'add', component: AddTaxRateComponent },
];

@NgModule({
  declarations: [
    TaxRateComponent,
    AddTaxRateComponent
  ],
  imports: [
    CommonModule,
    SharedMaterialModuleModule,
    RouterModule.forChild(routes),
    NgxPermissionsModule.forChild(),
  ]
})
export class TaxRateModule { }
