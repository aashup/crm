import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { SharedMaterialModuleModule } from "../../shared-material-module/shared-material-module.module";
import { NgxPermissionsModule } from "ngx-permissions";
import { NgModule } from "@angular/core";
import { RolesComponent } from "./roles.component";
import { AddRolesComponent } from "./add-roles/add-roles.component";
import { SyncPermissionComponent } from "./sync-permission/sync-permission.component";
import { EditPermissionComponent } from "./edit-permission/edit-permission.component";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from '@angular/material/expansion';

const routes: Routes = [
  { path: "", component: RolesComponent},
  {
    path: ':id/sync-permission',
    component: SyncPermissionComponent,
  },
  {
    path: 'edit-permission/:id',
    component: EditPermissionComponent,
  },
];

@NgModule({
  declarations: [ RolesComponent, AddRolesComponent, SyncPermissionComponent,EditPermissionComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule,
    MatExpansionModule,
    MatButtonModule,
  ],
  exports: [SyncPermissionComponent]
})
export class RolesModule { }
