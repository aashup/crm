export class ProductSellerModel {
  id: number | null;
  name: string;
  contact_id: number | null;
  level: string | null;
  type: string | null;
  status: string | null;
  billing_address_id: number | null;
  shipping_address_id: number | null;
  created_at: Date | null;
  updated_at: Date | null;

  constructor() {
    this.id = null;
    this.name = '';
    this.contact_id = null;
    this.billing_address_id = null;
    this.shipping_address_id = null;
    this.level = null;
    this.type = null;
    this.status = null;
    this.created_at = null;
    this.updated_at = null;
  }

  clear() {
    this.name = '';
    this.contact_id = null;
    this.billing_address_id = null;
    this.shipping_address_id = null;
    this.created_at = null;
    this.updated_at = null;
    this.level = null;
    this.type = null;
    this.status = null;
    return this;
  }
}
