import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Plot } from '../../../models/plot.model'
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { AggregationService } from 'src/app/services/aggregation.service';
// import { CsvexportService } from 'src/app/services/csvexport.service';
import { DBService } from 'src/app/services/db.service';
import { Router } from '@angular/router';
import { MakeETerminData } from '../../dataQueries/eTerminService/makeETerminServiceData';
import { ETerminQuery } from '../../dataQueries/eTerminService/eTerminQuery';

/**
 * 
 * !INFORMATION-TODO
 * definition of past, present and future through field "date_of_aggretation"
 * 
 * implement/find a way to show only on of the time:
 * past = < date_of_aggregation
 * present ?
 * future = > date_of_aggregation
 * 
 * maybe range slider?
 * 
 * booked + available = total 
 * (booked / available) + available = anteil
 * 
 */

@Component({
  selector: 'eTermin-dashboard-render',
  templateUrl: './eTerminServiceRender.html',
  styleUrls: ['./eTerminServiceRender.scss']
})
export class ETerminDashboardRender implements OnInit {
  constructor(
    private db: DBService,
    // private csv:,
    private api: ApiService,
    private auth: AuthService,
    private aggregation: AggregationService,
    private router: Router,
    private makeData: MakeETerminData,
    private queryETerminData: ETerminQuery,
    private cdr: ChangeDetectorRef
  ) { }

  metaData = [];
  inProgress: boolean = true;
  isMetaDataOk: boolean = false;
  mapData: any;
  mapDataFor: any;
  sortData = [];
  level: any;
  levelId: any;
  subGroups: any
  levelValues = [
    'Gesamt',
    'Baden-Württemberg',
    'Bayern',
    'Berlin',
    'Brandenburg',
    'Bremen',
    'Hamburg',
    'Hessen',
    'Mecklenburg-Vorpommern',
    'Niedersachsen',
    'Nordrhein-Westfalen',
    'Nordrhein',
    'Westfalen-Lippe',
    'Rheinland-Pfalz',
    'Saarland',
    'Sachsen',
    'Sachsen-Anhalt',
    'Schleswig-Holstein',
    'Thüringen'
  ];
  resolutionOptions = [{ key: "Monat", value: 'monthly' },{ key: "Kalenderwoche", value: 'weekly' }, { key: "Tage", value: "daily" }];
  professionGroups = ["Gesamt", "Psychotherapeuten", "Fachinternisten", "Nervenärzte", "Hautärzte", "Augenärzte", "Orthopäden", "Kinderärzte", "Frauenärzte", "Hausarzt", "Chirurgen", "Urologen", "HNO-Ärzte", "Weitere Arztgruppen", "Transfusionsmediziner", "Sonderleistungen"]
  themes = ["Gesamt", "Terminangebote", "Terminnachfrage"]
  urgencies = [{ key: "Gesamt", value: -1 }, { key: "Akut", value: "AKUT" }, { key: "Dringend", value: "DRINGEND" }, { key: "Nicht Dringend", value: "NICHT_DRINGEND" },]
  levelSettings: any = {};
  data: any;
  currentUser: any;
  colorScheme: any;
  allPublicFields = ["stats_angebot", "stats_nachfrage", "dringlichkeit", "status_dringlichkeit_combined"]
  summaryInfo: any = []
  professionGroup: any = ''
  appointmentOffer: any = []
  appointmentBooked: any = []
  appointmentUnarranged: any = []
  appointmentByProfessionGroups: any = []
  appointmentDemandUnarranged: any = []
  appointmentDemandTotal: any = []
  keyDataContainerStrings = [
    {
      key: "offer",
      name: 'Terminangebote',
      firstTile: "Termine im Angebot",
      firstTileColor: "#F75F7C",
      secondTile: "Termine vermittelt",
      secondTileColor: "#C8D42B",
      thirdTile: "unvermittelte Termine",
      thirdTileColor: "#FF879E",
    },
    {
      key: "demand",
      name: "Nachfrage",
      firstTile: "Terminnachfrage",
      firstTileColor: "#EB9F47",
      secondTile: "unvermittelte Terminnachfrage",
      secondTileColor: "#EB9F47",
      thirdTile: "Termine vermittelt",
      thirdTileColor: "#C8D42B",
    },
    {
      key: "overview",
      name: "Gesamt",
      firstTile: "nicht vermittelte Terminnachfrage",
      firstTileColor: "#EB9F47",
      secondTile: "fristgerecht vermittelte Termine",
      secondTileColor: "#C8D42B",
      thirdTile: "nicht vermittelte Termine",
      thirdTileColor: "#FF879E",
    },
  ]
  selectedContainerStringObject: any
  dataYearSince: any = ''
  dataDateSince: any = ''
  dataDateUntil: any = ''

  async ngOnInit(): Promise<void> {
    this.levelSettings = { 'level': 'KV', "fg": "Gesamt", 'levelValues': 'Gesamt', 'zeitraum': 'Letzte 12 Monate', 'resolution': 'weekly', 'thema': 'Gesamt', 'urgency': -1 }
    this.setKeyDataString()
    this.colorScheme = this.api.makeScale(5)
    this.levelSettings = this.aggregation.updateStartStop(this.levelSettings)
    this.metaData = await this.updateMetaData()

    if (this.metaData) {
      this.setLevelData()
    }

    // this.queryETerminData.getQueryData('',this.levelSettings)
  }

  async setLevelData(level: any = '', value: any = '') {
    this.levelSettings[level] = value
    this.levelSettings = this.aggregation.updateStartStop(this.levelSettings)

    if (this.levelSettings['start'] && this.levelSettings['stop']) {
      await this.setData()
    }
  }

  async updateMetaData() {
    const result = await this.api.getMetaData('metadata')

    return result
  }

  setDomData() {
    this.level = this.api.filterArray(this.metaData, 'type', 'level')[0]['varname']
    this.levelId = this.api.filterArray(this.metaData, 'type', 'levelid')[0]['varname']
    this.professionGroup = this.api.filterArray(this.metaData, 'type', 'fg')[0]['varname']
    // this.subGroups = ['Keine'].concat(this.api.getValues(this.api.filterArray(this.metaData, 'type', 'group'), 'varname'))
  }

  /**
   * 
   * fixing reactivity on change filter values
   */
  async setData(input: any = '') {
    const result = await this.queryETerminData.getQueryData(input, this.levelSettings, this.allPublicFields)

    if (result) {
      this.summaryInfo = {
        ...result.stats_angebot.summaryInfo,
        ...result.stats_nachfrage.summaryInfo
      }

      this.dataYearSince = result.stats_angebot.dataYearSince
      this.dataDateUntil = result.stats_angebot.dataDateUntil
      this.dataDateSince = new Date(result.stats_angebot.dataDateSince).toLocaleDateString()

      if (result.stats_angebot) {
        this.appointmentOffer = result.stats_angebot.appointmentOfferTotal
        this.appointmentBooked = result.stats_angebot.appointmentBookedTotal
        this.appointmentUnarranged = result.stats_angebot.appointmentUnarranged
        this.appointmentByProfessionGroups = result.stats_angebot.appointmentByProfessionGroups

        this.dataYearSince = result.stats_angebot.dataYearSince
        this.dataDateUntil = result.stats_angebot.dataDateUntil
      }

      if (result.stats_nachfrage) {
        this.appointmentDemandTotal = result.stats_nachfrage.appointmentDemandTotal
        this.appointmentDemandUnarranged = result.stats_nachfrage.appointmentDemandUnarranged

        this.dataYearSince = result.stats_nachfrage.dataYearSince
        this.dataDateUntil = result.stats_nachfrage.dataDateUntil
      }
    }
  }

  /**
   * 
   * @param data array of objects
   * @param style byDate; byTheme; byPie
   * @returns 
   */
  constructChartData(data: any, style: any) {
    const result: any = {
      labels: [],
      fill: true,
      datasets: [{
        data: []
      }],
    }

    if (style === 'byDate') {
      for (let item of data) {
        result.labels.push(item['date'])
        result.datasets[0].data.push(item['total'])
      }
    }

    if (style === 'byTheme') {
    }

    if (style === 'byPie') {
      for (let [key, item] of Object.entries(data)) {
        result.labels.push(key)
        result.datasets[0].data.push(item)
      }
    }

    return result
  }

  setKeyDataString() {
    let [res] = this.keyDataContainerStrings.filter((item) => {
      return item.name === this.levelSettings["thema"]
    })

    this.selectedContainerStringObject = res
  }
}