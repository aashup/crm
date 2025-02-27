import { UnitModel } from "../../settings/unit/unit.model";

export class ProductDetailsModel {
  id: number | null;
  mrp: number | null;
  status: number;
  comment: string;
  product_id: number | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  clear() {
    this.mrp = null;
    this.product_id = null;
    this.status = 1;
    return this;
  }
}

export class ContactModel {
  id: number | null;
  name: string | null;
  status: number | null;
  mob1: string | null;
  mob2: string | null;
  comment: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  clear() {
    this.name = null;
    this.mob1 = null;
    this.status = 1;
    return this;
  }
}
export class ProductModel {
  id: number | null;
  name: string;
  status: number;
  slug: string;
  type: number;
  comment: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;

  units: UnitModel[]
  clear() {
    this.name = '';
    this.slug = '';
    this.status = 1;
    return this;
  }
}
