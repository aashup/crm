import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AddPartiesComponent } from './add-parties.component';
import { SharedMaterialModuleModule } from 'src/app/modules/shared-material-module/shared-material-module.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [AddPartiesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: AddPartiesComponent,
      },
    ]),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule,
    MatCardModule,
    MatListModule,
    MatTableModule,
    MatTooltipModule,
    MatAutocompleteModule,
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
  ],
})
export class AddPartiesModule {}
