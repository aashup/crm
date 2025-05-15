export class CustomersModel {
  id: number | null;
  name: string;
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
