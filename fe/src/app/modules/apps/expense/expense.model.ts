export class ExpenseModel {
  id: number | null;
  type: number;
  amount:number;
  notes:string

  constructor() {
    this.id = null;
    this.type = 0;
    this.amount=0;
    this.notes=""
  }

  clear() {
    this.id = null;
    this.type = 0;
    this.amount=0;
    this.notes=""
    return this;
  }
}
