import { Component } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-sales-by-region',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './sales-by-region.component.html',
  styleUrl: './sales-by-region.component.scss'
})
export class SalesByRegionComponent {
  constructor(){

  }
  salesByRegionData: ApexAxisChartSeries = [
    {
      name: 'Actual',
      data: [5567, 4115, 3977, 4772]
    },
    {
      name: 'Target',
      data: [5761, 4938, 4159, 5000]
    }
  ];

  salesByRegionOptions: ApexChart = {
    type: 'bar',
    height: 350
  };
  chartXAxis: ApexXAxis = {
    categories: ['Product 1', 'Product 2', 'Product 3', 'Product 4', 'Product 5']
  };

}
