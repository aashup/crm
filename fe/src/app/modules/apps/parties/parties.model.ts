export class PartiesModel {
  id: number | null = null;
  name: string = '';
  gstin: string = '';
  mobile: string = '';
  contact_id: string = '';
  opening_balance: number | null = null;
  opening_balance_date: string | null = null;
  credit_limit: boolean = true;
  credit_limit_amount: number | null = null;
  billing_address_id: string = '';
  shipping_address_id: string = '';
  state_id: string = '';
  email: string = '';
  gst_type: string = '';
  created_at: Date | null = null;
  updated_at: Date | null = null;
  html: string = ''; 

  constructor(initializer?: Partial<PartiesModel>) {
  
    if (initializer) {
      Object.assign(this, initializer);
    }
  }

  clear(): PartiesModel {
    this.id = null;
    this.name = '';
    this.gstin = '';
    this.mobile = '';
    this.opening_balance = null;
    this.opening_balance_date = null;
    this.credit_limit = true;
    this.credit_limit_amount = null;
    this.billing_address_id = '';
    this.shipping_address_id = '';
    this.state_id = '';
    this.email = '';
    this.contact_id= '';
    this.gst_type = '';
    this.created_at = null;
    this.updated_at = null;
    this.html = ''; 
    return this;
  }
}