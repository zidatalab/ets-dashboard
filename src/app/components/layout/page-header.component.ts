import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-page-header',
  template: `
      <div>            
        <ng-content select="h2"></ng-content>
        <ng-content select="img"></ng-content>
      </div>
  `,
  styleUrls: ['./page-header.component.css']
})

export class PageHeaderComponent {
  @Input() icon?: string
}