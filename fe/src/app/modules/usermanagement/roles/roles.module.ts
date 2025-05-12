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
import { MatDialogModule } from "@angular/material/dialog";
import { AddPermissionDialogComponent } from "./edit-permission/add-permission-dialog/add-permission-dialog.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { ClipboardModule } from "ngx-clipboard";

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
  declarations: [ RolesComponent, AddRolesComponent, SyncPermissionComponent,EditPermissionComponent, AddPermissionDialogComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule,
    MatExpansionModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ClipboardModule,

  ],
  exports: [SyncPermissionComponent]
})
export class RolesModule { }
