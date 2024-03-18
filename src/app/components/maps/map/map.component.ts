import { Component, AfterViewInit, Input } from '@angular/core';
import { ShapeService } from 'src/app/services/shape.service';

import * as L from 'leaflet'
import { MarkerService } from 'src/app/services/marker.service';

const iconRetinaUrl = 'assets/marker-icon.png';
const iconUrl = 'assets/marker-icon.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  constructor(
    private shapeService: ShapeService,
    private markerService: MarkerService
  ) { }

  @Input() data: any = []

  private map: any = null
  private states: any = null

  private initMap(): void {
    this.map = L.map('map', {
      center: [51.138, 10.657],
      zoom: 7,
      maxZoom: 7,
    })

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 7,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

  private highlightFeature(e: any) {
    const layer = e.target;

    layer.setStyle({
      weight: 10,
      opacity: 1.0,
      color: '#DFA612',
      fillOpacity: 1.0,
      fillColor: '#FAE042'
    });
  }

  private resetFeature(e: any) {
    const layer = e.target;

    layer.setStyle({
      weight: 3,
      opacity: 0.5,
      color: '#008f68',
      fillOpacity: 0.8,
      fillColor: '#6DB65B'
    });
  }

  private initStatesLayer() {
    const stateLayer = L.geoJSON(this.states, {
      style: (feature) => ({
        weight: 3,
        opacity: 0.5,
        color: '#008f68',
        fillOpacity: 0.8,
        fillColor: '#6DB65B'
      }),
      onEachFeature: (feature, layer) => (
        layer.bindPopup(''),
        layer.on({
          mouseover: (e) => (this.highlightFeature(e)),
          mouseout: (e) => (this.resetFeature(e)),
          click: (e) => {
            console.log(this.data)
          }
        })
      )
      
    });

    this.map.addLayer(stateLayer);
    stateLayer.bringToBack();
  }

  setPostalCodeShape() {
    this.shapeService.getStateShapes().subscribe((states: any) => {
      this.states = states;
      this.initStatesLayer();
    })
  }

  ngAfterViewInit(): void {
    this.initMap()
    // this.markerService.makeCapitalCircleMarkers(this.map);
    this.shapeService.getStateShapes().subscribe(states => {
      this.states = states;
      this.initStatesLayer();
    });
  }

}
