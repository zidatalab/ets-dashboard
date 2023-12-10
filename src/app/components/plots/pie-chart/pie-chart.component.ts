import { Component, OnInit, Input, Output, EventEmitter, ContentChild, ViewChild } from '@angular/core';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})

export class PieChartComponent {
  // public lineChartOptions: ChartOptions<'line'> = {
  //   responsive: true
  // };

  @Input() data: any = { }
  @Input() options: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    animation : false,
    maintainAspectRatio: false,
    // aspectRatio: 1.45, 
    plugins: {
      legend: {
        position: 'right'
      }
    }
  }
  @Input() labels: any = []
  @Input() hasLegend : boolean = false

  constructor() { }
}
