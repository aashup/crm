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
import { SaleDetailsService } from './sale-details-service';
import { ProductService } from '../product/product.service';

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
  constructor(
    private cdr: ChangeDetectorRef,
    private commonService: CommonService,
    private spinnerService: SpinnerService,
    private route: ActivatedRoute,
    private productService:ProductService,
    private saleDetailsService:SaleDetailsService
  ) {}
  ngOnInit(): void {
  
    this.spinnerService.show()
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
