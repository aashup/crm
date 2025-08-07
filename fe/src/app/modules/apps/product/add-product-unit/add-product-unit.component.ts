import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take, map, startWith, Observable } from 'rxjs';
import { SubscriptionHandler } from 'src/app/modules/core/subscription.handler';
import { CommonService } from 'src/app/modules/core/common.service';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { ProductUnitModel } from '../product-unit/product-unit.model';
import { UnitModel } from 'src/app/modules/settings/unit/unit.model';
import { ProductUnitService } from '../product-unit/product-unit.service';
import { RateModal } from './rate-modal';
import { RateService } from './rate-service';

@Component({
  selector: 'app-add-product-unit',
  templateUrl: './add-product-unit.component.html',
  styleUrls: ['./add-product-unit.component.scss'],
})
export class AddProductUnitComponent implements OnInit, OnDestroy {
  form: FormGroup;
  model: ProductUnitModel;
  isEdit = false;
  units: UnitModel[];
  filteredUnits: Observable<UnitModel[]>;
  rates: RateModal[] = [];
  private unsubscribe = new SubscriptionHandler();
  readonly dialogRef = inject(MatDialogRef<AddProductUnitComponent>);
  readonly data = inject<{ unit: ProductUnitModel; isEdit: boolean; productId: number }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private service: ProductUnitService,
    private commonService: CommonService,
    private us: UnitService,
    private cb: ChangeDetectorRef,
    private rateService:RateService
  ) {}

  ngOnInit(): void {
    this.getAllTaxRates();
    this.model = new ProductUnitModel().clear();
    this.isEdit = this.data.isEdit ?? false;
    if (this.isEdit && this.data.unit) {
      this.model = this.data.unit;
      console.log(this.data);
      
    }

    this.initForm(this.model);
    this.loadUnits();
    this.cb.detectChanges();
  }

  getFormattedTaxLabel(type: number, rate: number): string {
    const taxTypeMap: { [key: number]: string } = {
      1: 'GST',
      2: 'IGST',
      3: 'CGST',
      4: 'SGST',
      5: 'VAT',
      6: 'Service Tax',
      7: 'Other'
    };
  
    const taxName = taxTypeMap[type] || 'Unknown';
    return `${taxName}@${rate}%`;
  }
  

  initForm(model: ProductUnitModel) {
    this.form = this.fb.group({
      id: [model.unit_id],
      product_id: [this.data.productId, [Validators.required]],
      unit_id: new FormControl({ value: model.unit_id, disabled: this.isEdit }, [Validators.required]),
      sale_price: [model?.sale_price, [Validators.required]],
      sale_price_tax_type: [model?.sale_price_tax_type || 2],
      sale_price_discount_amount: [model?.sale_price_discount_amount],
      sale_price_discount_type: [model?.sale_price_discount_type || 1],
      purchase_price: [model.purchase_price],
      purchase_price_tax_type: [model?.purchase_price_tax_type || 2],
      notes: [model.notes],
      status: [model.status],
      tax_rate_id: [model?.tax_rate_id || 'None', [Validators.required]],
    });
  }

  get unitIdControl(): FormControl {
    return this.form.get('unit_id') as FormControl;
  }

  loadUnits() {
    this.us
      .find({ pageSize: 1000 })
      .pipe(take(1))
      .subscribe({
        next: (resp: any) => {
          this.units = resp.data;
          const unitControl = this.unitIdControl;
          this.filteredUnits = unitControl.valueChanges.pipe(
            startWith(''),
            map((value: any) => {
              const search =
                typeof value === 'string' ? value.toLowerCase() : this.displayUnitName(value).toLowerCase();
              return this.units.filter((unit: any) => unit.name.toLowerCase().includes(search));
            })
          );
          if (this.isEdit && this.model.unit_id) {
            unitControl.setValue(this.model.unit_id);
            unitControl.disable();
          }
        },
        error: (err) => this.commonService.handleError(err),
      });
  }

  getAllTaxRates(): void {
    this.rateService.find({ pageSize: 1000 }).pipe(take(1)).subscribe({
      next: (res: any) => {     
        if (res?.data?.length) {
          this.rates = res.data;
        } else {
          this.rates = [];
          console.warn('No tax rates found.');
        }
      },
      error: (error: any) => {
        console.error('Failed to fetch tax rates:', error);
        this.rates = [];
      }
    });
  }
  

  displayUnitName = (id: number | string): string => {
    if (!id || !this.units) return '';
    const unit: any = this.units.find((u) => u.id === +id);
    return unit ? unit.name : '';
  };

  submit() {
    if (this.form.invalid) {
      return;
    }

    let payload: any;

    if (this.isEdit) {
      payload = this.form.getRawValue();
      delete payload.id;
    } else {
      payload = this.form.value;
    }

    this.unsubscribe.subscribe = this.service[this.isEdit ? 'update' : 'create'](
      this.data.productId,
      this.data?.unit?.unit_id || payload.unit_id,
      payload
    ).subscribe({
      complete: () => {
        const message = this.isEdit ? 'Unit has been updated.' : 'Unit has been added.';
        this.commonService.toastr.success(message);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.commonService.toastr.error(err.error.message);
      },
    });
  }

  ngOnDestroy() {
    this.unsubscribe.unsubscribe();
  }
}
