export class TaxRateModel {
  id: number|string|null
  rate: number|0;
  type: number|null;
  is_active: number|null;

  clear() {
    this.id=null
    this.rate = 0;
    this.type = null;
    this.is_active = null;
    return this;
  }
}