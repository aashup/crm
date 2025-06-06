import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { SaleModel } from '../sale.model';
import { ContactService } from 'src/app/modules/settings/contact/contact.service';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { ProductService } from '../../product/product.service';
import { SaleService } from '../sale.service';
import { CommonService } from 'src/app/modules/core/common.service';

@Component({
  selector: 'app-add-sale',
  templateUrl: './add-sale.component.html',
  styleUrls: ['./add-sale.component.scss'],
  standalone: false
})
export class AddSaleComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  contacts: any[] = [];
  units: any[] = [];
  products: any[] = [];
  isLoading = false;
  isEdit = false;
  readonly _ = _;
  readonly dialogRef = inject(MatDialogRef<AddSaleComponent>);
  readonly data = inject<{
    model: SaleModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private unitService: UnitService,
    private productService: ProductService,
    private saleService: SaleService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.isEdit = this.data.isEdit;
    this.getAllContact();
    this.getAllUnits();
    this.getAllProducts();
    this.initializeForm();

    if (this.isEdit) {
      this.patchForm(this.data.model);
    }
  }

  ngAfterViewInit(): void {
    this.isEdit = this.data.isEdit;
    this.dialogRef.afterClosed().subscribe(() => {
      this.isLoading = false; 
    });
  }

  getAllContact() {
    this.contactService.find().subscribe({
      next: (data: any) => {
        this.contacts = data.data;
      },
      error: (err) => {
        console.error('Error fetching contacts:', err);
      }
    });
  }

  getAllUnits() {
    this.unitService.find().subscribe({
      next: (data: any) => {
        this.units = data.data;
      },
      error: (err) => {
        console.error('Error fetching units:', err);
      }
    });
  }

  getAllProducts() {
    this.productService.find().subscribe({
      next: (data: any) => {
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
      net_total: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
      notes: [''],
      status: [1, Validators.required],
      saleDetails: this.fb.array([this.createSaleDetailWithCalculation(0)])
    });

    if (this.isEdit) {
      this.patchForm(this.data.model);
    }
  }

  createSaleDetailWithCalculation(index: number): FormGroup {
    const group = this.fb.group({
      product_id: [null, Validators.required],
      unit_id: [null, Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      discount_amount: [0, [Validators.required, Validators.min(0)]],
      discount_type: [1, Validators.required],
      net: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]]
    });

    group.get('amount')?.valueChanges.subscribe(() => this.calculateNet(index));
    group.get('discount_amount')?.valueChanges.subscribe(() => this.calculateNet(index));
    group.get('discount_type')?.valueChanges.subscribe(() => this.calculateNet(index));

    return group;
  }

  addSaleDetail(): void {
    const index = this.saleDetails.length;
    this.saleDetails.push(this.createSaleDetailWithCalculation(index));
  }

  removeSaleDetail(index: number): void {
    if (this.saleDetails.length > 1) {
      this.saleDetails.removeAt(index);
      this.calculateNetTotal();
    }
  }

  calculateNet(index: number): void {
    const item = this.saleDetails.at(index);
    const amount = item.get('amount')?.value || 0;
    const discountAmount = item.get('discount_amount')?.value || 0;
    const discountType = item.get('discount_type')?.value;

    let net = amount;

    if (discountType === 1) {
      net = amount - discountAmount;
    } else if (discountType === 2) {
      net = amount - (amount * discountAmount / 100);
    }

    net = Math.max(0, parseFloat(net.toFixed(2)));
    item.get('net')?.setValue(net, { emitEvent: false });

    this.calculateNetTotal();
  }

  calculateNetTotal(): void {
    let total = 0;
    this.saleDetails.controls.forEach(ctrl => {
      total += ctrl.get('net')?.value || 0;
    });
    this.form.get('net_total')?.setValue(parseFloat(total.toFixed(2)), { emitEvent: false });
  }

  patchForm(sale: any): void {
    this.form.patchValue({
      contact_id: sale.contact_id || null,
      unit_id: sale.unit_id || null,
      amount: sale.amount || null,
      discount_amount: sale.discount_amount || null,
      discount_type: sale.discount_type || null,
      notes: sale.notes || '',
      status: sale.status || 1,
    });

    this.saleDetails.clear();

    if (sale.sale_details && Array.isArray(sale.sale_details)) {
      sale.sale_details.forEach((detail: any, index: number) => {
        const group = this.createSaleDetailWithCalculation(index);
        group.patchValue({
          product_id: detail.product_id || null,
          unit_id: detail.unit_id || null,
          amount: detail.amount || 0,
          discount_amount: detail.discount_amount || 0,
          discount_type: detail.discount_type || 1
        });
        this.saleDetails.push(group);
        this.calculateNet(index);
      });
    }

    this.calculateNetTotal();
  }

  onSubmit(): void {
    this.commonService.markFormGroupTouched(this.form);
  
    if (!this.form.valid) {
      this.commonService.toastr.error('Please fix all errors.');
      return;
    }
  
    this.isLoading = true; 
  
    const payload = {
      ...this.form.getRawValue(),
      id: this.data.model?.id || null,
    };
  
    if (this.isEdit) {
      this.saleService.update(payload).subscribe({
        next: () => {
          this.commonService.toastr.success('Updated Successfully');
          this.dialogRef.close(true); 
          this.isLoading = false; 
        },
        error: (err) => {
          console.error('Error updating sale:', err);
          this.commonService.handleError(err);
          this.isLoading = false;
        },
      });
    } else {
      this.saleService.create(payload).subscribe({
        next: () => {
          this.commonService.toastr.success('Sale Created Successfully');
          this.dialogRef.close(true);
          this.isLoading = false; 
        },
        error: (err) => {
          console.error('Error creating sale:', err);
          this.commonService.handleError(err);
          this.isLoading = false; 
        },
      });
    }
  }
}
