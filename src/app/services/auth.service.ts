import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Observer, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { OAuthService } from './o-auth.service';
@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private currentUserSubject: BehaviorSubject<any>
  public currentUser: Observable<any>

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private router: Router,
    private oAuthService: OAuthService
  ) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('userInfo') || '{}'))
    this.currentUser = this.currentUserSubject.asObservable()
  }

  public get currenUserValue(): any {
    return this.currentUserSubject.value
  }

  public getUserDetails() {
    return localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo') || '{}') : false
  }

  public getToken() {
    return localStorage.getItem('access_token')
  }

  public getRefreshToken() {
    if (localStorage.getItem('oAuthProfile')) {
      return this.oAuthService.refreshKeycloakToken()
    }

    return localStorage.getItem('refresh_token');
  }

  public logout() {
    if(localStorage.getItem('oAuthProfile')) return
    const token = this.getToken()
    localStorage.clear();
    this.api.logout(token).subscribe(res => {
      this.currentUserSubject.next(null);
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
    this.storeUserDetails(user.user)

    this.currentUserSubject.next(user.user)

    return user
  }

  addUser(data: any) {
    return this.api.postTypeRequest('newuser', data)
  }

  refreshToken() {
    if(localStorage.getItem('oAuthProfile')) {
      return this.oAuthService.refreshKeycloakToken()
    }

    return this.http.post(`${this.api.apiServer}login/refresh/`, { refresh: true }).subscribe(
      data => {
        const result: any = data
        this.setDataInLocalStorage('access_token', result.access_token)
      }, error => { }
    )
  }

  storeUserDetails(data: any) {
    return localStorage.setItem('userInfo', JSON.stringify(data));
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