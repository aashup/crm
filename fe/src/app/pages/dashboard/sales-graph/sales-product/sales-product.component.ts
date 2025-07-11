import { Component } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-sales-product',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './sales-product.component.html',
  styleUrl: './sales-product.component.scss'
})
export class SalesProductComponent {
  constructor() {
  }
  salesByProductData: ApexAxisChartSeries = [
    {
      name: 'Above Target',
      data: [597, 4263, 3405, 379, 87]
    },
    {
      name: 'Below Target',
      data: [200, 1500, 1200, 800, 300]
    },
    {
      name: 'Target',
      data: [3000, 4000, 5000, 6000, 7000]
    }
  ];

  salesByProductOptions: ApexChart = {
    type: 'bar',
    height: 350
  };
  chartXAxis: ApexXAxis = {
    categories: ['Product 1', 'Product 2', 'Product 3', 'Product 4', 'Product 5']
  };

}
