import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class OAuth2Service {
  constructor(private oauthService: OAuthService) {}

  initLoginFlow() {
    this.oauthService.initLoginFlow();
  }

  handleCallback() {
    this.oauthService.tryLogin();
  }

  getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }

  // getUserInfo(): Observable<any> {
  //   return this.oauthService.loadUserProfile();
  // }

  logout() {
    this.oauthService.logOut();
  }
}
