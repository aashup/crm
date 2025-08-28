import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ApexOptions,
  NgApexchartsModule
} from 'ng-apexcharts';

@Component({
  selector: 'app-sales-product',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './sales-product.component.html',
  styleUrls: ['./sales-product.component.scss']
})
export class SalesProductComponent implements OnChanges {
  @Input() data: any[] = [];
  salesByProductOptions: ApexOptions = {
    series: [],
    chart: {
      type: 'bar',
      height: 0,
      toolbar: { show: true }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 1,
        borderRadiusApplication: 'end'
      }
    },
    dataLabels: {
      enabled: true
    },
    xaxis: {
      categories: []
    },
    tooltip: {
      y: { formatter: (val) => `${val}` }
    },
    responsive: []
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.updateChart(this.data || []);
    }
  }

  private updateChart(apiData: any[]) {
    const categories = apiData.map(d => d?.product_name ?? 'Unknown');
    const totalSales = apiData.map(d => Number(d?.total_sales) || 0);
    const totalQty = apiData.map(d => Number(d?.total_qty) || 0);

    this.salesByProductOptions = {
      ...this.salesByProductOptions,
      series: [
        { name: 'Total Sales', data: totalSales },
        { name: 'Quantity', data: totalQty }
      ],
      xaxis: { categories }
    };
  }
}
