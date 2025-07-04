import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpUtils } from 'src/app/modules/core/http-util';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductUnitService {

readonly endpoint = 'product';

    constructor(
        private http: HttpClient,
    ) { }

    find(pid: number, params = {}) {
        return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/${pid}/product-unit`, {
            params: HttpUtils.toHttpParams(params)
        })
    }

    get(pid: number, items: { id: any; with: any }) {
        return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/${pid}/product-unit/${items.id}`, {
          params: HttpUtils.toHttpParams(items)
      })
    }

    update(pid: number,unit_id="", items: any) {
        return this.http.put(`${environment.API_ENDPOINT}/${this.endpoint}/${pid}/product-unit/${unit_id}`, items)
    }

    create(pid: number, dummy:any,items: {[key: string]: any}) {
        return this.http.post(`${environment.API_ENDPOINT}/${this.endpoint}/${pid}/product-unit`, items)
    }

    delete(pid: number, items: { id: any; }) {
        return this.http.delete(`${environment.API_ENDPOINT}/${this.endpoint}/${pid}/product-unit/${items.id}`)
    }

    /** UI */
  getItemCssClassByStatus(status: number = 0): string {
    switch (status) {
      case 0:
        return 'metal';
      case 1:
        return 'success';
      case 2:
        return 'danger';
    }
    return '';
  }

  getItemStatusString(status: number = 0): string {
    switch (status) {
      case 0:
        return 'Inactive';
      case 1:
        return 'Active';
      case 2:
        return 'Suspend';
    }
    return '';
  }
}
