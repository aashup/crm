import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';

import { PurchaseModel } from '../purchase.model';
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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
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
    purchase.purchaseDetails.forEach((detail: any) => {
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
    if (this.form.valid) {
      const purchaseData = this.form.value;
      this.dialogRef.close(purchaseData);
    }
  }

  
}
