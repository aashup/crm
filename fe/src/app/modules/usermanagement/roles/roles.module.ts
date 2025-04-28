import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { SharedMaterialModuleModule } from "../../shared-material-module/shared-material-module.module";
import { NgxPermissionsModule } from "ngx-permissions";
import { NgModule } from "@angular/core";
import { RolesComponent } from "./roles.component";
import { AddRolesComponent } from "./add-roles/add-roles.component";

const routes: Routes = [
  { path: "", component: RolesComponent},
  { path: "add", component: AddRolesComponent },
];

@NgModule({
  declarations: [ RolesComponent, AddRolesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule
  ],
  exports: []
})
export class RolesModule { }
