import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Menu } from '../models/menu.model'

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
  opened = false

  toggle(): void {
    this.opened = !this.opened
  }

  menu: Menu = [
    {
      title: 'Startseite',
      icon: '',
      link: '/',
    },
    // {
    //   title: 'Erweiterte Analysen',
    //   icon: '',
    //   link: '/private',
    // },
    // {
    //   title: 'Adminbereich',
    //   icon: '',
    //   link: '/admin',
    // }
  ]
}