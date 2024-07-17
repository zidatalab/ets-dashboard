import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Observer, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';


// const keycloak = new Keycloak({
//   url: "https://auth.zi.de",
//   realm: "dashboardsso",
//   clientId: "ets_reporting_2",
// });

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>
  public currentUser: Observable<any>

  get isOAuth() {
    return this.currentUserSubject.value.type === 'oauth'
  }

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private router: Router,
    private keycloakService: KeycloakService
  ) {
    this.currentUserSubject = new BehaviorSubject<any>(this.getUserDetails())
    this.currentUser = this.currentUserSubject.asObservable()

    this.checkAuthentication()
  }

  private async checkAuthentication() {
    if (await this.isAuthenticated) {
      this.oAuthLoadProfile()
      const data = await this.oAuthLoadProfile();
      this.storeUserDetails(data, 'oauth')
      this.afterOAuthLoginTask()
    }
  }

  public get isAuthenticated(): Promise<boolean> {
    return Promise.resolve(this.keycloakService.isLoggedIn());
  }

  public async oAuthLogin() {
    console.log('auth.service > oAuthLogin');
    await this.keycloakService.login();
  }

  public async oAuthlogout() {
    await this.keycloakService.logout();
  }

  public async getUserInfo() {
    console.log(await this.keycloakService.getKeycloakInstance().loadUserInfo())
    return await this.keycloakService.getKeycloakInstance().loadUserInfo();
  }

  // async initOAuth() {
  //   const authenticated = await keycloak.init({
  //     onLoad: "check-sso",
  //     silentCheckSsoRedirectUri: window.location.origin + "/assets/silent-check-sso.html",
  //     enableLogging: true,
  //     checkLoginIframe: true,
  //     flow: "standard",
  //   });
    
  //   if(authenticated) {
  //     const data = await this.oAuthLoadProfile();
  //     this.storeUserDetails(data, 'oauth')
  //     this.afterOAuthLoginTask()
  //   }

  //   return authenticated;
  // }

  private async oAuthLoadProfile() {
    const data = await this.getUserInfo() as any;

    const userGroups = data.groups.reduce((output: any, group: any) => {
      const parts = group.split('/');
      const key = parts[1];
      const value = parts.slice(2).join('/') || '';

      if (value === '') return output

      if (output[key]) {
        output[key].push(value);
      } else {
        output[key] = [value];
      }
      return output;
    }, {});

    return {
      anrede: '',
      dashboard_admin: [],
      dashboards: Object.keys(userGroups),
      disabled: !Boolean(data.email_verified),
      email: data.email,
      firstname: data.family_name,
      is_admin: false,
      is_superadmin: false,
      lastname: data.given_name,
      refresh_counter: 0,
      refresh_counter_blocked: 0,
      roles: [] as string[],
      usergroups: userGroups,
      type: 'oauth',
      token: this.keycloakService.getKeycloakInstance().token,
    }
  }

  afterOAuthLoginTask() {
    this.setDataInLocalStorage('refresh_token', this.keycloakService.getKeycloakInstance().refreshToken)
    this.setDataInLocalStorage('access_token', this.keycloakService.getKeycloakInstance().token)
  }

  // async oAuthLogin() {
  //   await keycloak.login();

  //   const data = this.oAuthLoadProfile();
  //   this.storeUserDetails(data, 'oauth');
  // }


  // public isKeycloakTokenExpired() {
  //   if (!keycloak.authenticated) return null
    
  //   return keycloak.isTokenExpired()
  // }

  // public refreshKeycloakToken() {
  //   return keycloak.updateToken(5).then(async (refreshed) => {
  //     if (refreshed) {
  //       localStorage.setItem('access_token', keycloak.token || "");
  //       localStorage.setItem('refresh_token', keycloak.refreshToken || "");
  //       return true;
  //     }
  //     return false;
  //   }).catch((error) => {
  //     return false;
  //   })
  // }

  public getUserDetails() {
    return localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo') || '{}') : false
  }

  public getToken() {
    return localStorage.getItem('access_token')
  }

  public getRefreshToken() {
    // if (this.isOAuth) {
    //   return this.refreshKeycloakToken()
    // }

    return localStorage.getItem('refresh_token');
  }

  public async logout() {
    if(await this.isAuthenticated)  {
      this.keycloakService.logout(window.location.origin).then(() => {
        localStorage.clear()
        this.currentUserSubject.next(null);
      })
      return;
    }

    const token = this.getToken();
    
    this.api.logout(token).subscribe(res => {
      this.currentUserSubject.next(null);
      localStorage.clear();
      window.location.reload()
    })
  }

  public updateUserData() {
    return this.api.getTypeRequest('users/profile/')
  }

  public getTokenInfo() {
    const token = this.getToken()
    const base64Url = token?.split('.')[1]
    const base64 = base64Url?.replace(/-/g, '+').replace(/_/g, '/');
    // @ts-ignore
    const payload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(payload)
  }

  onlineStatus() {
    return merge(
      fromEvent(window, 'offline').pipe(map(() => false)),
      fromEvent(window, 'online').pipe(map(() => true)),

      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      }));
  }

  login(formData: any) {
    const payload = new HttpParams()
      .set('username', formData.username)
      .set('password', formData.password)
      .set('client_id', this.api.clientApiId)

    return this.api.postTypeRequest('login/', payload).pipe(map(user => {
      return this.loginTask(user)
    }))
  }

  loginTask(user: any) {
    this.setDataInLocalStorage('refresh_token', user.refresh_token)
    this.setDataInLocalStorage('access_token', user.access_token)
    this.storeUserDetails(user.user, 'login')

    return user
  }

  addUser(data: any) {
    return this.api.postTypeRequest('newuser', data)
  }

  refreshToken() {
    // if(this.isOAuth) {
    //   return this.refreshKeycloakToken()
    // }

    return this.http.post(`${this.api.apiServer}login/refresh/`, { refresh: true }).subscribe(
      data => {
        const result: any = data
        this.setDataInLocalStorage('access_token', result.access_token)
      }, error => { }
    )
  }

  storeUserDetails(data: any, type: 'login' | 'oauth') {
    data.type = type;

    this.currentUserSubject.next(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  }

  setDataInLocalStorage(variableName: any, data: any) {
    localStorage.setItem(variableName, data);
  }

  isAdmin() {
    const userData = this.getUserDetails()

    if (userData) {
      if (userData['is_admin'] || userData['is_superadmin']) {
        return true
      }
    }

    this.router.navigate(['/'])

    return false
  }

}