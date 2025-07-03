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
    this.ar.params.subscribe((params) => {
      this.productId = params['id'];
      console.log('Product ID from URL:', this.productId);
    });
    console.log(this.form.value.productInfo);
    if (this.productId) {
      this.loadProductDetails(this.productId); 
    }
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
  loadProductDetails(productId: string) {
    this.service.get({id:productId,with:""}).subscribe({
      next: (product:any) => {
        console.log('Product details:', product);
        
        this.productInfoForm.patchValue({
          id: product.data.id,
          name: product.data.name,
          status: product.data.status,
          slug: product.data.slug,
        });
        
      },
      error: (err) => {
        this.commonService.toastr.error('Failed to load product details');
        console.error(err);
      },
    });
  }

  submit() {
    this.service[this.productId ? 'update' : 'create'](this.productInfoForm.value).subscribe({
      next: (res: any) => {
        this.commonService.toastr.success(this.productId?'Prouduct updated successfully':'Product created successfully');
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
      },
      error: (err) => {
        this.commonService.toastr.error('Failed to create product');
      },
    });
  }
  ngOnDestroy() {}
}
