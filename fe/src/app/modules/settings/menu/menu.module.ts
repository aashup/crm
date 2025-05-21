import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu.component';
import { AddMenuComponent } from './add-menu/add-menu.component';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';
import { RouterModule } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';

@NgModule({
  declarations: [MenuComponent, AddMenuComponent],
  imports: [
    CommonModule,
    SharedMaterialModuleModule,
    RouterModule.forChild([
      { path: '', component: MenuComponent },
      { path: 'add', component: AddMenuComponent },
    ]),
    NgxPermissionsModule.forChild()
  ],
})
export class MenuModule {}
