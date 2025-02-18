export class CountryModel {
  id: number | null;
  name: string;
  status: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  clear() {
    this.id = null;
    this.name = '';
    this.status = 1;
    this.created_at = new Date();
    this.updated_at = new Date();
    return this;
  }
}
