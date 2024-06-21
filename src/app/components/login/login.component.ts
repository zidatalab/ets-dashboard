import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';
import { OAuthService } from 'src/app/services/o-auth.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    private auth: AuthService,
    private oAuthService: OAuthService,
    private router: Router,
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<LoginComponent>,
  ) { }

  form!: FormGroup
  isLoggedIn: boolean = false;
  isLoginPending: boolean = false
  hasLoginError: boolean = false

  ngOnInit(): void {
    this.isLoginPending = false
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    })

    if (this.auth.getToken()) {
      this.isLoggedIn = true
    }

    if(this.oAuthService.isAuthenticated()) {
      this.oAuthService.handleAuthCallback()
      this.isLoggedIn = true
    }
  }

  oAuthLogin() {
    this.oAuthService.init().then((authenticated) => {
      if (authenticated) {
        // User is authenticated, handle the successful login
        const profile = this.oAuthService.getProfile();
        // Process the user profile or perform any other necessary actions
        console.log('User is authenticated:', profile);
      } else {
        // User is not authenticated, initiate the login process
        this.oAuthService.login();
      }
    }).catch((error) => {
      console.error('Error during authentication:', error);
      // Handle the error appropriately
    });
  }

  login() {
    this.auth.login(this.form.value).subscribe({
      next: (data) => this.isLoginPending = true,
      error: (error) => {
        this.hasLoginError = true
      },
      complete: () => {
        this.isLoggedIn = true
        this.router.navigate(['/'])
        window.location.reload()
      }
    })

    this.isLoginPending = false
  }

  showPassword(id : string, iconId : string) {
    const passwordField = document.getElementById(id) as HTMLInputElement;
    const icon = document.getElementById(iconId) as HTMLInputElement;

    if (passwordField.type === "password") {
      icon.innerText = 'visibility_off'
      passwordField.type = "text";
    } else {
      icon.innerText = 'visibility'
      passwordField.type = "password";
    }
  }
}
