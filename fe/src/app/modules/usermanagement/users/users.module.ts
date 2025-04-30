import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { SharedMaterialModuleModule } from "../../shared-material-module/shared-material-module.module";
import { NgxPermissionsModule } from "ngx-permissions";
import { NgModule } from "@angular/core";

import { UsersComponent } from "./users.component";
import { AddUsersComponent } from "./add-users/add-users.component";

const routes: Routes = [
  { path: "", component: UsersComponent},
  { path: "add", component: AddUsersComponent },
];

@NgModule({
  declarations: [ UsersComponent, AddUsersComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule
  ],
  exports: []
})
export class UsersModule { }
