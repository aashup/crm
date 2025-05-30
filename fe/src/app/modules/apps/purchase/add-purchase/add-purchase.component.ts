import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';

import { PurchaseModel } from '../purchase.model';
import { CommonService } from 'src/app/modules/core/common.service';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { ProductService } from '../../product/product.service';
import { ContactService } from 'src/app/modules/settings/contact/contact.service';
import { PurchaseService } from '../purchase.service';
@Component({
    selector: 'app-add-purchase',
    templateUrl: '././add-purchase.component.html',
    styleUrl: '././add-purchase.component.scss',
    standalone: false
})
export class AddPurchaseComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  contacts:any = []; 
  units:any = [];
  suppliers:any = []; 
  products:any = [];
  isEdit = false; 
  readonly _ = _;
  readonly dialogRef = inject(MatDialogRef<AddPurchaseComponent>);
  readonly data = inject<{
    model: PurchaseModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  purchaseItems: PurchaseModel[] = [];

  constructor(
    private fb: FormBuilder,
    private commonService:CommonService,
    private unitService:UnitService,
    private productService:ProductService,
    private contactService:ContactService,
    private purchaseService:PurchaseService


  ) {}

  ngOnInit(): void {
    console.log(this.data.model);
    
    this.isEdit=this.data.isEdit
    this.getAllUnits()
    this.getAllConntact()
    this.getAllProduct()
    this.form = this.fb.group({
      contact_id: [null, Validators.required],
      unit_id: [null, Validators.required],
      supplier_id: [null, Validators.required],
      amount: [null, Validators.required],
      notes: [''],
      purchaseDetails: this.fb.array([this.createPurchaseDetail()])
    });

    if (this.isEdit) {
      this.patchForm(this.data.model);
    }
  }
  getAllUnits(){
    this.unitService.find({}).subscribe((res:any)=>{
      if(res.data){
        this.units=res.data
      }
    })
  }

getAllConntact(){
  this.contactService.find({}).subscribe((res:any)=>{
    if(res.data){
      this.contacts=res.data
    }
  })
}
getAllProduct(){
  this.productService.find({}).subscribe((res:any)=>{
    if(res.data){
      this.products=res.data
    }
  })
}



  get purchaseDetails(): FormArray {
    return this.form.get('purchaseDetails') as FormArray;
  }
  initializeForm(): void {
    this.form = this.fb.group({
      contact_id: [null, Validators.required],
      unit_id: [null, Validators.required],
      supplier_id: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      notes: [''],
      purchaseDetails: this.fb.array([])
    });
  }
 
  createPurchaseDetail(): FormGroup {
    return this.fb.group({
      product_id: [null, Validators.required],
      unit_id: [null, Validators.required],
      amount: [null, Validators.required]
    });
  }

  addPurchaseDetail(): void {
    this.purchaseDetails.push(this.createPurchaseDetail());
  }

  removePurchaseDetail(index: number): void {
    if (this.purchaseDetails.length > 1) {
      this.purchaseDetails.removeAt(index);
    }
  }

  patchForm(purchase: any): void {
    this.form.patchValue(purchase);
    this.purchaseDetails.clear();
    purchase.purchase_details.forEach((detail: any) => {
      this.purchaseDetails.push(this.fb.group({
        product_id: [detail.product_id, Validators.required],
        unit_id: [detail.unit_id, Validators.required],
        amount: [detail.amount, Validators.required]
      }));
    });
  }

  loadDropdownData(): void {
    // Load contacts, units, suppliers, and products data here
    // Example:
    
  }
  ngAfterViewInit(): void {
  
  }
 
  
  onSubmit(): void {
    if(this.isEdit&& this.data.model){
      const payload=this.form.value
      payload.id=this.data.model.id
      this.purchaseService.update(this.form.value).subscribe((res)=>{
        if(res){
          this.commonService.toastr.success("Purchase Updated")
          this.dialogRef.close(this.data.model)
        }
      })
      return
    }
    if (this.form.valid) {
      const purchaseData = this.form.value;
      this.purchaseService.create(this.form.value).subscribe((res)=>{
        if(res){
          this.commonService.toastr.success("Purchase Item Created")

          this.dialogRef.close(purchaseData);
          window.location.reload()
        }
      })
     
    }
  }

  
}
