import { AfterViewInit, ChangeDetectionStrategy, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ProductModel } from '../product.model';
import { ProductService } from '../product.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { AddUnitComponent } from 'src/app/modules/settings/unit/add-unit/add-unit.component';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ICreateAccount, inits } from 'src/app/modules/wizards/create-account.helper';

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
        this.commonService.toastr.success(
          this.isEdit ? 'Permission has been updated.' : 'Permission has been created.'
        );
        this.next();
      },
      error: (err) => this.commonService.handleError(err),
    });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
