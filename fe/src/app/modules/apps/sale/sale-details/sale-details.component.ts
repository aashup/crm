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
  address:any[]=[]
  states:any[]=[]
  products:any[]=[]
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
    this.getAllProducts()
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
  printInvoice(): void {
    const printContent = document.getElementById('print-section')?.innerHTML;
    if(printContent)
    this.commonService.printHtmlContent(printContent)
  }
  
  ngOnDestroy(): void {}
  ngAfterViewInit(): void {
    this.spinnerService.hide()
  }
}
