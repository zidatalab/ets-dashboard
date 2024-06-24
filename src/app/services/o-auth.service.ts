import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
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
  constructor(private router: Router) { }

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
      checkLoginIframe: true,
      flow: "standard",
    });

    if (authenticated) {
      this.profile =
        (await this.keycloak.loadUserInfo()) as unknown as UserProfile;
      this.profile.token = this.keycloak.token || "";

      this.setProfile(this.profile)

      return true;
    }

    return authenticated
  }

  async loadUserProfile() {
    this.profile =
      (await this.keycloak.loadUserInfo()) as unknown as UserProfile;
    this.profile.token = this.keycloak.token || ""

    return this.profile;
  }

  handleAuthCallback(): void {
    this.init()
  }

  setProfile(profile: any) {
    localStorage.setItem("oAuthProfile", JSON.stringify(profile))
  }

  getProfile() {
    return JSON.parse(localStorage.getItem("oAuthProfile") || '')
  }

  login() {
    this.keycloak.login();
  }

  checkLoginState() {
    this.init().then((authenticated) => {
      const profile = this.getProfile()
      this.router.navigate(['/'])
      return
    }).catch((error) => {
      console.error('Error during authentication:', error);
    });
  }

  isAuthenticated() {
  }

  logout() {
    localStorage.removeItem("oAuthProfile")
    return this.keycloak.logout({ redirectUri: "http://localhost:4200" });
  }
}