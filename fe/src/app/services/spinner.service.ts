import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  constructor(private spinner: NgxSpinnerService) {}

  // Spinner ko show karne ke liye method
  show(): void {
    this.spinner.show();
  }

  // Spinner ko hide karne ke liye method
  hide(): void {
    this.spinner.hide();
  }
}