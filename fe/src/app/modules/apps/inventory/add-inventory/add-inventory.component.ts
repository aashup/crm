import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { ProductService } from '../../product/product.service';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { AuthService } from 'src/app/modules/auth';
import { tap, map } from 'rxjs/operators';
import { InventoryModel } from '../inventory.model';
import { InventoryService } from '../inventory.service';

@Component({
  selector: 'app-add-inventory',
  templateUrl: '././add-inventory.component.html',
  styleUrl: '././add-inventory.component.scss',
  standalone: false,
})
export class AddInventoryComponent implements AfterViewInit, OnInit {
  form!: FormGroup;
  model!: InventoryModel;
  products: any[] = [];
  units: any[] = [];
  clone: any;
  isEdit: boolean = false;
  isLoading = false;
  userId: any;
  readonly _ = _;

  productControl!: FormControl;
  unitControl!: FormControl;

  filteredProducts: any[] = [];
  filteredUnits: any[] = [];

  readonly dialogRef = inject(MatDialogRef<AddInventoryComponent>);
  readonly data = inject<{
    model: InventoryModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  inventries: InventoryModel[] = [];

  constructor(
    private fb: FormBuilder,
    private service: InventoryService,
    private find: FindService,
    private commonService: CommonService,
    private productService: ProductService,
    private unitService: UnitService,
    private authService: AuthService,
    private spinnerService: SpinnerService
  ) {}

  itemNameValidator(items: any[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const itemName = control.value;
      if (!itemName) {
        return null;
      }
      const found = items.some(item => item.name.toLowerCase() === itemName.toLowerCase());
      return found ? null : { 'invalidItemName': { value: itemName } };
    };
  }

  ngOnInit(): void {
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.getUserId();
  
    this.isLoading = true;
    this.spinnerService.show();
  
    this.getAllProducts().subscribe(() => {
      this.getAllUnits().subscribe(() => {
  
        this.productControl = this.fb.control(
          '', [Validators.required, this.itemNameValidator(this.products)]
        );
        this.unitControl = this.fb.control(
          '', [Validators.required, this.itemNameValidator(this.units)]
        );
  
        this.form = this.fb.group({
          id: [this.model.id, []],
          product_id: [this.model.product_id, Validators.required],
          unit_id: [this.model.unit_id, Validators.required],
          qty: [this.model.qty, [Validators.required, Validators.min(0)]],
          rem_qty: [this.model.rem_qty, [Validators.min(0)]],
          purchase_price: [this.model.purchase_price, Validators.min(0)],
          sale_price: [this.model.sale_price, Validators.min(0)],
          notes: [this.model.notes],
          status: [this.model.status, [Validators.required]],
        });
  
        this.clone = this.form.value;
        this.productControl.valueChanges.pipe(
          tap(value => {
            if (value && typeof value === 'string') { 
              this.filteredProducts = this._filterProducts(value);
            } else {
              this.filteredProducts = []; 
            }
  
            const matched = this.products.find(p => p.name.toLowerCase() === value?.toLowerCase());
            if (!matched) {
              this.form.get('product_id')?.setValue(null);
            }
          })
        ).subscribe();
  
        this.unitControl.valueChanges.pipe(
          tap(value => {
            if (value && typeof value === 'string') { 
              this.filteredUnits = this._filterUnits(value);
            } else {
              this.filteredUnits = []; 
            }
  
            const matched = this.units.find(u => u.name.toLowerCase() === value?.toLowerCase());
            if (!matched) {
              this.form.get('unit_id')?.setValue(null);
            }
          })
        ).subscribe();
  
        setTimeout(() => {
          const initialProductName = this.getProductNameById(this.model.product_id);
          const initialUnitName = this.getUnitNameById(this.model.unit_id);
          this.productControl.setValue(initialProductName, { emitEvent: false }); 
          this.unitControl.setValue(initialUnitName, { emitEvent: false }); 
          this.filteredProducts = [];
          this.filteredUnits = [];
        });
  
        this.isLoading = false;
        this.spinnerService.hide();
      });
    });
  }
  

  getUserId() {
    const userData = this.authService.getCurrentUser();
    this.userId = userData.user.id;
    console.log(userData.user.id);
  }

  getAllProducts() {
    return this.productService.find({pageSize:10000}).pipe(
      tap((res: any) => {
        if (res) {
          this.products = res.data;
        }
      })
    );
  }

  getAllUnits() {
    return this.unitService.find({pageSize:1000}).pipe(
      tap((res: any) => {
        if (res) {
          this.units = res.data;
        }
      })
    );
  }

  getProductNameById(id: any): string {
    const product = this.products.find(p => p.id === id);
    return product ? product.name : '';
  }

  getUnitNameById(id: any): string {
    const unit = this.units.find(u => u.id === id);
    return unit ? unit.name : '';
  }

  selectProduct(productName: string) {
    const product = this.products.find(p => p.name === productName);
    if (product) {
      this.form.get('product_id')?.setValue(product.id);
    }
  }

  selectUnit(unitName: string) {
    const unit = this.units.find(u => u.name === unitName);
    if (unit) {
      this.form.get('unit_id')?.setValue(unit.id);
    }
  }

  onProductInputFocus(): void {
    if (this.productControl.value) {
      this.filteredProducts = this._filterProducts(this.productControl.value);
    } else {
      this.filteredProducts = []; 
    }
  }

  onUnitInputFocus(): void {
    if (this.unitControl.value) {
      this.filteredUnits = this._filterUnits(this.unitControl.value);
    } else {
      this.filteredUnits = []; 
    }
  }

  private _filterProducts(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.products.filter(product => product.name.toLowerCase().includes(filterValue));
  }

  private _filterUnits(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.units.filter(unit => unit.name.toLowerCase().includes(filterValue));
  }

  ngAfterViewInit(): void {
    this.dialogRef.afterClosed().subscribe(() => {
      this.isLoading = false;
      this.spinnerService.hide();
    });
  }

  submit() {
    this.commonService.markFormGroupTouched(this.form);
    this.commonService.markFormGroupTouched(new FormGroup({
      productControl: this.productControl,
      unitControl: this.unitControl
    }));

    this.form.value.qty = Number(this.form.value.qty);
    this.form.value.rem_qty = Number(this.form.value.rem_qty);

    if (!this.form.valid || this.productControl.invalid || this.unitControl.invalid) {
      this.commonService.toastr.error('Please fix all errors.');
      return;
    }
    if (_.isEqual(this.form.value, this.clone)) {
      this.commonService.toastr.error('Nothing changed.');
      return;
    }

    this.isLoading = true;
    this.spinnerService.show();
    this.service[this.isEdit ? 'update' : 'create'](this.form.value).subscribe({
      complete: () => {
        this.commonService.toastr.success(this.isEdit ? 'Inventory has been updated.' : 'Inventory has been created.');
        this.isLoading = false;
        this.spinnerService.hide();
        this.dialogRef.close(true);
      },
      error: (err:any) => {
        this.commonService.handleError(err);
        this.isLoading = false;
        this.spinnerService.hide();
      },
    });
  }
}