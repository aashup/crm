import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'roles',
    loadChildren: () => import('./roles/roles.module').then((m) => m.RolesModule),
  },
  {
    path: 'users',
    loadChildren: () => import('./users/users.module').then((m) => m.UsersModule),
  },
  {
    path: 'permissions',
    loadChildren: () => import('./permission/permission.module').then((m) => m.PermissionModule),
  },
  {
    path: 'roles/edit-permission/:id',
    loadChildren: () => import('./roles/roles.module').then((m) => m.RolesModule),
  },
  { path: '**', redirectTo: 'usermanagement/roles' },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes),],
  exports: [],
})
export class UserManagementModule {}
