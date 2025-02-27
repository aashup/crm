export class ProductModel {
  id: number | null;
  name: string;
  status: number;
  slug: string;
  type: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  clear() {
    this.name = '';
    this.slug = '';
    this.status = 1;
    return this;
  }
}
