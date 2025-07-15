import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectSaleComponent } from './direct-sale.component';
import { RouterModule } from '@angular/router';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';
import { NgxPermissionsModule } from 'ngx-permissions';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PrintComponent } from '../print/print.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
  declarations: [DirectSaleComponent, PrintComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DirectSaleComponent,
      },
      {
        path: 'print/:id',
        component: PrintComponent,
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
export class DirectSaleModule {}
