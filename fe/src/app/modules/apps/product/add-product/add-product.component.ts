import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ProductModel } from '../product.model';
import { ProductService } from '../product.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ICreateAccount, inits } from 'src/app/modules/wizards/create-account.helper';
import { AppStateManager } from '../stepper/state.manager';


@Component({
    selector: 'app-add-product',
    templateUrl: './add-product.component.html',
    styleUrl: './add-product.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddProductComponent implements AfterViewInit, OnInit, OnDestroy {
 
  @Input()form!:FormGroup
  @Input() next:() => void = () => {};


  constructor(
    private fb: FormBuilder,
    private service: ProductService,
    private find: FindService,
    private commonService: CommonService,
    private router: Router,
    private ar: ActivatedRoute,
  ) {}

  ngOnInit(): void {
   
  }
  ngAfterViewInit(): void {

  }

 

  submit() {
    let id:any;
    this.service.create(this.form.value).subscribe({
      
      next: (res:any) => {
        this.commonService.toastr.success('Product created successfully');
        console.log(res);
        id = res.data.id;
        this.form.value.id = res.data.id;
      }
      , complete: () => {
        this.form.markAsPristine();
        this.form.markAsUntouched();
        this.form.markAsPending();
        this.form.updateValueAndValidity();
        this.form.disable();
        this.form.get('productInfo')?.disable();
        this.next()
        this.router.navigate([`/app/product/add/${id}`])
       
      }
      , error: (err) => {
        this.commonService.toastr.error('Failed to create product');
      }
    });
  }
  ngOnDestroy() {
   
  }

  
}
