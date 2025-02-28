import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { getCSSVariableValue } from '../../../../../kt/_utils';

@Component({
  selector: 'app-stats-widget3',
  templateUrl: './stats-widget3.component.html',
})
export class StatsWidget3Component implements OnInit {
  @Input() title = '';
  @Input() color = '';
  @Input() description = '';
  @Input() change = '';
  @ViewChild('chartRef', { static: true }) chartRef: ElementRef;
  height: number;

  chartOptions: any = {};
  labelColor: string;
  baseColor: string;
  lightColor: string;

  constructor() {}

  ngOnInit(): void {
    this.height = 150;
    this.labelColor = getCSSVariableValue('--bs-gray-800');
    this.baseColor = getCSSVariableValue('--bs-' + this.color);
    this.lightColor = getCSSVariableValue('--bs-' + this.color + '-light');
  }
}

