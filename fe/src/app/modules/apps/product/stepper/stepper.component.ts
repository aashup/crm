import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import _ from 'lodash';
import { BehaviorSubject, of, Subscription, switchMap } from 'rxjs';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import {
  ICreateAccount,
  inits,
} from 'src/app/modules/wizards/create-account.helper';
import { ProductModel } from '../product.model';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperComponent implements AfterViewInit, OnInit, OnDestroy {
  form: FormGroup;
  model: ProductModel;
  clone: any;
  isEdit: boolean = false;
  formData: any = {
    product: null,
    unitDetails: null,
    inventoryDetails: null,
    sellerDetails: null,
  };
  updateFormData(step: string, data: any) {
    this.formData[step] = data;
  }
  formsCount = 5;
  account$: BehaviorSubject<ICreateAccount> =
    new BehaviorSubject<ICreateAccount>(inits);
  currentStep$: BehaviorSubject<number> = new BehaviorSubject(1);
  isCurrentFormValid$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private unsubscribe: Subscription[] = [];

  product: ProductModel;
  productId: number = 0;
  loadCompleted = false;
  
  constructor(
    private fb: FormBuilder,
    private service: ProductService,
    private find: FindService,
    private commonService: CommonService,
    private router: Router,
    private ar: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.productId = Number(this.ar.snapshot.paramMap.get('id'));
    this.productId
      ? this.loadProduct(this.productId)
      : (this.loadCompleted = true);
  }

  loadProduct(productId: number) {
    this.service.get({ id: productId, with: ['units'] }).subscribe({
      next: ({ data }: any) => {
        this.product = data;
        this.cdr.markForCheck();
        console.log(data);
        this.loadCompleted = true;
      },
      error: (err) => this.commonService.handleError(err),
    });
  }

  ngAfterViewInit(): void {}

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

  prevStep() {
    const prevStep = this.currentStep$.value - 1;
    if (prevStep === 0) {
      return;
    }
    this.currentStep$.next(prevStep);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  gotoStep(i: number) {
    this.currentStep$.next(i);
  }
}
