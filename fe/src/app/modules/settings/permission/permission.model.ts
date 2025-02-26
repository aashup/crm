export class PermissionModel {
  id: number | null;
  name: string| null;
  slug: string;
  status: number;

  clear() {
      this.id = null;
      this.name = null;
      this.slug = '';
      this.status = 1;
      return this;
  }
}
