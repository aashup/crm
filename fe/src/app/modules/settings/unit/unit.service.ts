import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HttpUtils } from '../../core/http-util';

@Injectable({
    providedIn: 'root'
})
export class UnitService {
    readonly endpoint = 'unit';

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

}
