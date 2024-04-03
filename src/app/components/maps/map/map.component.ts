// @ts-nocheck
import { Component, AfterViewInit, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import * as L from 'leaflet'

import { ShapeService } from 'src/app/services/shape.service';
import { MarkerService } from 'src/app/services/marker.service';

import { GermanStates } from './helpers/dataHelper'
import { ApiService } from 'src/app/services/api.service';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})

export class MapComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  constructor(
    private shapeService: ShapeService,
    private markerService: MarkerService,
    private api: ApiService,
    private changeDetect: ChangeDetectorRef
  ) { }

  @Input() stateFilter: string = ''
  @Input() layerType: any = null
  @Input() levelSettings: any = null

  private map: any = null
  private postalLayer4: any = null
  private postalLayer3: any = null
  private postalLayer2: any = null
  private districtLayer: any = null
  private interval: any = null
  private infoHandler = L.control.layers()
  private infoContainer: any = null
  private data: any = null
  private isDataLoading: boolean = false
  private colorGrade: any = null

  private initMap(): void {
    this.map = L.map('map', {
      center: [GermanStates[this.stateFilter].center[0], GermanStates[this.stateFilter].center[1]],
      zoom: 8,
      minZoom: 7,
      zoomControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    if (this.data) {
      this.generateGrades()
    }

    this.initInfoControl()
    this.generateLegend()

    this.map.addLayer(this.postalLayer4)

    this.map.fitBounds(this.postalLayer4.getBounds())
  }

  private initLayer(data: any): any {
    const layer = L.geoJSON(data, {
      style: (feature) => ({
        weight: 1,
        opacity: 0.5,
        color: this.getColor(feature?.properties),
        fillOpacity: 0.8,
        fillColor: this.getColor(feature?.properties),
      }),

      onEachFeature: (feature, layer) => (
        layer.bindPopup(''),
        layer.on({
          mouseover: (e) => (this.highlightFeature(e)),
          mouseout: (e) => (this.resetFeature(e)),
        })
      )
    });

    return layer
  }

  private initInfoControl() {
    this.infoHandler.onAdd = () => {
      this.infoContainer = L.DomUtil.create('div', 'info-container')
      this.infoHandler.update()
      return this.infoContainer
    }

    this.infoHandler.update = (props: any) => {
      let plz4Data = null

      if (this.data && props) {
        plz4Data = this.data.find(item => item.angebot_group_plz4 === props.plz4)
      }

      this.infoContainer.innerHTML = props ? `<div class="info-content">
        <h4>Gebiet: ${props.plz4}</h4>
        <p>Wert: ${plz4Data ? plz4Data.angebot_Anzahl : 'Keine Daten vorhanden'}</p>
      </div>` : 'Bewegen Sie den Mauszeiger über einen Bereich'
    }

    this.infoHandler.addTo(this.map)
  }

  private highlightFeature(e: any) {
    const layer = e.target;

    layer.setStyle({
      weight: 1,
      opacity: 1.0,
      fillOpacity: 1.0,
    });

    this.infoHandler.update(layer.feature.properties);

    layer.bringToFront()
  }

  private resetFeature(e: any) {
    const layer = e.target;

    layer.setStyle({
      weight: 1,
      opacity: 0.5,
      fillOpacity: 0.8,
    });

    this.infoHandler.update()
  }

  private setShapes() {
    this.shapeService.getPostalCodeShapes4(GermanStates[this.stateFilter].name).subscribe(result => {
      console.log('plz4')
      this.postalLayer4 = this.initLayer(result)
    });

    // this.shapeService.getPostalCodeShapes3(GermanStates[this.stateFilter].name).subscribe(result => {
    //   console.log('plz3')
    //   this.postalLayer3 = this.initLayer(result)
    // });

    // this.shapeService.getPostalCodeShapes2(GermanStates[this.stateFilter].name).subscribe(result => {
    //   this.postalLayer2 = this.initLayer(result)
    // });

    // this.shapeService.getDistrictShapes(GermanStates[this.stateFilter].name).subscribe(result => {
    //   this.districtLayer = this.initLayer(result)
    // })

    this.generateGrades()
  }

  private switchLayers(changes: any) {
    if (changes.previousValue !== changes.currentValue) {
      this.removeAndAddLayers(this[changes.currentValue])
    }
  }

  private removeAndAddLayers(layer: any) {
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.GeoJSON) {
        this.map.removeLayer(layer)
      }
    })

    this.map.addLayer(layer)
  }

  private async setMapDate(levelSettings: any) {
    this.isDataLoading = true

    let query: any = {
      'client_id': 'ets_reporting',
      'groupinfo': {
        'level': 'KV',
        "fg": levelSettings['fg'],
        'levelid': levelSettings['levelValues'],
        'timeframe': 'upcoming_monthly_plz4',
      },
      "showfields": ["stats_angebot", "stats_nachfrage"]
    }

    const { data: result }: any = await this.api.postTypeRequestWithoutObs('get_data/', query);

    this.data = this.processMapData(result, levelSettings)
  }

  private processMapData(result: any, levelSettings: any) {
    // Process result data
    const innerResult = result[0]['stats_angebot']
    const filteredResult = innerResult.filter(item => {
      return item['angebot_group_dringlichkeit'] === levelSettings['urgency']
    })

    return this.groupSum(filteredResult)
  }

  private groupSum(data: any) {
    const result = [];

    data.reduce(function (res, value) {
      if (!res[value.angebot_group_plz4]) {
        res[value.angebot_group_plz4] = {
          angebot_group_plz4: value.angebot_group_plz4,
          angebot_Anzahl: 0,
          angebot_group_dringlichkeit: value.angebot_group_dringlichkeit,
          angebot_group_status: value.angebot_group_status,
          angebot_reference_date: value.angebot_reference_date
        };

        result.push(res[value.angebot_group_plz4])
      }
      res[value.angebot_group_plz4].angebot_Anzahl += value.angebot_Anzahl;
      return res;
    }, {});

    return result
  }

  private generateLegend() {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend'),
        grades = this.colorGrade

      const last = grades[grades.length - 1];

      div.innerHTML += `Legende: Anzahl <br>`;

      for (let i = 0; i < grades.length - 1; i++) {
        const current = grades[i];
        const next = grades[i + 1];

        div.innerHTML += `<i style="background:${current.color}"></i> ${current.value} - ${next.value} <br>`
      }

      div.innerHTML += `<i style="background:${last.color}"></i> ${last.value} +`;

      return div;
    }

    legend.addTo(this.map)
  }

  private setColor() {
    const colors = [];
    const startHue = 200;
    const endHue = 300;
    const numColors = 11;
    const hueStep = (endHue - startHue) / (numColors - 1);

    for (let i = 0; i < numColors; i++) {
      const hue = startHue + i * hueStep;

      colors.push(`hsl(${hue}, 100%, 50%)`);
    }

    return colors
  }

  private getColor(value) {
    let gradeValue
    const dataValue = this.data.find(item => item.angebot_group_plz4 === value.plz4)

    if (dataValue) {
      gradeValue = this.colorGrade.find(item => dataValue.angebot_Anzahl <= item.value)

      if(!gradeValue) {
        return 'green'
      }

      if (gradeValue) {
        return gradeValue.color
      }
    }
  }

  private generateGrades() {
    const steps = []
    const values = this.data.map(item => item.angebot_Anzahl);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const step = ((max - min) / 10);
    const colors = this.setColor();

    for (let i = min; i <= max; i += step) {
      steps.push(Number(i.toFixed(0)))
    }

    const stepsWithColors = steps.map((step, index) => {
      return {
        value: step,
        color: colors[index]
      }
    })

    this.colorGrade = stepsWithColors
  }

  /**
   * 
   * Lifecycle Hooks
   * 
   */

  ngOnChanges(changes: SimpleChanges) {
    if (changes['levelSettings'].currentValue.levelValues !== 'Gesamt') {
      this.setMapDate(changes['levelSettings'].currentValue).then(() => {
        this.generateGrades()
      }).then(() => {
        this.setShapes()
      })
    }

    // if (!changes['layerType'].previousValue) return

    // this.switchLayers(changes['layerType'])
  }

  ngOnInit(): void {
    if (this.map) {
      this.map.remove()
      return
    }
  }

  ngAfterViewInit(): void {
    if (!this[this.layerType]) {
      this.interval = setInterval(() => {
        if (this[this.layerType]) {
          if (this.data) {
            this.initMap()
            clearInterval(this.interval);
          }
        }
      }, 100);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    if (this.map) {
      this.map.remove()
    }
  }
}
