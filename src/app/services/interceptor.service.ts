import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService {
  private refreshTokenInProgress = true;

  constructor(
    private router: Router,
    private auth: AuthService,
    private api: ApiService
  ) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let currentUser = undefined
    this.auth.currentUser.subscribe(user => {
      currentUser = user
    });

    if (currentUser) {
      if (request.url.includes(this.api.apiServer) && !request.url.includes('login/refresh')) {
        if (request.url.includes('get_data')) console.log('get_data', request.url)
        if (this.auth.isOAuth) {
          if (request.url.includes(this.api.dataApiServer)) {
            request = request.clone({
              setHeaders: {
                Authorization: `Bearer ${currentUser['token']}`
              }
            })
          } else {
            request = request.clone({
              url: request.url.replace(this.api.apiServer, this.api.dataApiServer),
              setHeaders: {
                Authorization: `Bearer ${currentUser['token']}`
              }
            })
          }
        } else {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${this.auth.getToken()}`
            }
          })
        }
      }
    }
    if (request.url.includes(this.api.apiServer) && request.url.includes('login/refresh') && !this.auth.isOAuth) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.auth.getRefreshToken()}`
        }
      })
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (request.url.includes(this.api.apiServer) && error.status == 401 && this.auth.getUserDetails() && !this.refreshTokenInProgress && !request.url.includes("login/refresh")) {
          this.refreshTokenInProgress = true
          this.auth.refreshToken()
          this.refreshTokenInProgress = false
        }

        if (request.url.includes(this.api.apiServer) && request.url.includes("/refresh/") && error.status == 422) {
          this.router.navigate(["/"])
          this.refreshTokenInProgress = false
          this.auth.logout()
        }
        else {
          this.refreshTokenInProgress = false;
        }

        return throwError(() => error)
      })
    )
  }
}
