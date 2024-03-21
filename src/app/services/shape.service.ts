import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class ShapeService {

  constructor(
    private http: HttpClient
  ) { }

  getGermanyShape() {
    return this.http.get('/assets/data/germany_boundaries.geojson');
  }

  getCountryShapes() {
    return this.http.get('/assets/data/germany-countries.geojson');
  }

  getLocalAuthorityShapes() {
    return this.http.get('/assets/data/germany_local_authorities.geojson');
  }

  getPostalCodeShapes() {
    return this.http.get('/assets/data/germany_simple.geojson');
  }

  getGeoJSON() {
    return this.http.get('https://www.openstreetmap.org/api/0.6/map?bbox=7.154,50.746,7.157,50.748');
  }
}
