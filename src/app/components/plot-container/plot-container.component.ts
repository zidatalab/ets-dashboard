import { Component, OnInit, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';

import { ApiService } from 'src/app/services/api.service';

/**
 * @deprecated
 * !!! DEPRECATED !!!
 * Do not use - please see folder "plots" working with chartsjs
 */

@Component({
  selector: 'app-plot-container',
  templateUrl: './plot-container.component.html',
  styleUrls: ['./plot-container.component.scss'],
  providers: [PlotlyService]
})

export class PlotContainerComponent implements OnInit {
  @Input() data: any;
  @Input() xValue: string = '';
  @Input() colorBy: string = '';
  @Input() outcomes: any;
  @Input() outcomeLabels: any = [];
  @Input() plotType: string = '';
  @Input() customData: any;
  @Input() customConfig: any;
  @Input() customLayout: any;
  @Input() customMargins: any;
  @Input() lineWidth: number = 0;
  @Input() showLegend: boolean = false;
  @Input() sort: boolean = false;
  @Input() xSort: boolean = false;
  @Input() percent: boolean = false;
  @Input() xPercent: boolean = false;
  @Input() baseColor = "";
  @Input() colorScheme: any = [];
  @Input() annotations: any = [];
  @Input() hoverTemplate = "";
  @Input() plotTitle = "";
  @Input() plotSubtitle = "";
  @Input() plotCaption = "";
  @Input() yTicks = 8;
  @Input() xTickFormat: any = "";
  @Input() xTitle = "";
  @Input() yTitle = "";
  @Input() id = "";
  @Input() divId = "";
  @Input() fontFamily = "Lato, sans-serif";
  @Input() fontSize = ".85rem";
  @Input() fontColor: any = "black";
  @Input() legendBackgroundColor = 'ffffff20';
  @Input() legendXPos = 'right';
  @Input() legendYpos = 1;
  @Input() title: any = ''
  @Input() isAbsoluteNumbers: boolean = false
  @Output() clicked = new EventEmitter<string>();
  @Output() emitAbsoluteNumber = new EventEmitter<string>()

  constructor(
    private api: ApiService
  ) { }

  plotLayout: any
  plotData: any
  mainConfig: any
  localPlotType: string = ''
  clickedValue: any

  ngOnInit(): void {
    if (this.divId === '') {
      this.divId = `plotdiv${Math.round(Math.random() * 1000).toString()}_${Math.round(Math.random() * 1000).toString()}`
    }

    if (!this.lineWidth) {
      this.lineWidth = 2
    }

    if (this.baseColor === '') {
      this.baseColor = this.api.primarycolor
    }

    if (this.colorScheme.length === 0) {
      this.colorScheme = [this.baseColor]
    }

    this.makePlot()
  }

  ngOnChanges() {
    setTimeout(() => {
      this.makePlot()
    }, 0);
  }

  catchClick(input: any) {
    this.clicked.emit(input)
    this.clickedValue = input
  }

  emitIsAbsoluteNumber(event: any) {
    this.emitAbsoluteNumber.emit(event.checked)
  }

  makePlot() {
    this.mainConfig = {
      displayModeBar: false,
      scrollZoom: false,
      autosizable: true,
      locale: 'de-eu',
      locales: {
        'de-eu': {
          format: {
            currency: ['€', ''],
            decimal: ',',
            thousands: '.',
            grouping: [2]
          }
        }
      },
      doubleClick: 'reset',
      showAxisDragHandles: false,
      showAxisRangeEntryBoxes: false,
      showTips: true,
      seperator: ',.'
    }

    if (this.plotType === 'bar') {
      this.plotType = 'bar'
      this.plotLayout = {
        xaxis: { fixedrange: false, type: 'category', automargin: false },
        yaxis: {
          fixedrange: true, title: '', automargin: true, rangemode: 'tozero',
          gridcolor: "lightgrey",
          gridpattern: "dot",
          gridwidth: 1,
          zerolinecolor: this.fontColor,
          zerolinewidth: 2,
          annotations: this.annotations,
          ticksuffix: " ",
          nticks: this.yTicks,
        },
        autosize: true, padding: 0,
        legend: { x: 1, xanchor: this.legendYpos, y: this.legendYpos, bgcolor: this.legendBackgroundColor },
        margin: { l: 0, r: 100, b: 100, t: 0 }, paper_bgcolor: "transparent", plot_bgcolor: "transparent",
        annotations: this.annotations,
      }

      if (this.percent) {
        this.plotLayout.yaxis.ticketformat = ',.1%'
      }
    }

    if (this.plotType === "heatmap") {
      let plotData = this.data;
      const colors = this.api.makeScale(2);

      this.plotType = 'heatmap';
      this.plotLayout = {
        xaxis: { side: 'top' },
        yaxis: { autosize: true },
        autosize: false, padding: 0,
        margin: { l: 50, r: 50, b: 0, t: 50 },
        paper_bgcolor: "transparent", plot_bgcolor: "transparent",
      };

      plotData['type'] = "heatmap";
      plotData['colorscale'] = [
        [0, colors[1].concat('CC')],
        [1, colors[0].concat('CC')]
      ];
      plotData['showscale'] = false;

      this.plotData = [plotData];
    }

    if (this.plotType === "violin") {
      this.plotType = "violin";
      this.plotLayout = {
        xaxis: { fixedrange: false, type: 'category', automargin: false },
        yaxis: { zeroline: false, automargin: true, rangemode: 'tozero', ticksuffix: " " },
        autosize: true, padding: 0,
        legend: { x: 1, xanchor: this.legendYpos, y: this.legendYpos, bgcolor: this.legendBackgroundColor },
        margin: { l: 0, r: 100, b: 100, t: 0 }, paper_bgcolor: "transparent", plot_bgcolor: "transparent",
        annotations: this.annotations
      };

      if (this.percent) {
        this.plotLayout.yaxis.tickformat = ',.1%';
      }
    }

    if (this.plotType === "stackedbar") {
      this.plotType = "bar";
      this.plotLayout = {
        barmode: "stack",
        xaxis: { fixedrange: false, showgrid: false, type: 'category', automargin: false },
        yaxis: {
          fixedrange: true, title: '', autosize: true, automargin: true,
          rangemode: 'tozero', ticksuffix: " ",
          zerolinecolor: this.fontColor,
          zerolinewidth: 2,
          nticks: this.yTicks
        },
        padding: 0,
        legend: { x: 1, xanchor: this.legendYpos, y: this.legendYpos, bgcolor: this.legendBackgroundColor },
        margin: { l: 0, r: 100, b: 100, t: 0 }, paper_bgcolor: "transparent", plot_bgcolor: "transparent",
        annotations: this.annotations
      };
    }

    if (this.plotType === "tsline" || this.plotType === "lines" || this.plotType === "area" ||
      this.plotType === "stackedarea" || this.plotType === 'scatter') {
      this.plotType = "lines";
      this.plotLayout = {
        xaxis: { fixedrange: false, showgrid: false, automargin: false, zeroline: false },
        yaxis: {
          fixedrange: true, title: '', automargin: true, rangemode: 'tozero',
          gridcolor: "lightgrey",
          gridpattern: "dot",
          gridwidth: 1,
          zerolinecolor: this.fontColor,
          zerolinewidth: 2,
          annotations: this.annotations,
          ticksuffix: " ",
          nticks: this.yTicks,
        },

        autosize: true, padding: 0,
        legend: { x: 1, xanchor: this.legendYpos, y: this.legendYpos, bgcolor: this.legendBackgroundColor },
        margin: { l: 0, r: 20, b: 50, t: 0 }, paper_bgcolor: "transparent", plot_bgcolor: "transparent"
      };

      if (this.percent) {
        this.plotLayout.yaxis.tickformat = ',.1%';
      }

      if (this.percent) {
        this.plotLayout.xaxis.tickformat = ',.1%';
      }
    }

    if (this.plotType === "hbar") {
      this.plotType = "hbar";
      this.plotLayout = {
        xaxis: {
          fixedrange: true, showgrid: true, title: '',
          automargin: true, nticks: this.yTicks
        },
        yaxis: {
          fixedrange: false, type: 'category', automargin: true,
          rangemode: 'tozero', ticksuffix: " ",
          zerolinecolor: this.fontColor,
          zerolinewidth: 2
        },
        autosize: true, padding: 0,
        legend: { x: 1, xanchor: this.legendYpos, y: this.legendYpos, bgcolor: this.legendBackgroundColor },
        margin: { l: 200, r: 0, b: 20, t: 0 }, paper_bgcolor: "transparent", plot_bgcolor: "transparent",
        annotations: this.annotations
      };
    }

    if (this.customMargins) {
      this.plotLayout['margin'] = this.customMargins;
    }

    if (this.showLegend) {
      this.plotLayout['showlegend'] = true;
    }

    if (this.xTickFormat !== '') {
      this.plotLayout['xaxis']['tickformat'] = this.xTickFormat;
    }

    // this.plotLayout['font'] = {
    //   family: this.fontFamily,
    //   size: this.fontSize,
    //   color: this.fontColor
    // };

    if (this.xTitle !== "") {
      this.plotLayout['xaxis']['title'] = this.xTitle;
      this.plotLayout['xaxis']['titlefont'] =
      {
        family: this.fontFamily,
        size: this.fontSize,
        color: this.fontColor
      };
    }
    if (this.yTitle !== "") {
      this.plotLayout['yaxis']['title'] = this.yTitle;
      this.plotLayout['yaxis']['titlefont'] =
      {
        family: this.fontFamily,
        size: this.fontSize,
        color: this.fontColor
      };
    }

    if (this.plotType != "heatmap") {
      let plotData = []
      let outcomes = this.outcomes;

      for (let item of this.data) {
        plotData.push(item);
      }

      if (this.sort) {
        plotData = this.api.sortArray(plotData, this.outcomes[0]);
      }

      if (this.xSort) {
        plotData = this.api.sortArray(plotData, this.xValue);
      }

      if (this.colorBy) {
        outcomes = this.api.getUniqueValues(plotData, this.colorBy);

        if (outcomes.length > 1) {
          this.colorScheme = this.api.makeScale(outcomes.length);
        }

        plotData = this.makeColorByValues();
      }

      this.plotData = this.makePlotData(plotData, this.xValue, outcomes, this.plotType);
    };
  }

  makeColorByValues() {
    let newdata = [];
    let inputdata = this.data;
    let colorValues = this.api.getUniqueValues(inputdata, this.colorBy).sort();
    let xValues = this.api.getUniqueValues(inputdata, this.xValue);
    let outcome = this.outcomes[0];

    for (let xvalue of xValues) {
      let toPush: any = {};
      toPush[this.xValue] = xvalue;

      for (let item of colorValues) {
        let dataPoint = this.api.filterArray(this.api.filterArray(inputdata, this.colorBy, item), this.xValue, xvalue)[0];

        if (dataPoint) {
          toPush[item] = dataPoint[outcome];
        }
      }

      newdata.push(toPush);
    }
    return newdata;
  }

  make_trace(xData: any, yData = [], name: string, type = "") {
    let trace: any = {
      x: xData,
      y: yData,
      name: name,
      type: type,
    }

    if (this.plotType === "stackedarea") {
      trace['stackgroup'] = "one";
    }

    return trace;
  }

  makePlotData(source = [], xAxis = "", yList = [], type = "bar", colors = this.colorScheme) {
    let xData: any = this.api.getValues(source, xAxis)
    let list = []
    let i = 0

    for (let name in yList) {
      let data: any = this.api.getValues(source, yList[i]);
      let traceName: any = yList[i];
      let trace = this.make_trace(xData, data, traceName, type = type);

      if (this.outcomeLabels.length === yList.length) {
        traceName = this.outcomeLabels[i];
      }


      if (type === "hbar") {
        trace = this.make_trace(this.api.getValues(source, yList[i]), xData, yList[i], type = "bar")
        trace["orientation"] = "h"
      }

      if (type === "bar" || type === "bar" || type === "scatter") {
        trace["marker"] = {
          color: colors[i]
        }
      }

      if (type === "lines") {
        trace["line"] = {
          color: colors[i],
          width: this.lineWidth * 2
        }
        trace["marker"] = {
          color: colors[i],
          size: this.lineWidth * 5
        }

        trace['name'] = ''
        trace['hovertemplate'] = '%{x} | %{y:.2f}'
      }

      if (this.plotType === "area") {
        trace["fill"] = "tozeroy";
      }

      if (this.plotType === "violin") {
        trace = this.make_trace(name, data, yList[i], type = type);
        trace['x'] = name;
        trace["line"] = {
          color: colors[i],
          width: this.lineWidth
        }
      }

      if (this.plotType === "scatter") {
        trace['mode'] = 'markers';
        trace["marker"] = {
          color: colors[i],
          size: this.lineWidth * 5
        }
        if (this.id != "") {
          trace["text"] = this.api.getValues(source, this.id);
          trace["textfont"] = { family: this.fontFamily };
          if (trace['x'].length < 50) {
            trace['mode'] = 'markers+text';
            trace['textposition'] = 'bottom center';
          }
          else {
            trace['mode'] = 'markers';
          }
        }
      }
      list.push(trace)
      i = i + 1
    }

    return list
  }
}
