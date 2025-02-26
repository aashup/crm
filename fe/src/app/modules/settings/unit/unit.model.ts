export class UnitModel {
  id: number | null;
  name: string| null;
  status: number;

  clear() {
      this.id = null;
      this.name = null;
      this.status = 1;
      return this;
  }
}
