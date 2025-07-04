import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ProductModel } from '../product.model';
import { FormGroup } from '@angular/forms';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { set } from 'lodash';
import { ProductSellerService } from '../product-seller/product-seller.service';

@Component({
  selector: 'app-complete',
  standalone: false,
  templateUrl:'./complete.component.html',
  styleUrl: './complete.component.scss'
})
export class CompleteComponent  implements AfterViewInit, OnInit, OnDestroy {
  @Input() form!: FormGroup;
  units: any[] = [];
  sellers: any[] = [];
  productInfo: any ;
  unitInfo:any;
  inventoryInfo:any;
  sellerInfo:any;
  unitName:"Unknown" 
  sellerName: string = "Unknown";
  constructor(
    private  unitService: UnitService,
    private sellerService: ProductSellerService,
    private cdr: ChangeDetectorRef
  ) {}
  findUnitById(id: string): any {
    return this.units.find((unit) => unit.id === id);
  }

  getAllUnits(){
    this.unitService.find({}).subscribe((result:any) => {
      this.units = result.data;      
    });
  }
  findSellerById(id: string): any {
    return this.sellers.find((seller) => seller.id === id);
  }

  getAllSellers(){
    // this.sellerService.getAll().subscribe((result:any) => {
    //   this.sellers = result.data;      
    // });
  }
ngOnInit(): void {
  console.log("final details", this.form.value);
  
  this.getAllUnits() 
  this.productInfo = this.form.get('productInfo');
  this.unitInfo = this.form.get('unitInfo');
  this.inventoryInfo = this.form.get('inventoryInfo');
  this.sellerInfo = this.form.get('sellerInfo');
  
  this.form.valueChanges.subscribe((value) => {
    this.productInfo = value.productInfo;
    this.unitInfo = value.unitInfo;
    this.inventoryInfo = value.inventoryInfo;
    this.sellerInfo = value.sellerInfo;
  }
  );

  this.form.markAsPristine();
  this.form.markAsUntouched();
  this.form.markAsPending();
  this.form.updateValueAndValidity();
  this.form.disable();
  this.form.get('productInfo')?.disable();
  this.form.get('unitInfo')?.disable();
  this.form.get('inventoryInfo')?.disable();
  this.form.get('sellerInfo')?.disable();
  setTimeout(()=>{
    console.log(this.findUnitById(this.unitInfo.unit_id).name);
    this.unitName= this.findUnitById(this.unitInfo.unit_id).name
    this.sellerName = this.findSellerById(this.sellerInfo.seller_id).name;
    this.cdr.detectChanges();
  },1000)
  this.cdr.detectChanges();
}

submit() {
    console.log('Product Details:', this.form.value.productInfo);
    console.log('Unit Details:', this.form.value.unitInfo);
    console.log('Inventory Details:', this.form.value.inventoryInfo);
    console.log('Seller Details:', this.form.value.sellerInfo);
    
  }
  ngAfterViewInit(): void {
      
  }

  ngOnDestroy(): void {
   
  }

}
