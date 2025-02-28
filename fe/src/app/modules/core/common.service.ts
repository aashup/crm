import { ApplicationRef, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import _ from 'lodash';
import { PageInfoService } from 'src/app/_metronic/layout';
import { FormGroup } from '@angular/forms';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(
    public titleService: Title,
    public toastr: ToastrService,
    public page: PageInfoService,
    public app: ApplicationRef,
    public location: Location,
  ) {}

  public handleError(e: { status: number }) {
    if (e.status == 401) {
      this.toastr.error(
        'Authentication failure from server, You need to login again.'
      );
      location.href = location.href;
      return;
    }
    let error = _.get(e, 'error.errors');
    let msg = '';
    if (_.isString(error)) msg = error;
    if (_.isObject(error))
      _.mapKeys(error, (val: any) => {
        try {
          msg = msg + val.join(',') + '<br>';
        } catch (e) {}
      });
    this.toastr.error(msg || 'Some error occurred.', 'Error', {
      enableHtml: true,
    });
    this.app.tick();
  }

  getReadableFileSizeString(fileSizeInBytes: number) {
    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
      fileSizeInBytes = fileSizeInBytes / 1024;
      i++;
    } while (fileSizeInBytes > 1024);
    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
  }

  saveOfGetData<T>(
    key: string,
    defaultValue = null,
    data = null
  ): Observable<T> {
    let user_id = '1';
    // let user_id = this.token.getUserInfo();
    // user_id = user_id && user_id.id && '1';
    let decoded = null;
    if (data) {
      localStorage.setItem(key + user_id, JSON.stringify(data));
    } else {
      try {
        decoded = JSON.parse(localStorage.getItem(key + user_id) || '');
      } catch (e) {
        console.log(e);
      }
    }
    return of<T>(<T>decoded ? decoded : defaultValue);
  }

  clone(data: any) {
    return _.cloneDeep(data);
  }

  markFormGroupTouched(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control: FormGroup<any>) => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
