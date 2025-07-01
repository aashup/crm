import { AfterViewInit, Component, inject, OnInit } from '@angular/core';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { UnitConversionModel } from '../unitconversion.model';
import { UnitConversionService } from '../unitconversion.service';
import { ProductService } from 'src/app/modules/apps/product/product.service';
import { UnitService } from '../../unit/unit.service';

@Component({
    selector: 'app-add-unit-conversion',
    templateUrl: './add-unit-conversion.component.html',
    styleUrl: './add-unit-conversion.component.scss',
    standalone: false
})
export class AddUnitConversionComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: UnitConversionModel;
  clone: any;
  isEdit: boolean = false;
  units:any[]
  products:any[]
  isLoading: boolean = false;
  readonly dialogRef = inject(MatDialogRef<AddUnitConversionComponent>);
  readonly data = inject<{
    model: UnitConversionModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private service: UnitConversionService,
    private find: FindService,
    private commonService: CommonService,
    private spinnerService:SpinnerService,
    private productService:ProductService,
    private unitService:UnitService
  ) {}

  ngOnInit(): void {
    this.getAllProducts()
    this.getAllUnit()
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.initForm(this.model);
  }

  ngAfterViewInit(): void {
    this.isLoading = false; 
    this.spinnerService.hide()
  }

  initForm(model: UnitConversionModel) {
    this.form = this.fb.group({
      id: [model.id, []],
      product_id: [model.product_id, [Validators.required]],
      from_unit_id: [model.from_unit_id, [Validators.required]],
      to_unit_id: [model.to_unit_id, [Validators.required]],
      conversion_factor: [model.conversion_factor, [Validators.required, Validators.min(0)]],
      description: [model.description, [Validators.required]],
      status: [model.status, [Validators.required]],
    });
    this.clone = this.form.value;
}

  getAllProducts(){
    this.productService.find().subscribe((res:any)=>{
      this.products=res.data
    })
  }
  getAllUnit(){
    this.unitService.find().subscribe((res:any)=>{
      this.units=res.data
    })
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
    if(this.form.value.from_unit_id===this.form.value.to_unit_id){
      this.commonService.toastr.error(`The 'From Unit' and 'To Unit' must be different.`)
      return
    }
  
    this.isLoading = true; 
    this.spinnerService.show()
    this.service[this.isEdit ? 'update' : 'create'](this.form.value).subscribe({
      complete: () => {
        this.isLoading = false; 
        this.spinnerService.hide()
        this.commonService.toastr.success(
          this.isEdit ? 'Unit Conversion has been updated.' : 'Unit Conversion has been created.'
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isLoading = false;
        this.spinnerService.hide() 
        this.commonService.toastr.error(err.error.message)
        // this.commonService.handleError(err);
      },
    });
  }
  
}
