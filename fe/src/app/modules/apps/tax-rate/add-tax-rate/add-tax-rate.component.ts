import { AfterViewInit, Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/modules/core/common.service';
import _ from 'lodash';
import { SpinnerService } from 'src/app/services/spinner.service';
import { TaxRateModel } from '../tax-rate.model';
import { TaxRateService } from '../tax-rate.service';
import { finalize } from 'rxjs/operators'; // Import finalize operator

@Component({
    selector: 'app-add-tax-rate',
    templateUrl: './add-tax-rate.component.html',
    styleUrls: ['./add-tax-rate.component.scss'],
    standalone: false
})
export class AddTaxRateComponent implements AfterViewInit {
  form: FormGroup;
  model: TaxRateModel;
  clone: any;
  isEdit: boolean = false;
  isLoading: boolean = false;
   //1. gst, 2. igst, 3. cgst, 4. sgst, 5. vat, 6. service tax, 7. other
  taxtypeOptions = [
    { value: 1, label: 'GST' },
    { value: 2, label: 'IGST' },
    { value: 3, label: 'CGST' },
    { value: 4, label: 'SGST' },
    { value: 5, label: 'VAT' },
    { value: 6, label: 'Service Tax' },
    { value: 7, label: 'Other' }
  ]
  readonly dialogRef = inject(MatDialogRef<AddTaxRateComponent>);
  readonly data = inject<{
    model: TaxRateModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private service: TaxRateService,
    private commonService: CommonService,
    private spinnerService: SpinnerService,
  ) {}

  ngAfterViewInit(): void {
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.initForm(this.model);
  }

  initForm(model: TaxRateModel) {
    this.form = this.fb.group({
      id: [model.id],
      rate: [model.rate, [Validators.required, Validators.min(0), Validators.max(100)]],
      type: [model.type, [Validators.required]],
      is_active: [model.is_active, [Validators.required]],
    });
    this.clone = this.form.value;
  }

  submit() {
    this.commonService.markFormGroupTouched(this.form);

    if (!this.form.valid) {
      this.commonService.toastr.error('Please fix all errors.');
      return;
    }

    // Check if any changes were made before submitting
    if (_.isEqual(this.form.value, this.clone)) {
      this.commonService.toastr.error('Nothing changed.');
      return;
    }

    this.isLoading = true;
    this.spinnerService.show();

    this.service[this.isEdit ? 'update' : 'create'](this.form.value)
      .pipe(
        // Use finalize to handle cleanup logic for both success and error cases
        finalize(() => {
          this.isLoading = false;
          this.spinnerService.hide();
        })
      )
      .subscribe({
        complete: () => {
          this.commonService.toastr.success(
            this.isEdit ? 'Tax Rate has been updated.' : 'Tax Rate has been created.'
          );
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.commonService.handleError(err);
        },
      });
  }
}