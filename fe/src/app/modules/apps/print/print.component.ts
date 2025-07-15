import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpinnerService } from 'src/app/services/spinner.service';
import { CommonService } from 'src/app/modules/core/common.service';
import { DirectSaleService } from '../direct-sale/direct-sale.service';
import { SaleDetailsService } from '../sale/sale-details/sale-details-service';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss']
})
export class PrintComponent implements OnInit {
  @ViewChild('receiptContent') receiptContent!: ElementRef;

  saleId: number;
  saleData: any = null;
  isLoading: boolean = false;
  displayedColumns: string[] = ['productName', 'unitName', 'quantity', 'amount', 'total'];

  constructor(
    private route: ActivatedRoute,
    private service: DirectSaleService,
    private spinner: SpinnerService,
    private commonService: CommonService,
    private saleService: SaleDetailsService,
    private cdr:ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.saleId = +this.route.snapshot.paramMap.get('id')!;
    if (this.saleId) {
      this.fetchSaleDetails();
    } else {
      this.commonService.toastr.error('Invalid sale ID.');
    }
  }

  fetchSaleDetails(): void {
    this.isLoading = true;
    this.spinner.show();

    this.saleService.findById(this.saleId + "", {
      with: ['saleDetails.product', 'contact', 'saleDetails.unit', 'createdby'],
    }).subscribe({
      next: (res: any) => {
        this.saleData = res.data;
        console.log(this.saleData);

        this.isLoading = false;
        this.spinner.hide();
        this.cdr.detectChanges()
      },
      error: (err) => {
        this.isLoading = false;
        this.spinner.hide();
        console.error('Error fetching sale data:', err);
        this.commonService.toastr.error('Failed to load sale details.');
      }
    });
  }

  print() {
    if (!this.receiptContent?.nativeElement) return;

    const printContents = this.receiptContent.nativeElement.innerHTML;
    const popupWin = window.open('', '_blank', 'width=800,height=600');
    if (popupWin) {
      popupWin.document.open();
      popupWin.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              .header { display: flex; justify-content: space-between; align-items: center; }
              .logo { height: 60px; }
              h2, h3 { margin: 0; }
            </style>
          </head>
          <body onload="window.print(); window.close()">
            ${printContents}
          </body>
        </html>
      `);
      popupWin.document.close();
    }
  }
}
