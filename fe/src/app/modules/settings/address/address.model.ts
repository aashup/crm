export class AddressModel {
  id	:string|number
address	:string|null
pin	:string|null
mob1	:string	|null
mob2	:string	|null
type	:string|null
city_id:string|null
status	:number|null

  clear() {
    this.id = ""
    this.address = null;
    this.pin = null;
    this.mob1 = null;
    this.mob2 = null;
    this.type = null;
    this.city_id = null;
    this.status = 0;
  }
}
