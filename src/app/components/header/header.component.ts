import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';
import { OAuthService } from 'src/app/services/o-auth.service';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})

export class HeaderComponent {
  @Output() menuToggled = new EventEmitter<boolean>();

  constructor(
    private auth: AuthService,
    private oauth: OAuthService,
    private router: Router,
    public dialog: MatDialog,
  ) { }

  currentUser: any
  oAuthUser: any
  loggedInUserName: string = ''
  public isLoggedIn: any = false;

  ngOnInit(): void {
    this.currentUser = this.auth.getUserDetails()
    this.showLoggedInName()
  }

  onOpenLoginDialog() {
    const dialogRef = this.dialog.open(LoginComponent, {
      hasBackdrop: false
    }).afterClosed().subscribe(result => {
      window.location.reload()
    })
  }

  logout(): void {
    if (localStorage.getItem('oAuthProfile')) {
      this.oauth.logout()
      window.location.reload()

      return
    }

    this.auth.logout()
    window.location.reload()
  }

  toProfile(): void {
    console.log('change route to profile');
  }

  showLoggedInName() {
    if (this.currentUser) {
      this.loggedInUserName = `${this.currentUser.firstname} ${this.currentUser.lastname}`
      return
    }

    this.loggedInUserName = 'nicht angemeldet'
  }

  public setIsLoggedIn(value: boolean): void {
    this.isLoggedIn = value
  }
}
