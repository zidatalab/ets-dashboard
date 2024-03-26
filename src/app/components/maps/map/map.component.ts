import { Component, AfterViewInit, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet'

import { ShapeService } from 'src/app/services/shape.service';
import { MarkerService } from 'src/app/services/marker.service';

const GermanStates: any = {
  SchleswigHolstein: {
    name: "Schleswig-Holstein",
    SN_L: "01",
    center: [54.45, 9.4]
  },
  Hamburg: {
    name: "Hamburg",
    SN_L: "02",
    center: [53.55, 10]
  },
  Niedersachsen: {
    name: "Niedersachsen",
    SN_L: "03",
    center: [52.45, 9.45]
  },
  Bremen: {
    name: "Bremen",
    SN_L: "04",
    center: [53.08, 8.8]
  },
  Nordrhein: {
    name: "Nordrhein-Westfalen",
    SN_L: "05",
    center: [51.45, 7.9]
  },
  'Westfalen-Lippe': {
    name: "Nordrhein-Westfalen",
    SN_L: "05",
    center: [51.45, 7.9]
  },
  Hessen: {
    name: "Hessen",
    SN_L: "06",
    center: [50.65, 9.1]
  },
  'Rheinland-Pfalz': {
    name: "Rheinland-Pfalz",
    SN_L: "07",
    center: [50.35, 7.35]
  },
  'Baden-Württemberg': {
    name: "Baden-Württemberg",
    SN_L: "08",
    center: [48.85, 9.2]
  },
  Bayern: {
    name: "Bayern",
    SN_L: "09",
    center: [48.8, 11.55]
  },
  Saarland: {
    name: "Saarland",
    SN_L: "10",
    center: [49.35, 7.05]
  },
  Berlin: {
    name: "Berlin",
    SN_L: "11",
    center: [52.52, 13.4]
  },
  Brandenburg: {
    name: "Brandenburg",
    SN_L: "12",
    center: [52.45, 12.55]
  },
  'Mecklenburg-Vorpommern': {
    name: "Mecklenburg-Vorpommern",
    SN_L: "13",
    center: [53.6, 12.1]
  },
  Sachsen: {
    name: "Sachsen",
    SN_L: "14",
    center: [51.1, 13.2]
  },
  'Sachsen-Anhalt': {
    name: "Sachsen-Anhalt",
    SN_L: "15",
    center: [52.12, 11.7]
  },
  Thüringen: {
    name: "Thüringen",
    SN_L: "16",
    center: [50.98, 11.02]
  }
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  constructor(
    private shapeService: ShapeService,
    private markerService: MarkerService
  ) { }

  @Input() stateFilter: string = ''
  @Input() layerType: any = null
  @Input() data: any = []

  private map: any = null
  private stateLayer: any = null
  private postalLayer: any = null
  private districtLayer: any = null
  private interval: any = null

  private initMap(): void {
    this.map = L.map('map', {
      center: [GermanStates[this.stateFilter].center[0], GermanStates[this.stateFilter].center[1]],
      zoom: 8,
      minZoom: 7,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.map.addLayer(this.postalLayer)

    this.map.fitBounds(this.stateLayer.getBounds())
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
  }

  private initLayer(data: any, filter: Function) {
    const layer = L.geoJSON(data, {
      style: (feature) => ({
        weight: 1,
        opacity: 0.5,
        color: '#008f68',
        fillOpacity: 0.8,
        fillColor: '#6DB65B',
      }),

      filter: (feature) => {
        return filter(feature)
      },

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

  countryShape() {
    this.shapeService.getCountryShapes().subscribe(result => {
      this.stateLayer = this.initLayer(result, (feature: any) => {
        // lan_name
        return feature.properties.lan_name[0] === GermanStates[this.stateFilter].name
      });
    });
  }

  postalShape() {
    this.shapeService.getPostalCodeShapes().subscribe(result => {
      this.postalLayer = this.initLayer(result, (feature: any) => {
        // lan_code
        return feature.properties.SN_L === GermanStates[this.stateFilter].SN_L
      });
    });
  }

  districtShape() {
    this.shapeService.getDistrictShapes().subscribe(result => {
      this.districtLayer = this.initLayer(result, (feature: any) => {
        return feature.properties.lan_name[0] === GermanStates[this.stateFilter].name
      });
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['layerType'].previousValue) return

    this.switchLayers(changes['layerType'])
  }

  switchLayers(changes: any) {
    if (changes.previousValue !== changes.currentValue) {
      // @ts-ignore
      this.removeAndAddLayers(this[changes.currentValue])
    }
  }

  removeAndAddLayers(layer: any) {
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.GeoJSON) {
        this.map.removeLayer(layer)
      }
    })

    this.map.addLayer(layer)
  }

  ngOnInit(): void {
    if (this.map) {
      this.map.remove()
      return
    }

    this.postalShape()
    this.countryShape()
    this.districtShape()
  }

  ngAfterViewInit(): void {
    if (!this.stateLayer && !this.postalLayer) {
      this.interval = setInterval(() => {
        if (this.stateLayer && this.postalLayer) {
          this.initMap()
          clearInterval(this.interval);
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
