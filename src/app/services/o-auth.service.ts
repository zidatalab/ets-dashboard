import { Injectable } from "@angular/core";
import Keycloak from "keycloak-js";

export interface UserProfile {
  sub: string;
  email: string;
  given_name: string;
  family_name: string;
  token: string;
}

@Injectable({ providedIn: "root" })
export class OAuthService {
  _keycloak: Keycloak | undefined;
  profile: UserProfile | undefined;

  get keycloak() {
    if (!this._keycloak) {
      this._keycloak = new Keycloak({
        url: "https://auth.zi.de",
        realm: "dashboardsso",
        clientId: "ets_reporting_test",
      });
    }
    return this._keycloak;
  }

  async init() {
    const authenticated = await this.keycloak.init({
      onLoad: "check-sso",
      silentCheckSsoRedirectUri:
        window.location.origin + "/assets/silent-check-sso.html",
      enableLogging: true,
      checkLoginIframe: false,
      flow: "standard",
    });

    if (!authenticated) {
      return authenticated;
    }

    this.profile =
      (await this.keycloak.loadUserInfo()) as unknown as UserProfile;
    this.profile.token = this.keycloak.token || "";

    return true;
  }

  login() {
    return this.keycloak.login();
  }

  isAuthenticated() {
    console.log(this.keycloak)
    return this.keycloak.token
  }

  logout() {
    return this.keycloak.logout({ redirectUri: "http://localhost:4200" });
  }
}