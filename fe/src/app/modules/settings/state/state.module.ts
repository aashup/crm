import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddStateComponent } from './add-state/add-state.component';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';
import { StateComponent } from './state.component';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';


const routes: Routes = [
  { path: '', component: StateComponent },
  { path: 'add', component: AddStateComponent },
];

@NgModule({
  declarations: [
    StateComponent,
    AddStateComponent
  ],
  imports: [
    CommonModule,
    SharedMaterialModuleModule,
    RouterModule.forChild(routes),
    NgxPermissionsModule.forChild(),
  ]
})
export class StateModule { }
