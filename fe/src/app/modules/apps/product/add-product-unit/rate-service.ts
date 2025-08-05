import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RateModal } from './rate-modal';
import { HttpUtils } from 'src/app/modules/core/http-util';


export interface RateResponse {
  data: RateModal;
  status: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class RateService {

readonly endpoint = 'tax-rate';

    constructor(
        private http: HttpClient,
    ) { }

    find(params = {}) {
        return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}`, {
            params: HttpUtils.toHttpParams(params)
        })
    }

    get(items: { id: any; with: any }) {
        return this.http.get<RateResponse>(`${environment.API_ENDPOINT}/${this.endpoint}/${items.id}`, {
          params: HttpUtils.toHttpParams(items)
      })
    }

    update(items: { id: any; [key: string]: any; }) {
        return this.http.put<RateResponse>(`${environment.API_ENDPOINT}/${this.endpoint}/${items.id}`, items)
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
