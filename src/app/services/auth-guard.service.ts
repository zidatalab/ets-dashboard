import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root'
})

export class AuthGuardService {
  constructor(
    private auth: AuthService,
    private oAuthService: OAuthService,
    private router: Router
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const userData = this.auth.getUserDetails()

    if (userData) {
      return true
    }

    this.router.navigate(['/'])

    return false
  }

  canActivateAdmin(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const userData = this.auth.getUserDetails()

    if (userData) {
      if (userData['is_admin'] || userData['is_superadmin']) {
        return true
      }
    }

    this.router.navigate(['/'])

    return false
  }
}