import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class SaleDetailsService {
  private endpoint = 'sale';

  constructor(private http: HttpClient) {}

  findById(saleId: string,payload:any) {
    let params = new HttpParams();
    Object.keys(payload).forEach((key) => {
      if (Array.isArray(payload[key])) {
        payload[key].forEach((value: string) => {
          params = params.append(`${key}[]`, value); 
        });
      } else {
        params = params.append(key, payload[key]); 
      }
    });
    return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/${saleId}`,{params})
  }
}
