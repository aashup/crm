import { Component } from '@angular/core';
import { ApexChart, NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-sales-by-channel',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './sales-by-channel.component.html',
  styleUrl: './sales-by-channel.component.scss'
})
export class SalesByChannelComponent {
  constructor(){ }
  salesByChannelData = [2469, 823, 5761, 292, 4115];
  salesByChannelOptions: ApexChart = {
    type: 'pie',
    height: 350
  };

}
