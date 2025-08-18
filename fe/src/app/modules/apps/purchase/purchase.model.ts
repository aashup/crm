export class PurchaseDetail {
  product_id: number | null;
  product_name: string | null;
  transaction_id: string | null;
  unit_id: number | null;
  unit_name: string | null;

  quantity: number;
  price_per_unit: number;

  discount_amount: number;
  purchase_price_tax_type: number;
  purchase_price_discount_type: number;

  tax_rate: number | null;
  tax_amount: number;

  amount: number;
  net: number;

  constructor() {
    this.product_id = null;
    this.product_name = null;
    this.unit_id = null;
    this.unit_name = null;
    this.quantity = 1;
    this.price_per_unit = 0;
    this.discount_amount = 0;
    this.purchase_price_tax_type = 2;
    this.purchase_price_discount_type = 1;
    this.tax_rate = null;
    this.tax_amount = 0;
    this.amount = 0;
    this.net = 0;
  }
}

export class PurchaseModel {
  id: number | null;
  party_id: number | null;
  mobile: string | null;
  name: string | null;
  unit_id: number | null;

  amount: number;
  discount_amount: number;
  discount_type: number;
  net_total: number;

  notes: string | null;
  status: number;

  payment_method: number;
  cash_amount: number | null;
  online_amount: number | null;
  transaction_id: string | null;

  purchaseDetails: PurchaseDetail[];

  created_at: Date | null;
  updated_at: Date | null;

  constructor() {
    this.id = null;
    this.party_id = null;
    this.mobile = null;
    this.name = null;
    this.unit_id = null;

    this.amount = 0;
    this.discount_amount = 0;
    this.discount_type = 1;
    this.net_total = 0;

    this.notes = null;
    this.status = 1;

    this.payment_method = 1;
    this.cash_amount = null;
    this.online_amount = null;
    this.transaction_id = null;

    this.purchaseDetails = [new PurchaseDetail()];

    this.created_at = null;
    this.updated_at = null;
  }

  clear() {
    this.id = null;
    this.party_id = null;
    this.mobile = null;
    this.name = null;
    this.unit_id = null;

    this.amount = 0;
    this.discount_amount = 0;
    this.discount_type = 1;
    this.net_total = 0;

    this.notes = null;
    this.status = 1;

    this.payment_method = 1;
    this.cash_amount = null;
    this.online_amount = null;
    this.transaction_id = null;

    this.purchaseDetails = [new PurchaseDetail()];

    this.created_at = null;
    this.updated_at = null;

    return this;
  }
}
