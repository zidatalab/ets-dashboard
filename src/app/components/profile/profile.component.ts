import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router
  ) { }

  user: any = {}
  isChangePassword: boolean = false
  passwordChangeRequest: any = { 'oldpwd': '', 'newpwd': '', 'newpwd_confirm': '' }
  deleteAccountRequest: any = { 'pwd': '' }
  error: any = {}
  passwordVisibilityIcon: string = 'visibility'
  isPasswordMatchError: boolean = false
  passwordMatchError: string = 'Die Passwörter stimmen nicht überein.'
  isPasswordValidateError: boolean = false
  passwordValidateError: string = 'Das Passwort muss mindestens 8 Zeichen lang sein, eine Zahl enthalten, einen Großbuchstaben und darf keine Sonderzeichen enthalten.'

  ngOnInit(): void {
    this.user = this.getUser()
  }

  async getUser() {
    this.user = await this.auth.getUserDetails()
  }

  openChangePassword() {
    this.isChangePassword = true
  }

  closeChangePassword() {
    this.passwordChangeRequest = { 'oldpwd': '', 'newpwd': '', 'newpwd_confirm': '' }
    this.isChangePassword = false
  }

  changePassword() {
    if (!this.isPasswordMatchError) {
      this.api.changePassword(this.user.email, this.passwordChangeRequest.newpwd, this.passwordChangeRequest.oldpwd).subscribe(data => {
        this.isChangePassword = false
        this.auth.logout()
        window.location.reload();
        this.router.navigate(['/'])
        alert('Passwort wurde geändert. Bitte loggen Sie sich mit ihrem neuen Passwort ein.')
      }, error => {
        this.isChangePassword = false
        this.error = error.error.error
        alert(this.error)
      })
    }
  }

  checkPasswordMatch() {
    this.isPasswordMatchError = this.passwordChangeRequest.newpwd !== this.passwordChangeRequest.newpwd_confirm
  }

  validatePassword() {
    // Password must be 6-20 characters long
    // Password must contain at least one uppercase letter
    // Password must contain at least one number
    // Password must not contain special characters
    // Password must not contain whitespace

    if (this.passwordChangeRequest.newpwd.length < 6 || this.passwordChangeRequest.newpwd.length > 20) {
      this.isPasswordValidateError = false
    }

    if (!/[A-Z]/.test(this.passwordChangeRequest.newpwd)) {
      this.isPasswordValidateError = false
    }

    if (!/\d/.test(this.passwordChangeRequest.newpwd)) {
      this.isPasswordValidateError = false
    }

    if (/[^A-Za-z0-9]/.test(this.passwordChangeRequest.newpwd)) {
      this.isPasswordValidateError = false
    }

    if (/\s/.test(this.passwordChangeRequest.newpwd)) {
      this.isPasswordValidateError = false
    }

    this.isPasswordValidateError = !this.isPasswordValidateError;;
  }

  showPassword(id: string, iconId: string) {
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

  deleteAccount() {
    this.api.deleteUser(this.user.email, this.deleteAccountRequest.pwd).subscribe(data => {
      this.auth.logout()
      this.router.navigate(['/'])
    }, error => {
      this.error = error.error.error
      alert(this.error)
    })
  }

}

