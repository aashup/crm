import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';


export class HttpUtils {

  constructor() { }

  static toHttpParams(obj: any): HttpParams {
    return this.addToHttpParams(new HttpParams(), obj, '');
  }

  private static addToHttpParams(params: HttpParams, obj: any, prefix: string): HttpParams {
    for (const p in obj) {
      if (obj.hasOwnProperty(p)) {
        var k = p;
        if (prefix) {
          if (p.match(/^-{0,1}\d+$/)) {
            k = prefix + "[" + p + "]";
          } else {
            k = prefix + "." + p;
          }
        }
        var v = obj[p];
        if (v !== null && typeof v === "object" && !(v instanceof Date)) {
          params = this.addToHttpParams(params, v, k);
        } else if (v !== undefined) {
          if (v instanceof Date) {
            params = params.set(k, (v as Date).toISOString()); //serialize date as you want
          }
          else {
            params = params.set(k, v);
          }

        }
      }
    }
    return params;
  }
}

