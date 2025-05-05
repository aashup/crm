export class PermissionModel {
  id: number | null;
  name: string| null;
  description: string | null;
  guard_name: string | null;
  menu_id: string | null;

  clear() {
      this.id = null;
      this.name = null;
      this.description = null;
      this.guard_name = null;
      return this;
  }
}
