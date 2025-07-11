import { Component } from '@angular/core';
import { ApexChart, NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-sales-receivable',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './sales-receivable.component.html',
  styleUrl: './sales-receivable.component.scss'
})
export class SalesReceivableComponent {
  constructor(){}
  receivableDaysData = [32];
  receivableDaysOptions: ApexChart = {
    type: 'radialBar',
    height: 350
  };
}
