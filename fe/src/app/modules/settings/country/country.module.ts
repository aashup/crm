import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { CountryComponent } from './country.component';
import { AddCountryComponent } from './add-country/add-country.component';
import { RouterModule, Routes } from '@angular/router';
import { SafePipe } from '../../core/pipes/safe-pipe.pipe';

const routes: Routes = [
  { path: '', component: CountryComponent },
  { path: 'add', component: AddCountryComponent },
];
@NgModule({
  declarations: [CountryComponent, AddCountryComponent],
  imports: [
    CommonModule,
    SharedMaterialModuleModule,
    SharedModule,
    RouterModule.forChild(routes),
    SafePipe
  ],
})
export class CountryModule {}
