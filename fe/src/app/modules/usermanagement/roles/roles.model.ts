export class RolesModel {
  id: number | null;
  name: string;
  status: number;
  guard_name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
 

	

  clear() {
    this.name = '';
    this.status = 1;
    this.guard_name
    return this;
  }
}
