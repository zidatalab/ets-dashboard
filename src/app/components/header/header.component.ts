import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';
// import { OAuthService } from 'src/app/services/o-auth.service';
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
    // private oauth: OAuthService,
    // private router: Router,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
  ) { }

  currentUser: any
  loggedInUserName: string = ''
  public isLoggedIn: any = false;

  ngOnInit(): void {
    this.auth.currentUser.subscribe(data => {
      this.currentUser = data;
      this.loggedInUserName = `${this.currentUser.firstname} ${this.currentUser.lastname}`
      this.cdRef.detectChanges();
    });
  }

  onOpenLoginDialog() {
    const dialogRef = this.dialog.open(LoginComponent, {
      hasBackdrop: false
    }).afterClosed().subscribe(result => {
      window.location.reload()
    })
  }

  async logout() {
    await this.auth.logout()
    window.location.reload()
  }
}
