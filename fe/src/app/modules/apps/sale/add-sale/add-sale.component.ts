import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { SaleModel } from '../sale.model';
import { ContactService } from 'src/app/modules/settings/contact/contact.service';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { ProductService } from '../../product/product.service';
import { SaleService } from '../sale.service';

@Component({
    selector: 'app-add-sale',
    templateUrl: '././add-sale.component.html',
    styleUrl: '././add-sale.component.scss',
    standalone: false
})
export class AddSaleComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  contacts:any = []; 
  units:any = [];
  products:any = [];
  isEdit = false; 
  readonly _ = _;
  readonly dialogRef = inject(MatDialogRef<AddSaleComponent>);
  readonly data = inject<{
    model: SaleModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  saleItems: SaleModel[] = [];

  constructor(
    private fb: FormBuilder,
    private contactService:ContactService,
    private unitService:UnitService,
    private productService:ProductService,
    private saleService:SaleService
  ) {}

  ngOnInit(): void {
    this.isEdit = this.data.isEdit

    this.getAllContact()
    this.getAllUnits()
    this.getAllProducts()
    this.initializeForm()

    if (this.isEdit) {
      this.patchForm(this.data.model);
    }
  }

  getAllContact() {
    this.contactService.find().subscribe({
      next: (data:any) => {
        this.contacts = data.data;
        console.log('Contacts retrieved:',data.data);
      },
      error: (err) => {
        console.error('Error fetching contacts:', err);
      }
    });
  }
  getAllUnits() {
    this.unitService.find().subscribe({
      next: (data:any) => {
        this.units = data.data;
      },
      error: (err) => {
        console.error('Error fetching units:', err);
      }
    });
  }
  getAllProducts() {
    this.productService.find().subscribe({
      next: (data:any) => {
        this.products = data.data;
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      }
    });
  }


  get saleDetails(): FormArray {
    return this.form.get('saleDetails') as FormArray;
  }
  initializeForm(): void {
    this.form = this.fb.group({
      contact_id: [null, Validators.required],
      unit_id: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      discount_amount: [null, [Validators.required, Validators.min(0)]],
      discount_type: [null, Validators.required],
      net_total: [null, [Validators.required, Validators.min(0)]],
      notes: [''],
      status: [1, Validators.required], 
      saleDetails: this.fb.array([this.createSaleDetail()]) 
    });
  
   
    if (this.isEdit) {
      this.patchForm(this.data.model);
    }
  }
  createSaleDetail(): FormGroup {
    return this.fb.group({
      product_id: [null, Validators.required],
      unit_id: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      discount_amount: [null, [Validators.required, Validators.min(0)]],
      discount_type: [null, Validators.required], // 1 for Flat, 2 for Percentage
      net: [null, [Validators.required, Validators.min(0)]]
    });
  }

  addSaleDetail(): void {
    this.saleDetails.push(this.createSaleDetail());
  }

  removeSaleDetail(index: number): void {
    if (this.saleDetails.length > 1) {
      this.saleDetails.removeAt(index);
    }
  }

  patchForm(sale: any): void {
   
    console.log('Sale object:', sale);
    this.form.patchValue({
      contact_id: sale.contact_id || null,
      unit_id: sale.unit_id || null,
      amount: sale.amount || null,
      discount_amount: sale.discount_amount || null,
      discount_type: sale.discount_type || null,
      net_total: sale.net_total || null,
      notes: sale.notes || '',
      status: sale.status || 1,
    });
  
  
    this.saleDetails.clear();
    if (sale.saleDetails && Array.isArray(sale.saleDetails)) {
      sale.saleDetails.forEach((detail: any) => {
        this.saleDetails.push(this.fb.group({
          product_id: [detail.product_id || null, Validators.required],
          unit_id: [detail.unit_id || null, Validators.required],
          amount: [detail.amount || null, [Validators.required, Validators.min(1)]],
          discount_amount: [detail.discount_amount || null, [Validators.required, Validators.min(0)]],
          discount_type: [detail.discount_type || null, Validators.required],
          net: [detail.net || null, [Validators.required, Validators.min(0)]],
        }));
      });
    } else {
     
    }
  }

  ngAfterViewInit(): void {
    this.isEdit = this.data.isEdit
  }
 
  
  onSubmit(): void {
    if (this.form.valid) {
      const payload = this.form.value;
      
      if (this.isEdit) {
        // Update existing sale
        // this.saleService.update({this.data.model.id, payload}).subscribe({
        //   next: (res) => {
        //     console.log('Sale updated successfully:', res);
        //     this.dialogRef.close(true); // Pass true to indicate success
        //   },
        //   error: (err) => {
        //     console.error('Error updating sale:', err);
        //   }
        // });
      } else {
        // Create new sale
        this.saleService.create(payload).subscribe({
          next: (res) => {
            console.log('Sale created successfully:', res);
            this.dialogRef.close(true); // Pass true to indicate success
          },
          error: (err) => {
            console.error('Error creating sale:', err);
          }
        });
      }
    } else {
      console.warn('Form is invalid:', this.form.value);
      console.error('Validation errors:', this.form.errors);
    }
  }
  

  
}
