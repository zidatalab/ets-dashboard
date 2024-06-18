import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OAuthService {
  public clientId = 'ets_reporting_test';
  public redirectUri = 'http://localhost:4200/home' //'https://auth.zi.de/';

  constructor(private _http: HttpClient) { }

  retrieveToken(code: any) {
    let params = new URLSearchParams()
    params.append('code', code)
    params.append('client_id', this.clientId)
    params.append('redirect_uri', this.redirectUri)
    params.append('grant_type', 'authorization_code')

    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })

    this._http.post('https://auth.zi.de/auth/realms/baeldung/protocol/openid-connect/token',
      params.toString(), { headers: headers })
      .subscribe(
        data => this.saveToken(data),
        err => console.log(err)
      )
  }

  saveToken(token: any) {
    // let expiresIn = new Date(new Date().getTime() + token.expires_in * 1000)
    localStorage.setItem('access_token', token.access_token)
    console.log('token saved')
    window.location.href = '/home'
  }

  getResources(resourceUrl: any): Observable<any> {
    let headers = new HttpHeaders({
      'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      'Authorization': 'Bearer' + localStorage.getItem('access_token')
    })

    return this._http.get(resourceUrl, { headers: headers })
  }

  checkCredentials() {
    return localStorage.getItem('access_token');
  }
}
