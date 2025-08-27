import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PartiesComponent } from './parties.component';
import { AddPartiesComponent } from './add-parties/add-parties.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { PartyDetailsComponent } from './party-details/party-details.component';

@NgModule({
  declarations: [PartiesComponent,PartyDetailsComponent],
  imports: [
    CommonModule,
    MatTooltipModule,
    MatTabsModule,
    MatNativeDateModule, 
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    MatButtonModule,
    RouterModule.forChild([
      { path: '', component: PartiesComponent },
      { path: ':id', component: PartyDetailsComponent },
      
    ]),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule,
  ],
  exports: [MatTooltipModule],
 
})
export class PartiesModule {}
