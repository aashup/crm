export class PurchaseModel {
  id: number | null;
  name: string;
  purchase:any
  contact_id: number | null;
  address_id: number | null;
  created_at: Date | null;
  updated_at: Date | null;

  constructor() {
    this.id = null;
    this.name = '';
    this.contact_id = null;
    this.address_id = null;
    this.created_at = null;
    this.updated_at = null;
    this.purchase=null
  }

  clear() {
    this.name = '';
    this.contact_id = null;
    this.address_id = null;
    this.created_at = null;
    this.updated_at = null;
    return this;
  }
}
