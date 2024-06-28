import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { DBService } from './services/db.service';
import { filter } from 'rxjs';
// import { OAuthService } from './services/o-auth.service';
import { HeaderComponent } from './components/header/header.component';
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "https://auth.zi.de",
  realm: "dashboardsso",
  clientId: "ets_reporting_2",
});

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
    private cdr: ChangeDetectorRef,
    public header: HeaderComponent
  ) {
    this.router.events.pipe(
      filter((e: any): e is RouterEvent => e instanceof RouterEvent)
    ).subscribe((evt: RouterEvent) => {
      if (evt instanceof NavigationEnd) {
        this.currentRoute = evt.url
      }

      if (evt.url !== this.currentRoute && evt.url) {
        this.currentRoute = evt.url;
        this.api.countView(evt.url);
      };
    })
  }

  title = 'dashboard';
  loginOption = true
  currentDate: any

  public currentUser: any
  public currentRoute: string = ""
  public isLoggedIn: any = false
  public isAdmin: boolean = false
  public apiConnection: number = 0

  async ngOnInit() {
    this.db.clean()
    this.checkApiConnection();
    this.api.setMetaData()

    this.currentDate = new Date()

    this.auth.currentUser.subscribe(data => {
      if (data) {
        this.currentUser = data
        this.isLoggedIn = !this.isLoggedIn
        this.isAdmin = this.currentUser["is_admin"] || this.currentUser['is_superadmin']

        this.api.setMetaData()
        this.autoRefreshData()
        this.checkApiConnection()

        setInterval(() => {
          this.auth.refreshToken()
          this.autoRefreshData()
          this.checkApiConnection()
        }, 20000);
      }
    })

    this.cdr.detectChanges()
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
    this.api.setMetaData()
  }

  getSortData() {
    return this.api.getTypeRequest(`get_sortlevels/${this.api.clientApiId}`)
  }
}
