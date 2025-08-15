import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/modules/core/common.service';
import { ICreateAccount, inits } from 'src/app/modules/wizards/create-account.helper';
import { ProductModel } from '../product.model';
import { ProductService } from '../product.service';
import { SubscriptionHandler } from 'src/app/modules/core/subscription.handler';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperComponent implements AfterViewInit, OnInit, OnDestroy {
  form!: FormGroup;
  model: ProductModel;
  clone: any;
  isEdit: boolean = false;

  formsCount = 6;
  account$: BehaviorSubject<ICreateAccount> = new BehaviorSubject<ICreateAccount>(inits);
  currentStep$: BehaviorSubject<number> = new BehaviorSubject(1);
  isCurrentFormValid$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subscriptionHandler = new SubscriptionHandler();

  product: ProductModel;
  productId: number = 0;
  loadCompleted = false;

  constructor(
    private fb: FormBuilder,
    private service: ProductService,
    private commonService: CommonService,
    private ar: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router:Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      productInfo: this.fb.group({
        id: [''],
        name: ['', [Validators.required]],
        status: ['', [Validators.required]],
        slug: [''],
      }),
      unitInfo: this.fb.array([]),
      unitConversionInfo: this.fb.array([]),
      inventoryInfo: this.fb.array([]),
      sellerInfo: this.fb.group({
        id: ['', []],
        product_id: ['', [Validators.required]],
        unit_id: ['', [Validators.required]],
        sale_price: ['', [Validators.required]],
        purchase_price: [''],
        notes: [''],
        status: [''],
      }),
    });
    this.productId = Number(this.ar.snapshot.paramMap.get('id'));
    if (this.productId) this.loadProduct(this.productId);
    else {
      this.product = new ProductModel();
      this.product.clear();

      this.loadCompleted = true;
    }
  }

  get productInfo(): FormGroup {
    return this.form.get('productInfo') as FormGroup;
  }

  get unitInfo(): FormGroup {
    return this.form.get('unitInfo') as FormGroup;
  }

  get inventoryInfo(): FormGroup {
    return this.form.get('inventoryInfo') as FormGroup;
  }

  get sellerInfo(): FormGroup {
    return this.form.get('sellerInfo') as FormGroup;
  }

  loadProduct(productId: number) {
    this.subscriptionHandler.subscribe = this.service.get({ id: productId, with: ['units'] }).subscribe({
      next: ({ data }: any) => {
        this.product = data;

        this.cdr.markForCheck();
        this.loadCompleted = true;
      },
      error: (err) => this.commonService.handleError(err),
    });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy() {
    this.subscriptionHandler.unsubscribe();
  }

  back() {
    return this.commonService.location.back();
  }

  updateAccount = (part: Partial<ICreateAccount>, isFormValid: boolean) => {
    const currentAccount = this.account$.value;
    const updatedAccount = { ...currentAccount, ...part };
    this.account$.next(updatedAccount);
    this.isCurrentFormValid$.next(isFormValid);
  };

  nextStep() {
    const nextStep = this.currentStep$.value + 1;
    if (nextStep > this.formsCount) {
      return;
    }
    this.currentStep$.next(nextStep);
  }

  backToSale(){
    this.router.navigate(["/app/sale"])
  }
  prevStep() {
    const prevStep = this.currentStep$.value - 1;
    if (prevStep === 0) {
      return;
    }
    this.currentStep$.next(prevStep);
  }

  gotoStep(i: number) {
    return;
    if (!this.form.value.productInfo.id) return;
    this.currentStep$.next(i);
  }
}
