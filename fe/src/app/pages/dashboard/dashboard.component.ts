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
  
  async openModal() {
    return await this.modalComponent.open();
  }
}
