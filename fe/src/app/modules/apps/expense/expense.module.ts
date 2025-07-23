import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SharedMaterialModuleModule } from '../../shared-material-module/shared-material-module.module';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { ExpenseComponent } from './expense.component';
import { AddExpenseComponent } from './add-expense/add-expense.component';
@NgModule({
  declarations: [ExpenseComponent, AddExpenseComponent],
  imports: [
    CommonModule,
    MatTooltipModule,
    MatCardModule,
    MatListModule,
    MatTableModule,
    RouterModule.forChild([
      { path: '', component: ExpenseComponent },
      { path: 'add', component: AddExpenseComponent },
      
    ]),
    NgxPermissionsModule.forChild(),
    SharedMaterialModuleModule,
  ],
  exports: [MatTooltipModule],
})
export class ExpenseModule {}
