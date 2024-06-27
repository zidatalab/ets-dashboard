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
        clientId: "ets_reporting_2",
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
      console.log('authenticated')
      this.profile = await this.loadUserProfile()

      this.setProfile(this.profile)
      this.router.navigate(['/'])

      return true;
    }

    return authenticated
  }

  login() {
    this.init().then(() => {
        this.keycloak.login();
    })
  }

  async loadUserProfile() {
    this.profile =
      (await this.keycloak.loadUserInfo()) as unknown as UserProfile;
    this.profile.token = this.keycloak.token || "";
    localStorage.setItem('access_token', this.keycloak.token || "");
    localStorage.setItem('refresh_token', this.keycloak.refreshToken || "");

    return this.profile;
  }

  setProfile(profile: any) {
    localStorage.setItem("oAuthProfile", JSON.stringify(profile))
    localStorage.setItem("userInfo", JSON.stringify(this.writeOldUserInfo(profile)))
  }

  writeOldUserInfo(profile: any) {
    const userInfo = {
      anrede: '',
      dashboard_admin: [],
      dashboards: [] as string[],
      disabled: false,
      email: '',
      firstname: '',
      is_admin: false,
      is_superadmin: false,
      lastname: '',
      refresh_counter: 0,
      refresh_counter_blocked: 0,
      roles: [] as string[],
      usergroups: {} as { [key: string]: any }
    }

    for (const item in profile) {
      switch (item) {
        case 'given_name':
          userInfo.firstname = profile[item]
          break;
        case 'family_name':
          userInfo.lastname = profile[item]
          break;
        case 'email':
          userInfo.email = profile[item]
          break;
        case 'email_verified':
          userInfo.disabled = !profile[item]
          break;
        case 'groups':
          const userGroupsObject: any = {};

          for (const str of profile[item]) {
            const parts = str.split('/');
            const key = parts[1];
            const value = parts.slice(2).join('/') || '';

            if(value === '') continue

            if (userGroupsObject[key]) {
              userGroupsObject[key].push(value);
            } else {
              userGroupsObject[key] = [value];
            }
          }

          userInfo.dashboards = Object.keys(userGroupsObject)
          userInfo.usergroups = userGroupsObject
          break;
        default:
          break;
      }
    }

    return userInfo
  }

  getProfile() {
    return JSON.parse(localStorage.getItem("oAuthProfile") || '')
  }

  async checkLoginState() {
    await this.init().then((authenticated) => {
      // const profile = this.getProfile()
      this.router.navigate(['/'])
      return
    }).catch((error) => {
      // console.error('Error during authentication:', error);
      this.router.navigate(['/'])
    });
  }

  public refreshKeycloakToken() {
    return this.keycloak.updateToken(5).then(async (refreshed) => {
      if (refreshed) {
        this.profile =
          (await this.keycloak.loadUserInfo()) as unknown as UserProfile;
        this.profile.token = this.keycloak.token || "";
        this.setProfile(this.profile)
        return true;
      }
      return false;
    });
  }

  logout() {
    this.keycloak.logout({ redirectUri: window.location.origin }).then(() => {
      localStorage.clear()
    })
  }
}