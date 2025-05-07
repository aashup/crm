import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { SharedMaterialModuleModule } from "../../shared-material-module/shared-material-module.module";
import { NgxPermissionsModule } from "ngx-permissions";
import { NgModule } from "@angular/core";
import { RolesComponent } from "./roles.component";
import { AddRolesComponent } from "./add-roles/add-roles.component";
import { SyncPermissionComponent } from "./sync-permission/sync-permission.component";

const routes: Routes = [
  { path: "", component: RolesComponent},
  {
    path: ':id/sync-permission',
    component: SyncPermissionComponent,
  },

];

@NgModule({
  declarations: [ RolesComponent, AddRolesComponent, SyncPermissionComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule
  ],
  exports: [SyncPermissionComponent]
})
export class RolesModule { }
