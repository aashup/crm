export class RateModal {
    id: number | null;
    rate:number;
    type: number;
    is_active: boolean;

    clear() {
      this.id=null
      this.rate=0;
      this.type=0;
      this.is_active=true;
      return this;
    }
  }