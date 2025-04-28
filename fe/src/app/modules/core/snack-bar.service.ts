import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class SnackBarService {
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  durationInSeconds = 10;

  constructor(private _snackBar: MatSnackBar) {}

  openSnackBar(
    message: string,
    action_type: string = 'success',
    action: string = 'Dismiss'
  ) {
    this._snackBar.open(message, action, {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
      panelClass: [this.getBgColor(action_type), 'text-white'],
    });
  }
  
  getBgColor(type:string){
    let typeArr = {'success': 'ts-bg-primary','error': 'ts-bg-warn','info': 'ts-bg-accent'};
    return _.get(typeArr, type);
  }
}
