export class StateModel {
  id: number | null;
  name: string;
  country_id: number;
  status: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  clear() {
    this.id = 0;
    this.name = '';
    this.country_id = 0;
    this.status = 1;
    return this;
  }
}
