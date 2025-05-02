export class UsersModel {
  id: number | null;
  name: string;
  email: string;
  password: string;
  cpassword: string;
  roles: string[];
  status: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
 

	

  clear(): UsersModel { 
    this.id = null;
    this.name = '';
    this.email = '';
    this.password = '';
    this.cpassword = '';
    this.roles = [];
    this.status = 0;
    this.created_at = new Date();
    this.updated_at = new Date();
    this.deleted_at = new Date();
    return this;
  }
}
