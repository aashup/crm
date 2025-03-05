import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import _ from 'lodash';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { ICreateAccount, inits } from 'src/app/modules/wizards/create-account.helper';
import { ProductModel } from '../product.model';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-unit',
  templateUrl: './product-unit.component.html',
  styleUrl: './product-unit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductUnitComponent implements AfterViewInit, OnInit, OnDestroy {
  form: FormGroup;
  model: ProductModel;
  clone: any;
  isEdit: boolean = false;

  @Input() product: ProductModel |  null;

  formsCount = 5;

  private unsubscribe: Subscription[] = [];
  @Input() next: () => void;

  constructor(
    private fb: FormBuilder,
    private service: ProductService,
    private find: FindService,
    private commonService: CommonService,
    private router: Router,
    private ar: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.model =( new ProductModel()).clear();
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
        this.commonService.location.back();
      },
      error: (err) => this.commonService.handleError(err),
    });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
