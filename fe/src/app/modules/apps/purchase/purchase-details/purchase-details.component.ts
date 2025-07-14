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
import { PurchaseDetailsService } from './purchase-details-service';
import { CommonService } from 'src/app/modules/core/common.service';
import { ProductService } from '../../product/product.service';
import { AddressService } from 'src/app/modules/settings/address/address.service';
import { StateService } from 'src/app/modules/settings/state/state.service';

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
  address:any[]=[]
  states:any[]=[]
  products:any[]=[]
  purchaseDetails: any;
  constructor(
    private cdr: ChangeDetectorRef,
    private commonService: CommonService,
    private spinnerService: SpinnerService,
    private route: ActivatedRoute,
    private productService:ProductService,
    private purchaseDetailsService:PurchaseDetailsService,
    private addressService:AddressService,
    private stateService:StateService
  ) {}
  ngOnInit(): void {
  this.getAllAddress()
    this.getAllState()
    this.getAllProducts()
    this.purchaseId = this.route.snapshot.paramMap.get('id');
    if (this.purchaseId) {
      this.spinnerService.show()
      this.purchaseDetailsService.findById(this.purchaseId,{
        "pageSize": 10,
        "with": ["purchaseDetails","contact","unit","supplier"],
        "page": 1,
        "cols": []
    }).subscribe(
        (data:any) => {
          this.purchaseDetails = data.data;
          console.log('purchase Details:', this.purchaseDetails);
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
  
  getAllProducts(){
    this.productService.find().subscribe((res:any)=>{
      console.log("products",res.data);
      
      this.products=res.data
    })
  }
  getProductByid(id:string){
    if(id&&this.products.length)
      return this.products.find(product => product.id === id) ;
  }
  getAllAddress(){
    this.addressService.find({
      
      "with": ["city"],
      "page": 1,
      "cols": []
  }).subscribe((res:any)=>{
      console.log(res.data);
      this.address=res.data
      this.cdr.detectChanges();
    })
  }
  getAllState(){
    this.stateService.find({
      "with":["country"]
    }).subscribe((res:any)=>{
      console.log(res.data);
      this.states=res.data
      this.cdr.detectChanges();
    })
  }
  getStateById(id: string): any {
    if(id&&this.states.length)
    return this.states.find(state => state.id === id) ;
  }
  getAddressById(id:string){
    if(id&&this.address.length)
    return this.address.find((addr)=>addr.id===id)
  }
  printInvoice(): void {
    const printContents = document.getElementById('invoice-section')?.innerHTML;
    const originalContents = document.body.innerHTML;
  
    if (printContents) {
     this.commonService.printHtmlContent(printContents)
    }
  }
  ngOnDestroy(): void {}
  ngAfterViewInit(): void {}
}
