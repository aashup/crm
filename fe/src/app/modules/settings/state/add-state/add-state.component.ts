import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { StateModel } from '../state.model';
import { StateService } from '../state.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { take } from 'rxjs';
import { MyErrorStateMatcher } from '../state.component';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'app-add-state',
  templateUrl: './add-state.component.html',
  styleUrl: './add-state.component.scss'
})
export class AddStateComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: StateModel;
  isEdit: boolean = false;
  readonly dialogRef = inject(MatDialogRef<AddStateComponent>);
  readonly data = inject<{
    model: StateModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  countries: StateModel[] = [];
matcher: ErrorStateMatcher = new MyErrorStateMatcher();;

  constructor(
    private fb: FormBuilder,
    private service: StateService,
    private find: FindService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.find.country().pipe(take(1)).subscribe({
      next: (data:any) => this.countries = data.data,
      error : err => this.commonService.handleError(err),
    });
  }

  ngAfterViewInit(): void {
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.initForm(this.model);
  }

  initForm(model: StateModel) {
    this.form = this.fb.group({
      id: [model.id, []],
      name: [
        model.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200),
        ],
      ],
      status: [model.status, [Validators.required]],
      country_id: [model.country_id, [Validators.required]],
    });
  }

  submit() {
    console.log(this.form)
    this.commonService.markFormGroupTouched(this.form);
    if (!this.form.valid) {
      this.commonService.toastr.error('Please fix all errors.');
      return;
    }
    if (this.form.value.name == this.model.name) {
      this.commonService.toastr.error('Nothing changed.');
      return;
    }
    this.service[this.isEdit ? 'update' : 'create'](this.form.value).subscribe({
      complete: () => {
        this.commonService.toastr.success(this.isEdit ? 'State has been updated.' : 'State has been created.');
        this.dialogRef.close(true);
      },
      error: (err) => this.commonService.handleError(err),
    });
  }
}
