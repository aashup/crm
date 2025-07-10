import { Component, ViewChild } from '@angular/core';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import ApexCharts from 'apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexXAxis } from 'ng-apexcharts';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: false
})
export class DashboardComponent {
  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel'
  };
  @ViewChild('modal') private modalComponent: ModalComponent;
  constructor() {}
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

  // Actual Sales vs Target Data
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

  // Sales by Region Data
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

  // Sales by Channel Data
  salesByChannelData = [2469, 823, 5761, 292, 4115];
  salesByChannelOptions: ApexChart = {
    type: 'pie',
    height: 350
  };

  // Inventory Days Outstanding Data
  inventoryDaysData = [42];
  inventoryDaysOptions: ApexChart = {
    type: 'radialBar',
    height: 350
  };

  // Receivable Days Outstanding Data
  receivableDaysData = [32];
  receivableDaysOptions: ApexChart = {
    type: 'radialBar',
    height: 350
  };

  // X-Axis Categories
  chartXAxis: ApexXAxis = {
    categories: ['Product 1', 'Product 2', 'Product 3', 'Product 4', 'Product 5']
  };
  async openModal() {
    return await this.modalComponent.open();
  }
}
