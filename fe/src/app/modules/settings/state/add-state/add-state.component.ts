import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { StateModel } from '../state.model';
import { StateService } from '../state.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/modules/core/common.service';
import _ from 'lodash';
import { SpinnerService } from 'src/app/services/spinner.service';
import { CountryModel } from '../../country/country.model';
import { CountryService } from '../../country/country.service';
import { catchError, of, tap } from 'rxjs';

@Component({
    selector: 'app-add-state',
    templateUrl: './add-state.component.html',
    styleUrl: './add-state.component.scss',
    standalone: false
})
export class AddStateComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: StateModel;
  clone: any;
  isEdit: boolean = false;
  isLoading: boolean = false;
  readonly dialogRef = inject(MatDialogRef<AddStateComponent>);
  readonly data = inject<{
    model: StateModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  countries: CountryModel[] = [];

  constructor(
    private fb: FormBuilder,
    private service: StateService,
    private commonService: CommonService,
    private spinnerService:SpinnerService,
    private countryService:CountryService
  ) {}

  ngOnInit(): void {
    this.getAllCountry()
  }

  getAllCountry(): void {
    this.countryService.find({ pageSize: 1000 }).pipe(
      tap((res: any) => {
        if (res?.data) {
          this.countries = res.data;
        }
      }),
      catchError(error => {
        console.error('Error fetching countries:', error);
        return of([]); 
      })
    ).subscribe();
  }
  ngAfterViewInit(): void {
    this.isLoading= false;
    this.spinnerService.hide()
    this.dialogRef.afterClosed().subscribe(() => {
      this.isLoading = false; 
      this.spinnerService.hide()
    });
  
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
    this.clone = this.form.value;
  }

  submit() {
    this.commonService.markFormGroupTouched(this.form);
  
    if (!this.form.valid) {
      this.commonService.toastr.error('Please fix all errors.');
      return;
    }
  
    if (_.isEqual(this.form.value, this.clone)) {
      this.commonService.toastr.error('Nothing changed.');
      return;
    }
  
    this.isLoading = true; 
    this.spinnerService.show()
  
    this.service[this.isEdit ? 'update' : 'create'](this.form.value).subscribe({
      complete: () => {
        this.commonService.toastr.success(
          this.isEdit ? 'State has been updated.' : 'State has been created.'
        );
        this.dialogRef.close(true); 
        this.isLoading = false; 
        this.spinnerService.hide()
      },
      error: (err) => {
        this.commonService.handleError(err);
        this.isLoading = false; 
        this.spinnerService.hide()
      },
    });
  }
  
}
