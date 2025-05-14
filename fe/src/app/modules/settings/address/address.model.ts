export class AddressModel {
id	:string|number
address	:string|null
pin	:string|null
mob1	:string	|null
mob2	:string	|null
type	:string|null
city?: { id: number; name: string }
created_by: { id: number; name: string } | null
status	:number|null

  clear() {
    this.id = ""
    this.address = null;
    this.pin = null;
    this.mob1 = null;
    this.mob2 = null;
    this.type = null;
    this.created_by = null;
    this.city = { id: 0, name: "" };
    this.status = 0;
  }
}
