import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';
import { RouterModule } from '@angular/router';
import { AddressComponent } from './address.component';
import { AddAddressComponent } from './add-address/add-address.component';



@NgModule({
  declarations: [AddressComponent, AddAddressComponent],
  imports: [
    CommonModule,
    SharedMaterialModuleModule,
    RouterModule.forChild([{
      path: '',
      component: AddressComponent
    }])
  ]
})
export class AddressModule { }
