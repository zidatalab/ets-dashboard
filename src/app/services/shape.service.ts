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

  getDistrictShapes() {
    return this.http.get('/assets/data/germany-administrative-municipality.geojson');
  }
}
