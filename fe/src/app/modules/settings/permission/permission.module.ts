import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionComponent } from './permission.component';
import { AddPermissionComponent } from './add-permission/add-permission.component';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [PermissionComponent, AddPermissionComponent],
  imports: [
    CommonModule,
    SharedMaterialModuleModule,
    RouterModule.forChild([
      { path: '', component: PermissionComponent },
      { path: 'add', component: AddPermissionComponent },
    ]),
  ],
})
export class PermissionModule {}
