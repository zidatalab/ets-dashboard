import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class ShapeService {

  constructor(
    private http: HttpClient
  ) { }

  getPostalCodeShapes4(state: string) {
    return this.http.get(`https://s3zide.obs.eu-de.otc.t-systems.com/geojson/kv_plz4_${state}.geojson`);
  }

  getPostalCodeShapes3(state: string) {
    return this.http.get(`https://s3zide.obs.eu-de.otc.t-systems.com/geojson/kv_plz3_${state}.geojson`);
  }

  getPostalCodeShapes2(state: string) {
    return this.http.get(`https://s3zide.obs.eu-de.otc.t-systems.com/geojson/kv_plz2_${state}.geojson`);
  }

  getDistrictShapes(state: string) {
    return this.http.get(`https://s3zide.obs.eu-de.otc.t-systems.com/geojson/kv_kreise_${state}.geojson`);
  }
}
