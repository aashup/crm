import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, OnDestroy,
  OnInit
} from '@angular/core';
import _ from 'lodash';
import { CommonService } from '../../core/common.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { ActivatedRoute } from '@angular/router';
import { PurchaseDetailsService } from './purchase-details-service';
import { ProductService } from '../product/product.service';

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
  constructor(
    private cdr: ChangeDetectorRef,
    private commonService: CommonService,
    private spinnerService: SpinnerService,
    private route: ActivatedRoute,
    private productService:ProductService,
    private saleDetailsService:PurchaseDetailsService
  ) {}
  ngOnInit(): void {
  
    this.spinnerService.show()
    this.purchaseId = this.route.snapshot.paramMap.get('id');
    if (this.purchaseId) {
      this.saleDetailsService.findById(this.purchaseId,{
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
  getProductByid(id:string){
    let name=""
    console.log(id);
    this.productService.get({id:id,with:[]}).subscribe(res=>{
      return res.data.name
    })  
  }
  ngOnDestroy(): void {}
  ngAfterViewInit(): void {}
}
