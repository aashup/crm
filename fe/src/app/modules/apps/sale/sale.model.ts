export class SaleModel {
  id: number | null;
  contact_id: number | null;
  unit_id: number | null;
  created_by: number | null;
  amount: number | null;
  discount_amount: number;
  discount_type: number; // 1 = flat, 2 = percent
  net_total: number | null;
  notes: string;
  created_at: Date | null;
  updated_at: Date | null;
  deleted_at: Date | null;
  status: number; // 1 = active, 0 = inactive or deleted
  saleDetails:any[]

  constructor() {
    this.id = null;
    this.contact_id = null;
    this.unit_id = null;
    this.created_by = null;
    this.amount = null;
    this.discount_amount = 0.00;
    this.discount_type = 1; // Default to flat
    this.net_total = null;
    this.notes = '';
    this.created_at = null;
    this.updated_at = null;
    this.deleted_at = null;
    this.status = 1; // Active by default
    this.saleDetails=[]
  }

  clear() {
    this.contact_id = null;
    this.unit_id = null;
    this.created_by = null;
    this.amount = null;
    this.discount_amount = 0.00;
    this.discount_type = 1;
    this.net_total = null;
    this.notes = '';
    this.created_at = null;
    this.updated_at = null;
    this.deleted_at = null;
    this.status = 1;
    this.saleDetails=[]
    return this;
  }
}
