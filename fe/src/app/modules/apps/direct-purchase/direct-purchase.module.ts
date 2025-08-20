import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DirectPurchaseComponent } from './direct-purchase.component';

@NgModule({
  declarations: [DirectPurchaseComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DirectPurchaseComponent,
      },
     
    ]),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule,
    MatCardModule,
    MatListModule,
    MatTableModule,
    MatTooltipModule,
    MatAutocompleteModule
  ],
})
export class DirectPurchaseModule {}
