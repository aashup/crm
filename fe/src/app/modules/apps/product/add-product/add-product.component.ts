import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ProductService } from '../product.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import _ from 'lodash';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddProductComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() form: FormGroup;
  @Input() next: () => void = () => {};
  productInfoForm!: FormGroup;
  productId: string;
  isProductCreated = false;
  constructor(
    private fb: FormBuilder,
    private service: ProductService,
    private find: FindService,
    private commonService: CommonService,
    private router: Router,
    private ar: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log(this.form.value.productInfo);
    this.initForm()
  }
  ngAfterViewInit(): void {}

  initForm() {
    this.productInfoForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required]],
      status: ['', [Validators.required]],
      slug: [''],
    });
  }

  submit() {
    this.service.create(this.productInfoForm.value).subscribe({
      next: (res: any) => {
        this.commonService.toastr.success('Product created successfully');
        console.log(res);
        this.productId = res.data.id;
        this.form.value.productInfo=res.data
        this.isProductCreated = true;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.productInfoForm.markAsPristine();
        this.productInfoForm.markAsUntouched();
        this.productInfoForm.markAsPending();
        this.productInfoForm.updateValueAndValidity();
        this.productInfoForm.disable();
        this.productInfoForm.disable();

        this.isProductCreated = true;

        this.cdr.detectChanges();
        // this.router.navigate([`/app/product/add/${this.productId}`])
      },
      error: (err) => {
        this.commonService.toastr.error('Failed to create product');
      },
    });
  }
  ngOnDestroy() {}
}
