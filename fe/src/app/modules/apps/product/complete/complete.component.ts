import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { CommonService } from 'src/app/modules/core/common.service';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UnitConversionDatasource } from 'src/app/modules/settings/unit-conversion/unitconversion.datasource';
@Component({
  selector: 'app-complete',
  standalone: false,
  templateUrl: './complete.component.html',
  styleUrl: './complete.component.scss',
})
export class CompleteComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() form: FormGroup;
  @Input() next: () => void;
  @Input() prev: () => void;
   @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('sort1', { static: true }) sort: MatSort;
    @ViewChild('searchElementRef', { static: true }) searchElementRef: ElementRef;
  filter: any = {};
  search: any = { all: '' };
  productId: number ;
  units: any[] = [];
  sellers: any[] = [];
  productInfo: any;
  unitInfo: any;
  inventoryInfo: any;
  sellerInfo: any;
  unitConversionInfo: any;
  unitName: 'Unknown';
  sellerName: string = 'Unknown';
  unitDisplayedColumns: string[] = ['unit', 'sale_price', 'purchase_price', 'status', 'notes'];
  inventoryDisplayedColumns: string[] = ['unit', 'qty', 'rem_qty', 'sale_price', 'purchase_price', 'status', 'notes'];
  unitConversionDisplayedColumns: string[] = ['from', 'to', 'factor', 'description', 'status'];
  ucDataSource: UnitConversionDatasource
  constructor(
    private unitService: UnitService,
    private cdr: ChangeDetectorRef,
    private commonService:CommonService,
    private router: Router,
  
  ) {}
  findUnitById(id: string): any {
    return this.units.find((unit) => unit.id === id);
  }

  getAllUnits() {
    this.unitService.find({}).subscribe((result: any) => {
      this.units = result.data;
    });
  }
  findSellerById(id: string): any {
    return this.sellers.find((seller) => seller.id === id);
  }

  
  ngOnInit(): void {
   
    this.getAllUnits();
    this.productInfo = this.form.value.productInfo;
    this.unitInfo = this.form.value.unitInfo;
    this.inventoryInfo = this.form.value.inventoryInfo;
    this.sellerInfo = this.form.value.sellerInfo;
    this.unitConversionInfo = this.form.value.unitConversionInfo;
    this.cdr.detectChanges();
  }

  navigateToProduct() {
    this.router.navigate(['/app/product']);
  }

  submit() {
    const printContents = document.getElementById('printContent')?.innerHTML;
    if (printContents) {
      this.commonService.printHtmlContent(printContents)
    }
  }
  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}
}
