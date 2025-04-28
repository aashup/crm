import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { isEmpty } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private _accessToken: string = '';
  private _user: any;
  public _decodedData: any = null

  get accessToken(): string {
    return this._accessToken;
  }

  get isAuth(): boolean {
    if (this._accessToken) {
      return true;
    } else {
      this._decodedData = this.storage.getItem('user-data');
      if (this._decodedData) {
        this.storeToken(this._decodedData, false);
        return true
      }
      return false;
    }
  }

  constructor(
    private storage: StorageService,
  ) { }

  storeToken(data: any, store = true): boolean {
    this._accessToken = data.access_token || ''
    if (store) {
      this._decodedData = data;
      this.storage.setItem('user-data', this._decodedData);
    }
    this._user = this._decodedData.user || {};
    return this._accessToken ? true : false;
  }

  getUserInfo() {
    if (!isEmpty(this._user)) {
      return this._user;
    }
    this._user = this.storage.getItem('user-data')
    return this._user;
  }


  clearToken() {
    this._accessToken = '';
    this._user = null;
    this.storage.removeItem('token');
    // this.storage.removeItem('userInfo');
    this.storage.removeItem('user-data');
  }

}
