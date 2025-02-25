export class MenuModel {
  id: number | null;
  name: any;
  root: number;
  icon: string;
  page: string;
  parent_id: number | null;
  order_by: number;
  status: number;

  clear() {
      this.id = null;
      this.name = null;
      this.root = 1;
      this.icon = '';
      this.page = '';
      this.parent_id = null;
      this.order_by = 10;
      this.status = 1;
      return this;
  }
}
