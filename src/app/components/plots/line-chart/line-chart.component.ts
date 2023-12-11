import { Component, OnInit, Input, Output, EventEmitter, ContentChild, ViewChild } from '@angular/core';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent {
  // public lineChartOptions: ChartOptions<'line'> = {
  //   responsive: true
  // };

  @Input() data: any = { }
  @Input() options: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    animation: false,
    scales: {     
    
    
  }
  }
  @Input() labels: any = []
  @Input() hasLegend : boolean = false

  constructor() { }
}
