import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-add-product',
  standalone: false,
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss'
})
export class AddProductComponent implements OnInit, AfterViewInit,OnDestroy {
  @Input() form: FormGroup;
  constructor(){

  }
  ngOnInit(): void {
    
  }
  ngAfterViewInit(): void {
    
  }
  ngOnDestroy(): void {
    
  }

}
