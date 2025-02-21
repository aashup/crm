export class CityModel {
  id: number | null;
  name: string;
  state_id: number | null;
  country_id: number | null;
  status: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  clear() {
    this.name = '';
    this.state_id = null;
    this.country_id = null
    this.status = 1;
    return this;
  }
}
