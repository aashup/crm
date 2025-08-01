export class PartiesModel {
  id: number | null;
  name: string;
  gstin: string;
  mobile: string;
  opening_balance: number | null;
  opening_balance_date: string | null; // or Date if you're using DatePicker
  credit_limit: boolean;
  credit_limit_amount: number | null;
  billing_address: string;
  state_id: string;
  email: string;
  gst_type:string
  created_at: Date | null;
  updated_at: Date | null;

  constructor() {
    this.id = null;
    this.name = '';
    this.gstin = '';
    this.mobile = '';
    this.opening_balance = null;
    this.opening_balance_date = null;
    this.credit_limit = true;
    this.credit_limit_amount = null;
    this.billing_address = '';
    this.gst_type=""
    this.state_id = '';
    this.email = '';
    this.created_at = null;
    this.updated_at = null;
  }

  clear() {
    this.name = '';
    this.gstin = '';
    this.mobile = '';
    this.opening_balance = null;
    this.opening_balance_date = null;
    this.credit_limit = true;
    this.credit_limit_amount = null;
    this.billing_address = '';
    this.state_id = '';
    this.email = '';
    this.gst_type=""
    this.created_at = null;
    this.updated_at = null;
    return this;
  }
}
