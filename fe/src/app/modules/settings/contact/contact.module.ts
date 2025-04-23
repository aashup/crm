import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './contact.component';
import { AddContactComponent } from './add-contact/add-contact.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';

const routes: Routes = [
  { path: '', component: ContactComponent },
  { path: 'add', component: AddContactComponent },
];

@NgModule({
  declarations: [ContactComponent, AddContactComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule,
  ],
  exports: [],
})
export class ContactModule {}
