import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Menu } from '../models/menu.model'
import { AuthService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-layout',
  template: `
  <div>
    <app-header (menuToggled)="toggle()"></app-header>
    <mat-drawer-container>
      <mat-drawer mode="side" [opened]="opened">
        <app-navigation [menu]="menu"></app-navigation>
      </mat-drawer>
      <mat-drawer-content [class.margin-left]="opened">
        <router-outlet></router-outlet>
      </mat-drawer-content>
    </mat-drawer-container>
  </div>
  `,
  styleUrls: ['./layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class LayoutComponent {
  constructor(
    private auth: AuthService,
  ){}

  opened = false

  toggle(): void {
    this.opened = !this.opened
  }

  menu: Menu = [
    {
      title: 'Startseite',
      icon: '',
      link: '/',
      isShow: true,
    },
    // {
    //   title: 'Erweiterte Analysen',
    //   icon: '',
    //   link: '/private',
    // },
    {
      title: 'Adminbereich',
      icon: '',
      link: '/admin',
      isShow: this.auth.isAdmin(),
    }
  ]
}