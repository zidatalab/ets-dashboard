import { Component, OnInit, Input, Output, EventEmitter, ContentChild, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartOptions, ChartType } from "chart.js";
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent {
  // public lineChartOptions: ChartOptions<'line'> = {
  //   responsive: true
  // };

  /**
   * data object construction
   * 
   * datasets: [{
      data: [],
    }], 
   */
  @Input() data: any = { }
  @Input() options: any = {
    scaleShowVerticalLines: false,
    responsive: true
  }
  @Input() labels: any = []

  constructor() { }
}
