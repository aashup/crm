export class UnitConversionModel {
  id: number | null;
  product_id: number | null;
  from_unit_id: number | null;
  to_unit_id: number | null;
  conversion_factor: number | null;
  description: string | null;
  status: number;

  clear() {
    this.id = null;
    this.product_id = null;
    this.from_unit_id = null;
    this.to_unit_id = null;
    this.conversion_factor = null;
    this.description = null;
    this.status = 1;
    return this;
  }
}
