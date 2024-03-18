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

  getStateShapes() {
    return this.http.get('/assets/data/germanyGEO.geojson');
  }

  getPostalCodeShapes() {
    return this.http.get('/assets/data/germany_postal_codes.json');
  }
}
