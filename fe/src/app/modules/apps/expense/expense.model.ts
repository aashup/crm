export class ExpenseModel {
  id: number | null;
  expense_type: string|null;
  amount:number;
  notes:string

  constructor() {
    this.id = null;
    this.expense_type =null;
    this.amount=0;
    this.notes=""
  }

  clear() {
    this.id = null;
    this.expense_type = null;
    this.amount=0;
    this.notes=""
    return this;
  }
}
