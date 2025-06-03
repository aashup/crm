import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ProductModel } from '../product.model';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-complete',
  standalone: false,
  templateUrl:'./complete.component.html',
  styleUrl: './complete.component.scss'
})
export class CompleteComponent  implements AfterViewInit, OnInit, OnDestroy {
  @Input() form!: FormGroup;
   @Input() product: ProductModel;
   @Input() next: () => void;
   @Input() prev: () => void;
   @Input() unitDetails: any;
   @Input() inventoryDetails: any;
   @Input() sellerDetails: any;
  constructor() {}

ngOnInit(): void {
  
    console.log(this.form);
    
}

submit() {
    console.log('Product Details:', this.product);
    console.log('Unit Details:', this.unitDetails);
    console.log('Inventory Details:', this.inventoryDetails);
    console.log('Seller Details:', this.sellerDetails);
    this.next && this.next();
  }
  ngAfterViewInit(): void {
    
  }

  ngOnDestroy(): void {
   
  }

}
