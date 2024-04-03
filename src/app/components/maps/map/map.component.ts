// @ts-nocheck
import { Component, AfterViewInit, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
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
    private api: ApiService
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

    this.initInfoControl()

    this.map.addLayer(this.postalLayer4)

    this.map.fitBounds(this.postalLayer4.getBounds())
  }

  private initLayer(data: any): any {
    const layer = L.geoJSON(data, {
      style: (feature) => ({
        weight: 1,
        opacity: 0.5,
        color: '#008f68',
        fillOpacity: 0.8,
        fillColor: '#6DB65B',
      }),

      onEachFeature: (feature, layer) => (
        layer.bindPopup(''),
        layer.on({
          mouseover: (e) => (this.highlightFeature(e)),
          mouseout: (e) => (this.resetFeature(e)),
          click: (e) => {
            // this.drill(e)
          }
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
      </div>` : 'Bewegen Sie den Mauszeiger über einen Staat'
    }

    this.infoHandler.addTo(this.map)
  }

  private highlightFeature(e: any) {
    const layer = e.target;

    layer.setStyle({
      weight: 1,
      opacity: 1.0,
      color: '#DFA612',
      fillOpacity: 1.0,
      fillColor: '#FAE042',
    });

    this.infoHandler.update(layer.feature.properties);

    layer.bringToFront()
  }

  private resetFeature(e: any) {
    const layer = e.target;

    layer.setStyle({
      weight: 1,
      opacity: 0.5,
      color: '#008f68',
      fillOpacity: 0.8,
      fillColor: '#6DB65B'
    });

    this.infoHandler.update()
  }

  private setShapes() {
    this.shapeService.getPostalCodeShapes4(GermanStates[this.stateFilter].name).subscribe(result => {
      this.postalLayer4 = this.initLayer(result)
    });

    this.shapeService.getPostalCodeShapes3(GermanStates[this.stateFilter].name).subscribe(result => {
      this.postalLayer3 = this.initLayer(result)
    });

    this.shapeService.getPostalCodeShapes2(GermanStates[this.stateFilter].name).subscribe(result => {
      this.postalLayer2 = this.initLayer(result)
    });

    this.shapeService.getDistrictShapes(GermanStates[this.stateFilter].name).subscribe(result => {
      this.districtLayer = this.initLayer(result)
    })
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

  /**
   * 
   * Lifecycle Hooks
   * 
   */

  ngOnChanges(changes: SimpleChanges) {
    if (changes['levelSettings'].currentValue.levelValues !== 'Gesamt') {
      this.setMapDate(changes['levelSettings'].currentValue)
    }

    if (!changes['layerType'].previousValue) return

    this.switchLayers(changes['layerType'])
  }

  ngOnInit(): void {
    if (this.map) {
      this.map.remove()
      return
    }

    this.setShapes()
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
