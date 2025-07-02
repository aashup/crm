import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import { UnitConversionComponent } from './unitconversion.component';
import { AddUnitConversionComponent } from './add-unit-conversion/add-unit-conversion.component';
import { SharedMaterialModuleModule } from 'src/app/modules/shared-material-module/shared-material-module.module';



@NgModule({
  declarations: [UnitConversionComponent, AddUnitConversionComponent],
  imports: [
    CommonModule,
    SharedMaterialModuleModule,
    RouterModule.forChild([{
      path: '',
      component: UnitConversionComponent
    }]),
    NgxPermissionsModule.forChild(),
  ]
})
export class UnitConversionModule { }
