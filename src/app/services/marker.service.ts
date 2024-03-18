import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';

import { PopupService } from './popup.service';

@Injectable({
  providedIn: 'root'
})
export class MarkerService {
  capitals: string = 'assets/data/germany_states.json';

  constructor(
    private http: HttpClient,
    private popupService: PopupService
  ) { }

  static scaledRadius(val: number, maxVal: number): number {
    return 20 * (val / maxVal);
  }

  makeCapitalMarkers(map: L.Map): void {
    this.http.get(this.capitals).subscribe((res: any) => {
      for (const capital of res) {
        const lon = capital.coords.lon;
        const lat = capital.coords.lat;
        const marker = L.marker([lat, lon]);

        marker.addTo(map);
      }
    });
  }

  makeCapitalCircleMarkers(map: L.Map): void {
    this.http.get(this.capitals).subscribe((res: any) => {
      const maxPop = Math.max(...res.map((x : any) => x.population), 0);

      for (const capital of res) {
        const lon = capital.coords.lon;
        const lat = capital.coords.lat;
        const circle = L.circleMarker([lat, lon], {
          radius: MarkerService.scaledRadius(capital.population, maxPop)
        });
        circle.bindPopup(this.popupService.makeCapitalPopup(capital));

        circle.addTo(map);
      }
    });
  }
}
