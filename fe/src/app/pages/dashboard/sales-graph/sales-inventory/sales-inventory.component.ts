import { Component } from '@angular/core';
import { ApexChart, NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-sales-inventory',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './sales-inventory.component.html',
  styleUrl: './sales-inventory.component.scss'
})
export class SalesInventoryComponent {
  constructor() {}
  inventoryDaysData = [42];
  inventoryDaysOptions: ApexChart = {
    type: 'radialBar',
    height: 350
  };
}
