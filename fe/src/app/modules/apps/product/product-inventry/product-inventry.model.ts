export class ProductInventoryModel {
  id: number | null;
  product_id: number | null;
  unit_id: number | null;
  created_by: number | null;
  qty: number | null;
  rem_qty: number | null;
  purchase_price: number | null;
  sale_price: number | null;
  notes: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  deleted_at: Date | null;
  status: boolean;

  constructor() {
    this.id = null;
    this.product_id = null;
    this.unit_id = null;
    this.created_by = null;
    this.qty = null;
    this.rem_qty = null;
    this.purchase_price = null;
    this.sale_price = null;
    this.notes = null;
    this.created_at = null;
    this.updated_at = null;
    this.deleted_at = null;
    this.status = true; 
  }

  clear() {
    this.product_id = null;
    this.unit_id = null;
    this.created_by = null;
    this.qty = null;
    this.rem_qty = null;
    this.purchase_price = null;
    this.sale_price = null;
    this.notes = null;
    this.created_at = null;
    this.updated_at = null;
    this.deleted_at = null;
    this.status = true; // Reset to default
    return this;
  }
}