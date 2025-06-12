import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { CityModel } from '../city.model';
import { CityService } from '../city.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { StateModel } from '../../state/state.model';
import _ from 'lodash';

@Component({
    selector: 'app-add-city',
    templateUrl: './add-city.component.html',
    styleUrl: './add-city.component.scss',
    standalone: false
})
export class AddCityComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: CityModel;
  clone: any;
  isEdit: boolean = false;
  isLoading: boolean = false;
  readonly dialogRef = inject(MatDialogRef<AddCityComponent>);
  readonly data = inject<{
    model: CityModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  countries: CityModel[] = [];
  states: StateModel[] = [];

  constructor(
    private fb: FormBuilder,
    private service: CityService,
    private find: FindService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    // this.find
    //   .country()
    //   .pipe(take(1))
    //   .subscribe({
    //     next: (data: any) => (this.countries = data.data),
    //     error: (err) => this.commonService.handleError(err),
    //   });
    this.find
      .state()
      .pipe(take(1))
      .subscribe({
        next: (data: any) => (this.states = data.data),
        error: (err) => this.commonService.handleError(err),
      });
  }

  ngAfterViewInit(): void {
    this.isLoading= false;
    this.dialogRef.afterClosed().subscribe(() => {
      this.isLoading = false; 
    });
  
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.initForm(this.model);
  }
  initForm(model: CityModel) {
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
      country_id: [model.country_id],
      state_id: [model.state_id, [Validators.required]],
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
  
    this.service[this.isEdit ? 'update' : 'create'](this.form.value).subscribe({
      complete: () => {
        this.commonService.toastr.success(
          this.isEdit ? 'City has been updated.' : 'City has been created.'
        );
        this.dialogRef.close(true); 
        this.isLoading = false; 
      },
      error: (err) => {
        this.commonService.handleError(err);
        this.isLoading = false; 
      },
    });
  }
}
