export class StateModel {
  id: number | null;
  name: string;
  country_id: number;
  status: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  clear() {
    this.id = null;
    this.name = '';
    this.country_id = 0;
    this.status = 1;
    this.created_at = new Date();
    this.updated_at = new Date();
  }
}
