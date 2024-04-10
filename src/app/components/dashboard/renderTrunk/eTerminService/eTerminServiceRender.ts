import { Component, OnInit, OnChanges, ChangeDetectorRef, SimpleChanges } from '@angular/core';
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

  metaData: any;
  isInProgress: boolean = true;
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
    'Nordrhein',
    'Westfalen-Lippe',
    'Rheinland-Pfalz',
    'Saarland',
    'Sachsen',
    'Sachsen-Anhalt',
    'Schleswig-Holstein',
    'Thüringen'
  ];

  views = ['Zeitreihen', 'Planung']
  resolutionOptions = {
    timeSeries: [
      { key: "Monate", value: 'monthly' }, { key: "Kalenderwochen", value: 'weekly' }, { key: "Tage", value: "daily" }
    ],
    planing: [
      { key: "Monate", value: 'upcoming_monthly_plz4' }, { key: "Tage", value: "upcoming_daily_plz4" }
    ]
  }
  resolutionPlaningOptions = {
    daily: [
      { key: "Heute", value: "today" },
      { key: "Morgen", value: "tomorrow" }
    ],
    monthly: [
      { key: "aktueller Monat", value: "thisMonth" },
      { key: "letzter Monat", value: "lastMonth" }
    ]
  }
  terminStatus = [
    {
      key: "Gebucht",
      value: "booked"
    },
    {
      key: "Verfügbar",
      value: "available"
    },
    {
      key: "nicht Verfügbar",
      value: "unavailable"
    }
  ]
  periodOfTime = [{ key: "Gesamt", value: "Gesamt" }, { key: "Aktuelles Jahr", value: "Aktuelles Jahr" }, { key: "letzte 12 Monate", value: "letzten 12 Monate" }]
  professionGroups = ["Gesamt", "Psychotherapeuten", "Fachinternisten", "Nervenärzte", "Hautärzte", "Augenärzte", "Orthopäden", "Kinderärzte", "Frauenärzte", "Hausarzt", "Chirurgen", "Urologen", "HNO-Ärzte", "Weitere Arztgruppen", "Transfusionsmediziner", "Sonderleistungen"]
  themes = ["Terminangebot", "Vermittlungswünsche"]
  urgencies = [{ key: "Gesamt", value: 'Gesamt' }, { key: "Akut", value: "AKUT" }, { key: "PT-Akut", value: "PT_AKUTBEHANDLUNG" }, { key: "Dringend", value: "DRINGEND" }, { key: "Nicht Dringend", value: "NICHT_DRINGEND" },]
  levelSettings: any = {};
  data: any;
  currentUser: any;
  allPublicFields = ["stats_angebot", "stats_nachfrage", "dringlichkeit", "status_dringlichkeit_combined"]
  summaryInfo: any = []
  professionGroup: any = ''
  appointmentOfferTotal: any = []
  appointmentBooked: any = []
  appointmentUnarranged: any = []
  appointmentByProfessionGroups: any = []
  appointmentDemandUnarranged: any = []
  appointmentDemandArranged: any = []
  appointmentDemandTotal: any = []
  keyDataContainerStrings = [
    {
      key: "offer",
      name: 'Terminangebote',
      firstTile: "Termine im Angebot",
      firstTileColor: "#F75F7C",
      secondTile: "gebuchte Termine",
      secondTileColor: "#C8D42B",
      thirdTile: "freie Termine",
      thirdTileColor: "#FF879E",
      numberformat: ""
    },
    {
      key: "demand",
      name: "Nachfrage",
      firstTile: "Vermittlungswünsche",
      firstTileColor: "#EB9F47",
      secondTile: "erfolglose Vermittlungswünsche",
      secondTileColor: "#ebd247",
      thirdTile: "erfolgreiche Vermittlungswünsche",
      thirdTileColor: "#C8D42B",
    },
    {
      key: "overview",
      name: "Überblick",
      firstTile: "des Terminangebots wurden gebucht",
      firstTileColor: "#F75F7C",
      secondTile: "der Vermittlungswünsche waren erfolgreich",
      secondTileColor: "#EB9F47",
      thirdTile: "nicht vermittelte Termine",
      thirdTileColor: "#EB9F47",
    },
  ]
  selectedContainerStringObject: any
  dataYearSince: any = ''
  dataDateSince: any = ''
  dataDateUntil: any = ''
  dataLastAggregation: any = ''
  hasNoData = false;
  regionalLayer: any = [{ key: '4-stellige Postleitzahl', value: 'postalLayer4' }];
  // regionalLayer: any = [{ key: 'Kreise', value: 'districtLayer' }, { key: 'Stadtbezirke 4', value: 'postalLayer4' }, { key: 'Stadtbezirke 3', value: 'postalLayer3' }, { key: 'Stadtbezirke 2', value: 'postalLayer2' }];
  selectedRegionalLayer: any = 'postalLayer4';
  isLoadingMapData: boolean = false;
  standardLevelSettings = {
    'level': 'KV',
    "fg": "Gesamt",
    'levelValues': 'Gesamt',
    'zeitraum': 'letzten 12 Monate',
    'resolution': 'monthly',
    'thema': 'Terminangebot',
    'urgency': 'Gesamt',
    'view': 'Zeitreihen',
  };

  ngOnInit(): void {
    this.levelSettings = this.standardLevelSettings

    this.currentUser = this.auth.getUserDetails()

    if (!this.currentUser) {
      this.router.navigate(['/'])
    }

    this.fillPeriodOfTime()
    this.dataLastAggregation = localStorage.getItem('date_of_aggregation')
    this.setKeyDataString()
    this.levelSettings = this.aggregation.updateStartStop(this.levelSettings)

    if (this.currentUser) {
      setTimeout(() => {
        this.metaData = localStorage.getItem('metadata')
        if (this.metaData) {
          if (this.currentUser) {
            if (!this.currentUser.is_superadmin) {
              this.levelValues = this.setDataLevelForAccess()
            }
          }
          else {
            this.levelValues = ['Gesamt']
          }
          this.setLevelData()
        }
      }, 100);
    }
  }

  onChangeView(value: any) {
    if (value === 'Zeitreihen') {
      this.levelValues.unshift('Gesamt')
      this.levelSettings = this.standardLevelSettings

      return
    }

    if (value === 'Planung') {
      this.levelSettings = {
        'level': 'KV',
        "fg": "Gesamt",
        'levelValues': 'Berlin',
        'resolution': 'upcoming_daily_plz4',
        'thema': 'Terminangebot',
        'urgency': 'Gesamt',
        'view': 'Planung',
        'resolutionPlaningOption': 'today',
        'status': 'available'
      }

      this.levelValues = this.levelValues.filter(level => level !== 'Gesamt')

      return
    }
  }

  setRegionalLayer(selection: any) {
    this.selectedRegionalLayer = selection;
  }

  fillPeriodOfTime() {
    for (let i = 0; i < 3; i++) {
      let year = new Date().getFullYear() - i - 1
      this.periodOfTime.push({ key: `${year}`, value: `${year}` })
    }
  }

  setDataLevelForAccess() {
    let userGroups = Array()
    let levelsAllowed = Array()
    let levelIdMeta: any
    const metaObject = JSON.parse(this.metaData)

    userGroups = this.currentUser.usergroups[this.api.clientApiId]
    levelIdMeta = metaObject.find((element: any) => element['type'] === "levelid")

    let levelrights = levelIdMeta?.levelrights

    for (let group of userGroups) {
      let idArray = Array()

      if (levelrights[group]) {
        idArray = levelrights[group]

        for (let id of idArray) {
          if (levelsAllowed.indexOf(id) === -1) {
            levelsAllowed.push(id);
          }
        }
      }
    }

    return levelsAllowed
  }

  async setLevelData(level: any = '', value: any = '') {
    if (level === 'view') {
      this.onChangeView(value)
    }

    if (level === 'thema') {
      this.levelSettings['fg'] = 'Gesamt'
    }

    if (level === 'resolution' && value === 'upcoming_monthly_plz4') {
      this.levelSettings['resolutionPlaningOption'] = 'thisMonth'
    }

    if (level === 'resolution' && value === 'upcoming_daily_plz4') {
      this.levelSettings['resolutionPlaningOption'] = 'today'
    }

    this.levelSettings[level] = value
    this.levelSettings = this.aggregation.updateStartStop(this.levelSettings)

    if (this.levelSettings['start'] && this.levelSettings['stop']) {
      await this.setData()
    }
  }

  updateMetaData() {
    const result = this.api.getMetaData('metadata')

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
   * 
   * !TODO needs to seperated from map data loading
   */
  async setData(input: any = '') {
    this.isInProgress = true

    const result = await this.queryETerminData.getQueryData(input, this.levelSettings, this.allPublicFields)

    if (result instanceof Error && this.levelSettings['view'] !== 'Planung') {
      this.isInProgress = false
      this.hasNoData = true
      return
    }

    if (result && this.levelSettings['view'] !== 'Planung') {
      this.summaryInfo = {
        ...result.stats_angebot.summaryInfo,
        ...result.stats_nachfrage.summaryInfo
      }

      this.dataYearSince = result.stats_angebot.dataYearSince
      this.dataDateUntil = result.stats_angebot.dataDateUntil
      this.dataDateSince = new Date(result.stats_angebot.dataDateSince).toLocaleDateString()

      if (result.stats_angebot) {
        this.appointmentOfferTotal = result.stats_angebot.appointmentOfferTotal
        this.appointmentBooked = result.stats_angebot.appointmentBooked
        this.appointmentUnarranged = result.stats_angebot.appointmentUnarranged
        this.appointmentByProfessionGroups = result.stats_angebot.appointmentByProfessionGroups

        this.dataYearSince = result.stats_angebot.dataYearSince
        this.dataDateUntil = result.stats_angebot.dataDateUntil
      }

      if (result.stats_nachfrage) {
        this.appointmentDemandTotal = result.stats_nachfrage.appointmentDemandTotal
        this.appointmentDemandUnarranged = result.stats_nachfrage.appointmentDemandUnarranged
        this.appointmentDemandArranged = result.stats_nachfrage.appointmentDemandArranged

        this.dataYearSince = result.stats_nachfrage.dataYearSince
        this.dataDateUntil = result.stats_nachfrage.dataDateUntil
      }

      this.isInProgress = false;
      this.hasNoData = false
      this.cdr.detectChanges()
      this.dataLastAggregation = localStorage.getItem('date_of_aggregation')
    }

    if (this.levelSettings['view'] === 'Planung') {
      this.isInProgress = false;
      this.hasNoData = false
      this.cdr.detectChanges()
      this.dataLastAggregation = localStorage.getItem('date_of_aggregation')
    }
  }

  /**
   * 
   * @param data array of objects
   * @param style byDate; byTheme; byPie
   * @returns 
   */
  constructChartData(data: any, style: any, chartcolor: string) {
    const result: any = {
      labels: [],
      fill: true,
      datasets: [{
        data: [],
        borderColor: chartcolor,
        backgroundColor: chartcolor,
        pointBorderColor: chartcolor,
        pointBackgroundColor: chartcolor
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

  // facharzt gruppe, Status, Dringlichkeit
  setMapTitle() {
    const urgencyString = this.levelSettings['urgency'] !== 'Gesamt' ? `${this.translateUrgency(this.levelSettings['urgency'])} ` : '';
    const statusString = `${this.levelSettings['status'] !== 'Gesamt' ? `${this.translateStatus(this.levelSettings['status'])} - ` : ''}`
    const fgString = `${this.levelSettings['fg'] !== 'Gesamt' ? `der ${this.levelSettings['fg']}` : ''}`
    const timeStringDay = `für ${this.levelSettings['resolutionPlaningOption'] === 'today' ? 'heute' : 'morgen'}`
    const timeStringMonth = `${this.levelSettings['resolutionPlaningOption'] === 'thisMonth' ? 'in diesem Monat' : 'für den letzen Monat'}`
    const result = `${urgencyString}${statusString}${this.levelSettings['thema'] === "Terminangebot" ? 'Terminangebote' : this.levelSettings['thema']} ${fgString} in ${this.levelSettings['levelValues']} ${this.levelSettings['resolution'] === 'upcoming_daily_plz4' ? timeStringDay : timeStringMonth}`

    return result
  }

  translateUrgency(urgency: string) {
    switch (urgency) {
      case 'AKUT':
        return 'Akute'
      case 'PT_AKUTBEHANDLUNG':
        return 'PT Akutbehandlungen'
      case 'DRINGEND':
        return 'dringende'
      case 'NICHT_DRINGEND':
        return 'nicht dringende'
      default:
        return ''
    }
  }

  translateStatus(status: string) {
    switch (status) {
      case 'booked':
        return 'gebuchte'
      case 'available':
        return 'verfügbare'
      case 'DRINGEND':
        return 'dringende'
      case 'unavailable':
        return 'nicht verfügbare'
      default:
        return ''
    }
  }
}
