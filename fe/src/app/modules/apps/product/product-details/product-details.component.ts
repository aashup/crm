import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import _ from 'lodash';
import { SpinnerService } from 'src/app/services/spinner.service';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/modules/core/common.service';
import { ProductDetailsService } from './product-details-service';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ProductDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  productId: string | null = null;
  product: any;
  units: any[] = [];
  today = new Date();
  constructor(
    private cdr: ChangeDetectorRef,
    private commonService: CommonService,
    private spinnerService: SpinnerService,
    private route: ActivatedRoute,
    private productService: ProductDetailsService,
    private unitService: UnitService
  ) {}
  ngOnInit(): void {
    this.getAllUnits();
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.productService.findById(this.productId, { with: ['units.unit', 'inventory', 'unitConversion'] }).subscribe(
        (data: any) => {
          this.product = data.data;
          this.cdr.detectChanges();
          this.spinnerService.hide();
        },
        (error) => {
          console.error('Error fetching Product details:', error);
          this.spinnerService.hide();
        }
      );
    }
  }
  getAllUnits(): void {
    this.unitService.find({ pageSize: 1000 }).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.units = res.data;
        } else {
          this.units = [];
        }
      },
      error: (err) => {
        console.error('Error while fetching units:', err);
      },
      complete: () => {
        this.cdr.detectChanges();
      },
    });
  }
  
  getUnitNameById(id: number): string {
    const unit = this.units.find(u => u.id === id);
    return unit ? unit.name : 'Unknown Unit';
  }

  ngOnDestroy(): void {}
  ngAfterViewInit(): void {
    this.spinnerService.hide();
  }
}