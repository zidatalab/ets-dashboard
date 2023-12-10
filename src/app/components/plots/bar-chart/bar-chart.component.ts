import { Component, OnInit, Input, } from '@angular/core';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})

export class BarChartComponent {
  // public lineChartOptions: ChartOptions<'line'> = {
  //   responsive: true
  // };
  
  @Input() data: any = { }
  @Input() options: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    animation: false
  }
  @Input() labels: any = []
  @Input() hasLegend : boolean = false

  constructor() { }
}
