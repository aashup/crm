import { UnitModel } from "src/app/modules/settings/unit/unit.model";

export class ProductUnitModel {
  id: number;
  product_id: number;
  unit_id: number;
  sale_price: number;
  purchase_price: number;
  notes: string;
  status: number;

  unit?: UnitModel

  clear() {
      this.status = 1;
      return this;
  }
}
