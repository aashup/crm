import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitComponent } from './unit.component';
import { AddUnitComponent } from './add-unit/add-unit.component';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';



@NgModule({
  declarations: [UnitComponent, AddUnitComponent],
  imports: [
    CommonModule,
    SharedMaterialModuleModule
  ]
})
export class UnitModule { }
