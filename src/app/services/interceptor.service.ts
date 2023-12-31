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
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private router: Router,
    private auth: AuthService,
    private api: ApiService
  ) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.url.includes(this.api.apiServer) && !request.url.includes('login/refresh') && this.auth.getUserDetails()) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.auth.getToken()}`
        }
      })
    }

    if (request.url.includes(this.api.apiServer) && request.url.includes('login/refresh') && this.auth.getUserDetails()) {
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
          this.auth.logout()
          this.router.navigate(["/"])          
          this.refreshTokenInProgress = false    
        }
        else {
          this.refreshTokenInProgress = false;
        }

        return throwError(() => error)
      })
    )
  }
}
