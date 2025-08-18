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
import { CommonService } from 'src/app/modules/core/common.service';
import { PurchaseDetailsService } from './purchase-details-service';

@Component({
  selector: 'app-purchase-details',
  templateUrl: './purchase-details.component.html',
  styleUrl: './purchase-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,  
})
export class PurchaseDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  purchaseId: string | null = null;
  purchaseDetails: any;
  address:any[]=[]
  states:any[]=[]
  products:any[]=[]
  today = new Date();
  constructor(
    private cdr: ChangeDetectorRef,
    private commonService: CommonService,
    private spinnerService: SpinnerService,
    private route: ActivatedRoute,
    private purchaseDetailsService:PurchaseDetailsService,
   
  ) {}
  ngOnInit(): void {
    this.purchaseId = this.route.snapshot.paramMap.get('id');
    if (this.purchaseId) {
      this.purchaseDetailsService.findById(this.purchaseId,{
        "pageSize": 10000,
        "with": ["purchaseDetails.product","party","party.billingAddress.city.state","purchaseDetails.unit","createdby"],
        "page": 1,
        "cols": []
    }).subscribe(
        (data:any) => {
          this.purchaseDetails = data.data;
          console.log('Purchase Details:', this.purchaseDetails);
          this.cdr.detectChanges();
          this.spinnerService.hide()
        },
        (error) => {
          console.error('Error fetching Purchase details:', error);
          this.spinnerService.hide()
        }
      );
    }
  }
 

  printInvoice(): void {
    const printContent = document.getElementById('print-section')?.innerHTML;
    if(printContent)
    this.commonService.printHtmlContent(printContent)
  }
  
  calculatePricePerUnit(qty: number, total: number, taxAmount: number, discountAmount: number): number {
    if (qty <= 0) throw new Error('Quantity must be greater than zero.');
  
    const subtotalAfterDiscount = total - taxAmount;
    const subtotalBeforeDiscount = subtotalAfterDiscount + discountAmount;
    const pricePerUnit = subtotalBeforeDiscount / qty;
  
    return parseFloat(pricePerUnit.toFixed(2));
  }
  
  calculateDiscountPercentage(total: number, taxAmount: number, discountAmount: number): number {
    const discountedPrice = total - taxAmount;
    const originalPrice = discountedPrice + discountAmount;
    return parseFloat(((discountAmount / originalPrice) * 100).toFixed(2));
  }
  
  calculateTaxPercentage(total: number, taxAmount: number): number {
    const discountedPrice = total - taxAmount;
    return parseFloat(((taxAmount / discountedPrice) * 100).toFixed(2));
  }

  ngOnDestroy(): void {}
  ngAfterViewInit(): void {
    this.spinnerService.hide()
  }
}
