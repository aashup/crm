import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, OnDestroy,
  OnInit
} from '@angular/core';
import _ from 'lodash';
import { SpinnerService } from 'src/app/services/spinner.service';
import { ActivatedRoute } from '@angular/router';
import { SaleDetailsService } from './sale-details-service';
import { CommonService } from 'src/app/modules/core/common.service';
import { ProductService } from '../../product/product.service';
import { AddressService } from 'src/app/modules/settings/address/address.service';
import { StateService } from 'src/app/modules/settings/state/state.service';
import { CountryService } from 'src/app/modules/settings/country/country.service';

@Component({
  selector: 'app-sale-details',
  templateUrl: './sale-details.component.html',
  styleUrl: './sale-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,  
})
export class SaleDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  saleId: string | null = null;
  saleDetails: any;
  address:any[]
  states:any[]
  constructor(
    private cdr: ChangeDetectorRef,
    private commonService: CommonService,
    private spinnerService: SpinnerService,
    private route: ActivatedRoute,
    private productService:ProductService,
    private saleDetailsService:SaleDetailsService,
    private addressService:AddressService,
    private stateService:StateService,
  ) {}
  ngOnInit(): void {
    this.saleId = this.route.snapshot.paramMap.get('id');
    if (this.saleId) {
      this.saleDetailsService.findById(this.saleId,{
        "pageSize": 10,
        "with": ["saleDetails","contact","unit","createdby"],
        "page": 1,
        "cols": []
    }).subscribe(
        (data:any) => {
          this.saleDetails = data.data;
          console.log('Sale Details:', this.saleDetails);
          this.cdr.detectChanges();
          this.spinnerService.hide()
        },
        (error) => {
          console.error('Error fetching sale details:', error);
          this.spinnerService.hide()
        }
      );
    }
  }
  printInvoice(): void {
    const printContent = document.getElementById('print-section')?.innerHTML;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow && printContent) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { text-align: center; }
              p { margin: 5px 0; }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }
  
  ngOnDestroy(): void {}
  ngAfterViewInit(): void {
    this.spinnerService.hide()
  }
}
