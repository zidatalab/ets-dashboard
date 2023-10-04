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
  private refreshTokenInProgress = false;
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
          Authorization: `Bearer ${this.auth.refreshTocken()}`
        }
      })
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (request.url.includes(this.api.apiServer) && (this.auth.getUserDetails()["email"]) &&
          error.status == 401 && window.location.hostname !== 'localhost') {
          this.auth.refreshTocken();
        }

        if (request.url.includes(this.api.apiServer) && request.url.includes("login/refresh") && error.status == 422) {
          this.refreshTokenInProgress = false;
          this.auth.logout();
          this.router.navigate(["/"]);
        }
        else {
          this.refreshTokenInProgress = false;
        }

        return throwError(() => error)
      })
    )
  }
}
