import { Component } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexLegend, ApexNonAxisChartSeries, ApexResponsive, ApexStroke, ApexTitleSubtitle, ApexXAxis, NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-purchase-graph',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './purchase-graph.component.html',
  styleUrl: './purchase-graph.component.scss'
})
export class PurchaseGraphComponent {
  constructor() {}
  public monthlyTrendsSeries: ApexAxisChartSeries = [
    {
      name: 'Electronics',
      data: [150, 180, 200, 170, 250, 300, 310, 330, 370, 400, 420, 480]
    },
    {
      name: 'Groceries',
      data: [100, 110, 130, 120, 140, 160, 150, 155, 170, 180, 190, 210]
    },
    {
      name: 'Clothing',
      data: [90, 100, 80, 120, 130, 140, 145, 160, 175, 185, 200, 220]
    }
  ];

  public monthlyTrendsChart: ApexChart = {
    type: 'line',
    height: 350
  };

  public xAxis: ApexXAxis = {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };

  public chartTitle: ApexTitleSubtitle = {
    text: 'Monthly Purchase Trends - 2025',
    align: 'center'
  };

  public stroke: ApexStroke = {
    width: 3
  };

  public dataLabels: ApexDataLabels = {
    enabled: false
  };

  public legend: ApexLegend = {
    position: 'top'
  };

  // Pie Chart - Category Distribution
  public pieChartSeries: ApexNonAxisChartSeries = [44, 33, 23];
  public pieChartLabels = ['Electronics', 'Groceries', 'Clothing'];

  public pieChartDetails: ApexChart = {
    type: 'donut',
    width: 380
  };

  public pieResponsive: ApexResponsive[] = [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  ];

  public pieTitle: ApexTitleSubtitle = {
    text: 'Overall Purchase Distribution',
    align: 'center'
  };
}
