import {
  Component,
  inject,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SpinnerService } from 'src/app/services/spinner.service';
import { CommonService } from 'src/app/modules/core/common.service';
import { PartiesService } from '../parties.service';
import { PartiesModel } from '../parties.model';
import _ from 'lodash';
import { StateService } from 'src/app/modules/settings/state/state.service';

@Component({
  selector: 'app-add-parties',
  templateUrl: './add-parties.component.html',
  styleUrls: ['./add-parties.component.scss'],
})
export class AddPartiesComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  model: PartiesModel;
  isEdit = false;
  isLoading = false;
  enableShipping = false;
  clone: any;

  states:any= []
  readonly dialogRef = inject(MatDialogRef<AddPartiesComponent>);
  readonly data = inject<{
    model: PartiesModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private service: PartiesService,
    private commonService: CommonService,
    private spinnerService: SpinnerService,
    private stateService:StateService
  ) {}

  ngOnInit(): void {
    this.getAllStates()
    this.model = this.data.model || {};
    this.isEdit = this.data.isEdit;
    this.initForm(this.model);
  }
  getAllStates(): void {
    this.spinnerService.show(); 
    this.stateService.find({ pageSize: 100, sortBy: 'name', sortOrder: 'asc' }).subscribe({
      next: (res: any) => {
        this.states = res?.data || [];
        console.log(res);
        
      },
      error: (err) => {
        this.commonService.toastr.error('Failed to load states. Please try again.', 'Error');
        console.error('Error loading states:', err);
      },
      complete: () => {
        this.spinnerService.hide();
      }
    });
  }
  
  ngAfterViewInit(): void {
    this.spinnerService.hide();
  }

  formatToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // month is 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  initForm(model: PartiesModel) {
    this.form = this.fb.group({
      id: [model?.id || null],
      name: [model?.name || '', [Validators.required, Validators.maxLength(200)]],
      gstin: [model?.gstin || ''],
      mobile: [model?.mobile || ''],
      opening_balance: [model?.opening_balance || 0],
      opening_balance_date: [model?.opening_balance_date || new Date()],
      credit_limit: [model?.credit_limit ?? true],
      credit_limit_amount: [model?.credit_limit_amount || null],
      billing_address: [model?.billing_address || ''],
      state_id: [model?.state_id || ''],
      gst_type:[model?.gst_type||''],
      email: [model?.email || '', [Validators.email]],
    });
  
    this.clone = this.form.value;
  }
  
  save(resetAfter: boolean = false) {
    this.commonService.markFormGroupTouched(this.form);

    if (this.form.invalid) {
      this.commonService.toastr.error('Please fix all errors.');
      return;
    }

    if (_.isEqual(this.form.value, this.clone)) {
      this.commonService.toastr.error('Nothing changed.');
      return;
    }

    this.isLoading = true;
    this.spinnerService.show();
    console.log(this.form.value);
    let date=this.formatToYYYYMMDD(this.form.value.opening_balance_date)
    console.log(date);
    let payLoad={
      ...this.form.value,
      opening_balance_date:date
    }
    const save$ = this.service[this.isEdit ? 'update' : 'create'](payLoad);

    save$.subscribe({
      next: () => {
        this.commonService.toastr.success(this.isEdit ? 'Party updated.' : 'Party created.');
        this.dialogRef.close(true);

        if (resetAfter) {
          this.form.reset();
          this.enableShipping = false;
        }
      },
      error: (err) => {
        this.commonService.handleError(err);
      },
      complete: () => {
        this.isLoading = false;
        this.spinnerService.hide();
      },
    });
  }
}
