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

  async init(): Promise<boolean> {
    const authenticated = await this.keycloak.init({
      onLoad: "check-sso",
      silentCheckSsoRedirectUri:
        window.location.origin + "/assets/silent-check-sso.html",
      enableLogging: true,
      checkLoginIframe: false,
      flow: "standard",
    });

    console.log("authenticated", authenticated);

    if (authenticated) {
      this.profile =
        (await this.keycloak.loadUserInfo()) as unknown as UserProfile;
      this.profile.token = this.keycloak.token || "";

      this.setProfile(this.profile)

      return true;
    }

    return new Promise((resolve, reject) => {
      this.keycloak.login().then(() => {
        console.log("login try");
        resolve(true);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  async loadUserProfile() {
    this.profile =
      (await this.keycloak.loadUserInfo()) as unknown as UserProfile;
    this.profile.token = this.keycloak.token || ""

    return this.profile;
  }

  handleAuthCallback() : void {
    this.keycloak.loadUserInfo().then((profile) => {
      this.profile = profile as unknown as UserProfile;
      this.profile.token = this.keycloak.token || '';
      this.setProfile(this.profile);

      console.log('User is authenticated:', this.profile);
    }).catch((error) => {
      console.error('Error during authentication:', error);
    });
  }

  setProfile(profile: any) {
    localStorage.setItem("oAuthProfile", JSON.stringify(profile))
  }

  getProfile() {
    return localStorage.getItem("oAuthProfile")
  }

  login() {
    return this.keycloak.login();
  }

  isAuthenticated() {
    return this.keycloak.token
  }

  logout() {
    localStorage.removeItem("oAuthProfile")
    return this.keycloak.logout({ redirectUri: "http://localhost:4200" });
  }
}