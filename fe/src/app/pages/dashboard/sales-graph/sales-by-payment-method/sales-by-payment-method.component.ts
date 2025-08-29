import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexLegend
} from 'ng-apexcharts';

@Component({
  selector: 'app-sales-by-payment-method',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './sales-by-payment-method.component.html',
  styleUrls: ['./sales-by-payment-method.component.scss']
})
export class SalesByPaymentMethodComponent implements OnChanges {
  @Input() data: any[] = [];

  // chart data
  chartSeries: ApexNonAxisChartSeries = [];
  chartLabels: string[] = [];
  chartOptions: ApexChart = {
    type: 'donut',
    height: 350
  };
  chartResponsive: ApexResponsive[] = [
    {
      breakpoint: 480,
      options: {
        chart: { width: 300 },
        legend: { position: 'bottom' }
      }
    }
  ];
  chartLegend: ApexLegend = {
    position: 'right',
    offsetY: 0,
    height: 230
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.prepareChartData();
    }
  }

  private prepareChartData() {
    const methodMap: Record<number, string> = {
      1: 'Cash',
      2: 'Online',
      3: 'Split'
    };

    this.chartSeries = this.data.map(d => parseFloat(d.total));
    this.chartLabels = this.data.map(d => methodMap[d.payment_method] || 'Other');
  }
}
