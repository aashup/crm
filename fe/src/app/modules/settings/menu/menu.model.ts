export class MenuModel {
  'id': number | null;
  'title': string;
  'description': string;
  'root': number;
  'icon': string;
  'page': string;
  'parent_id': number | null;
  'order_by': number;
  name: any;
  status: any;
  country_id: any;
  state_id: any;

  clear() {
      this.id = null;
      this.title = '';
      this.description = '';
      this.root = 1;
      this.icon = '';
      this.page = '';
      this.parent_id = null;
      this.order_by = 1;
      return this;
  }
}
