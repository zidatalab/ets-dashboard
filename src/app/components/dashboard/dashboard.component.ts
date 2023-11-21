import { Component, OnInit } from '@angular/core';
import { AggregationService } from 'src/app/services/aggregation.service';
import { ApiService } from "src/app/services/api.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    private api: ApiService,
    private aggregation: AggregationService,
  ) { }

  ngOnInit(): void {
    this.queryData()
  }
  
  allPublicFields = ["stats_angebot", "dringlichkeit", "status_dringlichkeit_combined"]
  levelSettings = { 'level': 'KV', "fg": "Gesamt", 'levelValues': 'Gesamt', 'zeitraum': 'Letzte 12 Monate', 'resolution': 'weekly', 'thema': 'Gesamt', 'urgency': 'Akut', 'start': '', 'stop': '' }

  async queryData(hack : boolean = false) {
    /**
     * start/stop depending on 'zeitraum'
     */
    this.levelSettings = this.aggregation.updateStartStop(this.levelSettings)

    const query : any = {
      'client_id': 'ets_reporting',
      'groupinfo': {
        'level': 'KV',
        "fg": this.levelSettings['fg'],
        'levelid': this.levelSettings['levelValues'],
        'timeframe': this.levelSettings['resolution'],
        'Jahr': {
          '$gte': parseInt(this.levelSettings['start'].slice(0, 4)),
          '$lte': parseInt(this.levelSettings['stop'].slice(0, 4))
        }
      },
      "showfields": ["stats_angebot"]
    }

    let { data : result } : any = await this.api.postTypeRequestWithoutObs('get_data/', query)

    if(result.length) {
      result = result.map((entry :any ) => ({
        ...entry
      }))
    }

    // for(const item of fiel)
  }
}
