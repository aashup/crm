import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { CommonService } from 'src/app/modules/core/common.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { ExpenseModel } from '../expense.model';
import { ExpenseService } from '../expense.service';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.scss'],
})
export class AddExpenseComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  isEdit = false;
  isLoading = false;

  private readonly dialogRef = inject(MatDialogRef<AddExpenseComponent>);
  private readonly data = inject<{ model: ExpenseModel; isEdit: boolean }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private expenseService: ExpenseService,
    private spinnerService: SpinnerService
  ) {}

  ngOnInit(): void {
    this.isEdit = this.data.isEdit;

    this.form = this.fb.group({
      id: [null],
      type: [null, Validators.required],
      amount: [null, Validators.required],
      notes: [''],
    });

    if (this.isEdit) {
      this.form.patchValue(this.data.model);
    }
  }

  ngAfterViewInit(): void {
    this.spinnerService.hide();

    this.dialogRef.afterClosed().subscribe(() => {
      this.spinnerService.hide();
    });
  }

  onSubmit(): void {
    this.commonService.markFormGroupTouched(this.form);

    if (this.form.invalid) {
      this.commonService.toastr.error('Please fix all errors.');
      return;
    }

    const payload = this.form.value;
    this.isLoading = true;
    this.spinnerService.show();

    const request$ = this.isEdit
      ? this.expenseService.update({ ...payload, id: this.data.model.id })
      : this.expenseService.create(payload);

    request$.subscribe({
      next: () => {
        const msg = this.isEdit ? 'Expense Updated' : 'Expense Created';
        this.commonService.toastr.success(msg);
        this.dialogRef.close(payload);
      },
      error: (err) => {
        this.commonService.handleError(err);
        this.isLoading = false;
        this.spinnerService.hide();
      },
      complete: () => {
        this.isLoading = false;
        this.spinnerService.hide();
      },
    });
  }
}
