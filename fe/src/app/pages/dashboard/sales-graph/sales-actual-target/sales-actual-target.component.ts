import { Component } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-sales-actual-target',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './sales-actual-target.component.html',
  styleUrl: './sales-actual-target.component.scss'
})
export class SalesActualTargetComponent {
  constructor(){}
  actualSalesData: ApexAxisChartSeries = [
    {
      name: 'Actual >= 100% of Target',
      data: [1210, 1500, 1676, 197, 1100, 1400]
    },
    {
      name: 'Actual < 100% of Target',
      data: [800, 1200, 1400, 1600, 1800, 2000]
    },
    {
      name: 'Target',
      data: [1000, 1400, 1600, 1900, 2100, 2400]
    }
  ];

  actualSalesOptions: ApexChart = {
    type: 'bar',
    height: 350
  };
  chartXAxis: ApexXAxis = {
    categories: ['Product 1', 'Product 2', 'Product 3', 'Product 4', 'Product 5']
  };
}
