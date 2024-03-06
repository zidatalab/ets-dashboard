import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { DBService } from './services/db.service';
import { filter } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private db: DBService,
    private router: Router,
  ) {
    this.router.events.pipe(
      filter((e: any): e is RouterEvent => e instanceof RouterEvent)
    ).subscribe((evt: RouterEvent) => {
      if (evt instanceof NavigationEnd) {
        this.currentRoute = evt.url
      }
    })
  }

  title = 'dashboard';
  loginOption = true
  currentDate: any

  public currentUser: any
  public currentRoute: string = ""
  public isLoggedIn: boolean = false
  public isAdmin: boolean = false
  public apiConnection: number = 0

  ngOnInit() {
    this.db.clean()
    this.checkApiConnection();

    this.currentDate = new Date()
    this.auth.currentUser.subscribe(data => {
      if (data) {
        this.currentUser = data
        this.isLoggedIn = !this.isLoggedIn
        this.isAdmin = this.currentUser["is_admin"] || this.currentUser['is_superadmin']

        this.autoRefreshData()

        setInterval(() => {
          this.autoRefreshData()
          this.auth.refreshToken()
        }, 300000);
      }
    })
  }

  public checkApiConnection() {
    this.api.getTypeRequest('openapi.json').subscribe(data => { this.apiConnection = 1; }, error => { this.apiConnection = 2; })
  }

  public checkDuplicateTab() {
    localStorage['openpages'] = Date.now()

    window.addEventListener('storage', (e) => {
      if (e.key === 'openpages') {
        localStorage['page_available'] = Date.now()
      }
      if (e.key === 'page_available') {
        alert("Eine andere Seite ist bereits offen. Bitte nutzen Sie diese Anwendung nur auf einem Tab, um Probleme zu vermeiden.")
      }
    }, false)
  }

  public autoRefreshData() {
    this.updateMetaData().subscribe(
      (data: any) => {
        this.setMetaData('metadata', data['data'])
      }
    )
  }

  logout() {
    this.auth.logout()
    this.db.clean()
    localStorage.clear()
    this.autoRefreshData()
    this.isLoggedIn = !this.isLoggedIn
    this.isAdmin = false

    setTimeout(() => {
      this.router.navigate(['/'])
    }, 1500);
  }

  getSortData() {
    return this.api.getTypeRequest(`get_sortlevels/${this.api.clientApiId}`)
  }

  updateMetaData() {
    return this.api.getTypeRequest(`get_metadata/${this.api.clientApiId}`)
  }

  setMetaData(name: any, data: any) {
    localStorage.setItem(name, JSON.stringify(data))
  }
}
