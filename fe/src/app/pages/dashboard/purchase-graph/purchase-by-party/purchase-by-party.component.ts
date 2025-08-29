import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexTooltip
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-purchase-by-party',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './purchase-by-party.component.html',
  styleUrls: ['./purchase-by-party.component.scss']
})
export class PurchaseByPartyComponent implements OnChanges {
  @Input() data: any[] = [];
  public chartOptions: ChartOptions = {
    series: [{ name: 'Purchase', data: [] }],
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4
      }
    },
    dataLabels: {
      enabled: true
    },
    xaxis: {
      categories: [],
      title: { text: 'Purchase Amount' }
    },
    tooltip: {
      y: {
        formatter: (val: number) => `₹${val.toFixed(2)}`
      }
    },
    title: {
      text: 'Purchase by Party',
      align: 'center'
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.loadChart();
    }
  }

  loadChart() {
    const categories = this.data.map(item => item.party_name);
    const values = this.data.map(item => Number(item.total));

    this.chartOptions.series = [
      {
        name: 'Purchase',
        data: values
      }
    ];
    this.chartOptions.xaxis = {
      categories: categories,
      title: { text: 'Purchase Amount' }
    };
  }
}
