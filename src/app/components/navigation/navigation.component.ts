import { Component, OnInit, Input } from '@angular/core';
import { Menu } from '../models/menu.model'

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})

export class NavigationComponent {
  @Input() menu: Menu = [];
}
