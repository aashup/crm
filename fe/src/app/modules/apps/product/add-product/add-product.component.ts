import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ProductModel } from '../product.model';
import { ProductService } from '../product.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
    selector: 'app-add-product',
    templateUrl: './add-product.component.html',
    styleUrl: './add-product.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddProductComponent implements AfterViewInit, OnInit, OnDestroy {
  form: FormGroup;
  model: ProductModel;
  clone: any;
  isEdit: boolean = false;

  @Input() product: ProductModel |  null;
  @Input() next: () => void;
  @Output() formSubmit = new EventEmitter<any>();
  private unsubscribe: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private service: ProductService,
    private find: FindService,
    private commonService: CommonService,
    private router: Router,
    private ar: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    if(this.product && this.product.id) {
      this.isEdit = true;
      this.model = this.product;
    } else {
      this.model = ( new ProductModel()).clear();
    }
    this.initForm(this.model);
 
    
  }
  ngAfterViewInit(): void {

  }

  initForm(model: ProductModel) {
    this.form = this.fb.group({
      id: [this.model.id, []],
      name: [this.model.name, [Validators.required]],
      slug: [this.model.slug],
      status: [this.model.status],
    });
    this.clone = this.form.value;
  }

  submit() {
    this.formSubmit.emit(this.form.value);
    console.log(this.form.value);
    
    this.commonService.markFormGroupTouched(this.form);
    if (!this.form.valid) {
      this.commonService.toastr.error('Please fix all errors.');
      return;
    }
    if (_.isEqual(this.form.value, this.clone)) {
      this.commonService.toastr.error('Nothing changed.');
      return;
    }
    this.service[this.isEdit ? 'update' : 'create'](this.form.value).subscribe({
      
      complete: () => {
        this.next();
       
        this.formSubmit.emit(this.product);
        console.log(this.product);

        this.commonService.toastr.success(
          this.isEdit ? 'Product has been updated.' : 'Product has been created.'
        );
      },
      error: (err) => this.commonService.handleError(err),
    });
  }
  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
