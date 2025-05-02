import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpUtils } from "./http-util";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FindService {

  readonly endpoint = 'find';

  constructor(
      private http: HttpClient,
  ) { }

  findContactTypes(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/contact-types`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  getRoles(): Observable<any> {
    return this.http.get(`${environment.API_ENDPOINT}/role`);
  }

  findPremise(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/premise`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findPremisesForMap(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/premises-for-map`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findSystemType(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/system-type`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findUniqueSystemType(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/unique-system-type`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findAhjProducts(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/ahj-products`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findPremiseAhjSystemTypes(params = {}){
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/premise-ahj-system-type`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findPremiseContacts(params = {}){
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/premise-contacts`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findPremiseAhjOccupancyType(params = {}){
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/premise-ahj-occupancy-type`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findPremiseSystemTypesWithoutAdded(params = {}){
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/premise-system-types-without-added`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findPremiseOccupancyTypeWithoutAdded(params = {}){
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/premise-occupancy-type-without-added`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findSystemTypeMapping(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/system-type-mapping`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findOccupancy(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/occupancy-type`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findAhj(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/ahj`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findAhjLabels(params = {}){
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/ahj-labels`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findAhjUsers(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/ahj-users`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findAhjGeofenceZones(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/ahj-geofence-zones`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findPremiseGeofence(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/premise-geofence`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findPremiseGeoPins(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/premise-geopins`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findPremiseCoordinates(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/premise-coordinates`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findPremisesForGeofence(params = {}){
    return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/premises-for-ahj-geofence`, {
      params: HttpUtils.toHttpParams(params)
    })
  }

  findSystemGeoPins(params = {}){
    return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/system-geo-pins`, {
      params: HttpUtils.toHttpParams(params)
    })
  }

  findCompany(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/company`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  city(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/city`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  state(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/state`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  country(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/country`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  inspector(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/inspector`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  reportType(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/report-type`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  hazmatCertificate(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/hazmat-certificate`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  inspectionReport(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/inspection-report`, {
          params: HttpUtils.toHttpParams(params)
      })
  }

  findProduct(params = {}) {
      return this.http.get(`${environment.API_ENDPOINT}/${this.endpoint}/product`, {
          params: HttpUtils.toHttpParams(params)
      })
  }
}
