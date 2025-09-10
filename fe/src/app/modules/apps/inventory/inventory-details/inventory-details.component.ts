import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, OnDestroy,
  OnInit
} from '@angular/core';
import _ from 'lodash';
import { SpinnerService } from 'src/app/services/spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/modules/core/common.service';
import { InventoryDetailsService } from './inventory-details-service';


@Component({
  selector: 'app-inventory-details',
  templateUrl: './inventory-details.component.html',
  styleUrl: './inventory-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,  
})
export class InventoryDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  inventoryId: string | null = null;
  inventoryDetails: any;
  address:any[]=[]
  states:any[]=[]
  products:any[]=[]
  today = new Date();
  constructor(
    private cdr: ChangeDetectorRef,
    private commonService: CommonService,
    private spinnerService: SpinnerService,
    private route: ActivatedRoute,
    private inventoryDetailsService:InventoryDetailsService,
    private router:Router
   
  ) {}
  ngOnInit(): void {
    this.inventoryId = this.route.snapshot.paramMap.get('id');
    if (this.inventoryId) {
      this.inventoryDetailsService.findById(this.inventoryId,{
      with:['product','unit']
    }).subscribe(
        (data:any) => {
          this.inventoryDetails = data.data;
          console.log(data);
          
          this.cdr.detectChanges();
          this.spinnerService.hide()
        },
        (error:any) => {
          console.error('Error fetching Inventory details:', error);
          this.spinnerService.hide()
        }
      );
    }
  }
  goBack(){
    this.router.navigate(["/app/inventory"])
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
