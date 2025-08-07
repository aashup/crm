import { UnitModel } from "src/app/modules/settings/unit/unit.model";

export class ProductUnitModel {
  id: number;
  product_id: number;
  unit_id: number;
  sale_price: number;
  purchase_price: number;
  notes: string;
  status: number;
  discount: number;
  unit?: UnitModel;
  sale_price_tax_type: number;
  sale_price_discount_amount:number
  sale_price_discount_type:number;
  purchase_price_tax_type: number;
  tax_rate_id: string|null;

  clear() {
      this.status = 1;
      return this;
  }
}
