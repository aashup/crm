import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CityComponent } from './city.component';
import { RouterModule, Routes } from '@angular/router';
import { AddCityComponent } from './add-city/add-city.component';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

const routes: Routes = [{ path: "", component: CityComponent }];

@NgModule({
  declarations: [ CityComponent, AddCityComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    NgxPermissionsModule.forChild(),
  ]
})
export class CityModule { }
