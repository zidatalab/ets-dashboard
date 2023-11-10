import { Component, OnInit, Input } from '@angular/core';
import { SelectControlValueAccessor } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-key-data-container',
  templateUrl: './key-data-container.component.html',
  styleUrls: ['./key-data-container.component.scss']
})
export class KeyDataContainerComponent implements OnInit {

  constructor(
    private api: ApiService
  ) { }

  @Input() value: number = 0
  @Input() title: string = ''
  @Input() description: string = ''
  @Input() color: any = ''
  @Input() cutOffs: any = []
  @Input() mainColor: string = ''
  @Input() numberFormat: string = ''
  @Input() matIcon: string = ''
  @Input() isTextBehind: boolean = false

  itemColor: string = ''

  ngOnInit() {
    this.value = Number(this.value)

    if (!this.numberFormat) {
      this.numberFormat = '1.1-1'
    }

    if (!this.mainColor) {
      this.mainColor = this.api.primarycolor
    }

    if (!this.cutOffs) {
      this.cutOffs = []
    }

    // this.setColor()
  }

  // setColor() {
  //   let color = this.mainColor
  //   this.itemColor = this.mainColor

  //   if (this.cutOffs.length > 0 && this.cutOffs.length === this.colors.length) {
  //     let i = 0
  //     for (let cutValue of this.cutOffs) {
  //       if (Number(cutValue) <= this.value) {
  //         color = this.colors[i]
  //       }
  //       i += 1
  //     }
  //   }
  // }
}
