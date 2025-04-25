export class ContactModel {
  id: number;
  name: string;
  mob1: string | null;
  mob2?: string | null;
  status: number;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: string | null;
  clear() {
    this.name = '';
    this.mob1 = null;
    this.mob2 = null;
    this.status = 1;
    this.created_by = null;
    this.created_at = new Date();
    this.updated_at = new Date();
    this.deleted_at = null;
    return this;
  }
}
