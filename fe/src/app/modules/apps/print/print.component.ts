import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerService } from 'src/app/services/spinner.service';
import { CommonService } from 'src/app/modules/core/common.service';
import { DirectSaleService } from '../direct-sale/direct-sale.service';
import { SaleDetailsService } from '../sale/sale-details/sale-details-service';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss']
})
export class PrintComponent implements OnInit, AfterViewInit {
  @ViewChild('receiptContent') receiptContent!: ElementRef;

  saleId: number;
  saleData: any = null;
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private service: DirectSaleService,
    private spinner: SpinnerService,
    private commonService: CommonService,
    private saleService: SaleDetailsService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.saleId = +this.route.snapshot.paramMap.get('id')!;
    if (this.saleId) {
      this.fetchSaleDetails();
    } else {
      this.commonService.toastr.error('Invalid sale ID.');
    }
  }

  ngAfterViewInit(): void {  
    setTimeout(() => {
      if (this.saleData) {
        this.printInvoice();
      }
    }, 200); 
  }

  fetchSaleDetails(): void {
    this.isLoading = true;
    this.spinner.show();

    this.saleService.findById(this.saleId + '', {
      with: ['saleDetails.product', 'contact', 'saleDetails.unit', 'createdby']
    }).subscribe({
      next: (res: any) => {
        this.saleData = res.data;
        this.isLoading = false;
        this.spinner.hide();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.spinner.hide();
        console.error('Error fetching sale data:', err);
        this.commonService.toastr.error('Failed to load sale details.');
      }
    });
  }

  printInvoice(): void {
    const printContents = document.getElementById('receiptContent')?.innerHTML;  
    if (printContents) {
     this.commonService.printHtmlContent(printContents,"/app/sale")
    }
  }
}
