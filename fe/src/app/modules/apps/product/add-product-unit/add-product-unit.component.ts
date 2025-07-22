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

  private unsubscribe = new SubscriptionHandler();
  readonly dialogRef = inject(MatDialogRef<AddProductUnitComponent>);
  readonly data = inject<{ unit: ProductUnitModel; isEdit: boolean; productId: number }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private service: ProductUnitService,
    private commonService: CommonService,
    private us: UnitService,
    private cb: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.model = new ProductUnitModel().clear();
    this.isEdit = this.data.isEdit ?? false;
    if (this.isEdit && this.data.unit) {
      this.model = this.data.unit;
    }

    this.initForm(this.model);
    this.loadUnits();
    this.cb.detectChanges();
  }

  initForm(model: ProductUnitModel) {
    this.form = this.fb.group({
      id: [model.unit_id],
      product_id: [model.product_id, [Validators.required]],
      unit_id: new FormControl({ value: model.unit_id, disabled: this.isEdit }, [Validators.required]),
      sale_price: [model.sale_price, [Validators.required]],
      purchase_price: [model.purchase_price],
      notes: [model.notes],
      status: [model.status],
    });
  }

  get unitIdControl(): FormControl {
    return this.form.get('unit_id') as FormControl;
  }

  loadUnits() {
    this.us.find({ pageSize: 1000}).pipe(take(1)).subscribe({
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

  displayUnitName = (id: number | string): string => {
    if (!id || !this.units) return '';
    const unit:any = this.units.find((u) => u.id === +id);
    return unit ? unit.name : '';
  };

  submit() {
    let payload: any = {};
    if (this.isEdit) {
      payload = {
        sale_price: this.form.value.sale_price,
        purchase_price: this.form.value.purchase_price,
        notes: this.form.value.notes,
        status: this.form.value.status,
      };
    } else {
      payload = this.form.value;
    }
    this.unsubscribe.subscribe = this.service[this.isEdit ? 'update' : 'create'](
      this.data.productId,
      this.data?.unit?.unit_id || '',
      payload
    ).subscribe({
      complete: () => {
        if (!this.isEdit) this.commonService.toastr.success('Unit has been added.');
        this.loadUnits();
        this.form.value.product_id = this.data.productId;
        this.dialogRef.close(this.form.value);
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
