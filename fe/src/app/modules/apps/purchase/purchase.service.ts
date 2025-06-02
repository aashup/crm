import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HttpUtils } from '../../core/http-util';

@Injectable({
    providedIn: 'root'
})
export class PurchaseService {
    readonly endpoint = 'purchase';

    constructor(
        private http: HttpClient,
    ) { }

    find(params = {}) {
        return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}`, {
            params: HttpUtils.toHttpParams(params)
        })
    }

    update(items: { id: any; }) {
        return this.http.put(`${environment.API_ENDPOINT}/${this.endpoint}/${items.id}`, items)
    }

    create(items: any) {
        return this.http.post(`${environment.API_ENDPOINT}/${this.endpoint}`, items)
    }

    delete(items: { id: any; }) {
        return this.http.delete(`${environment.API_ENDPOINT}/${this.endpoint}/${items.id}`)
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
