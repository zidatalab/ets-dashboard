import { Component, OnInit, OnChanges, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { AggregationService } from 'src/app/services/aggregation.service';
// import { CsvexportService } from 'src/app/services/csvexport.service';
import { DBService } from 'src/app/services/db.service';
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
    private queryETerminData: ETerminQuery,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
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
      { key: "Wochen", value: 'upcoming_4weeks_plz4' }, { key: "Tage", value: "upcoming_daily_plz4" }
    ]
  }
  resolutionPlaningOptions = {
    daily: [
      { key: "Heute", value: "today" },
      { key: "Morgen", value: "tomorrow" }
    ],
    weekly: [
      { key: "vergangene 4 Wochen", value: "last4Weeks" },
      { key: "zukünftige 4 Wochen", value: "upcoming4Weeks" }
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
  professionGroups = [
    {
      professionGroup: 'Gesamt',
      subGroups: ['fg_long']
    },
    {
      professionGroup: 'Allgemeinmedizin',
      subGroups: ['Gesamt', 'Allgemeinmedizin',]
    },
    {
      professionGroup: 'Kindermedizin',
      subGroups: ['Gesamt', 'Kindermedizin', 'U-Untersuchungen']
    },
    {
      professionGroup: 'Anästhesiologie',
      subGroups: ['Gesamt', 'Anästhesiologie']
    },
    {
      professionGroup: 'Augenheilkunde',
      subGroups: ['Gesamt', 'Augenheilkunde']
    },
    {
      professionGroup: 'Chirurgie und Orthopädie',
      subGroups: ['Gesamt', 'Chirurgie und Orthopädie']
    },
    {
      professionGroup: 'Frauenheilkunde',
      subGroups: ['Gesamt', 'Frauenheilkunde']
    },
    {
      professionGroup: 'HNO-Heilkunde',
      subGroups: ['Gesamt', 'HNO-Heilkunde']
    },
    {
      professionGroup: 'Haut- und Geschlechtskrankheiten',
      subGroups: ['Gesamt', 'Haut- und Geschlechtskrankheiten']
    },
    {
      professionGroup: 'Innere Medizin',
      subGroups: ['Gesamt', 'Innere Medizin ohne Schwerpunkt', 'Gastroenterologie', 'Kardiologie', 'Endokrinologie und Diabetologie', 'Hämatologie und Onkologie', 'Nephrologie', 'Rheumatologie', 'Neurologie']
    },
    {
      professionGroup: 'Neurologie',
      subGroups: ['Gesamt', 'Neurologie']
    },
    {
      professionGroup: 'Psychotherapie',
      subGroups: ['Gesamt', 'PT nicht differenzierbar', 'PT-Sprechstunde', 'PT-Akutbehandlung', 'Probatorik', 'PT-Sprechstunde (Kinder und Jugend)', 'PT-Akutbehandlung (Kinder und Jugend)', 'Probatorik (Kinder und Jugend)']
    },
    {
      professionGroup: 'Radiologie',
      subGroups: ['Gesamt', 'Radiologie']
    },
    {
      professionGroup: 'Urologie',
      subGroups: ['Gesamt', 'Urologie']
    },
    {
      professionGroup: 'weitere ärztliche Gruppen',
      subGroups: ['Gesamt', 'Kinder- und Jugendpsychiatrie', 'weitere ärztliche Gruppen', 'Neurochirurgie', 'Nuklearmedizin', 'Strahlentherapie', 'Transfusionsmedizin', 'Humangenetik', 'Physikalische und rehabilitative Medizin']
    },
    {
      professionGroup: 'Sonstige',
      subGroups: ['Gesamt', 'Sonstige']
    }    
  ]
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
  timelineLevelSettings: any = {
    'level': 'KV',
    "fg": "Gesamt",
    'fgSubGroup': 'Gesamt',
    'levelValues': 'Gesamt',
    'zeitraum': 'letzten 12 Monate',
    'resolution': 'monthly',
    'thema': 'Terminangebot',
    'urgency': 'Gesamt',
    'view': 'Zeitreihen',
  };

  planingLevelSettings: any = {
    'level': 'KV',
    "fg": "Gesamt",
    'fgSubGroup': 'Gesamt',
    'levelValues': 'Berlin',
    'resolution': 'upcoming_daily_plz4',
    'thema': 'Terminangebot',
    'urgency': 'Gesamt',
    'view': 'Planung',
    'resolutionPlaningOption': 'today',
    'status': 'available'
  }

  changedSettings: any = {
    view: 'Zeitreihen'
  }

  ngOnInit(): void {
    this.getUrlParams()

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
          } else {
            this.levelValues = ['Gesamt']
          }

          this.setLevelData()
        }
      }, 100);
    }
  }

  filteredSubGroup(professionGroup: any) {
    const result: any = this.professionGroups.filter(item => item.professionGroup === professionGroup)

    if (result.length > 0) {
      return result[0].subGroups
    }

    return []
  }

  onChangeView(value: any) {
    if (value === 'Zeitreihen') {
      this.levelValues.unshift('Gesamt')
      this.levelSettings = {
        'level': 'KV',
        "fg": "Gesamt",
        'fgSubGroup': 'Gesamt',
        'levelValues': 'Gesamt',
        'zeitraum': 'letzten 12 Monate',
        'resolution': 'monthly',
        'thema': 'Terminangebot',
        'urgency': 'Gesamt',
        'view': 'Zeitreihen',
      };

      return
    }

    if (value === 'Planung') {
      this.levelValues = this.levelValues.filter(level => level !== 'Gesamt')
      this.levelSettings = {
        'level': 'KV',
        "fg": "Gesamt",
        'fgSubGroup': 'Gesamt',
        'levelValues': this.levelValues[0],
        'resolution': 'upcoming_daily_plz4',
        'thema': 'Terminangebot',
        'urgency': 'Gesamt',
        'view': 'Planung',
        'resolutionPlaningOption': 'today',
        'status': 'available'
      }

      return
    }
  }

  setUrlParams() {
    const stringifiedParams = JSON.stringify(this.changedSettings);
    const encodeParams = encodeURIComponent(stringifiedParams);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        params: encodeParams,
      }
    });
  }

  getUrlParams() {
    if (!Object.keys(this.route.snapshot.queryParams).length) {
      this.levelSettings = this.timelineLevelSettings

      return
    }

    const params = this.route.snapshot.queryParams['params'];
    const decodeParams = decodeURIComponent(params);
    let parsedParams = JSON.parse(decodeParams);

    if (parsedParams.reslution === 'upcoming_daily_plz4' && !parsedParams.resolutionPlaningOption) {
      parsedParams.resolutionPlaningOption = 'today'
    }

    if (parsedParams.resolution === 'upcoming_monthly_plz4' && !parsedParams.resolutionPlaningOption) {
      parsedParams.resolutionPlaningOption = 'thisMonth'
    }

    this.changedSettings = parsedParams;

    if (parsedParams.view === 'Planung') {
      this.levelSettings = this.planingLevelSettings
      this.levelValues = this.levelValues.filter(level => level !== 'Gesamt')

      if (!parsedParams.levelValues) {
        parsedParams.levelValues = this.levelValues[0];
      }
    }

    if (parsedParams.view === 'Zeitreihen') {
      this.levelSettings = this.timelineLevelSettings

      if (!this.levelValues.includes('Gesamt')) {
        this.levelValues.unshift('Gesamt')
      }
    }

    for (let [key, value] of Object.entries(parsedParams)) {
      this.levelSettings[key] = value
    }
  }

  resetUrlParams(view: any) {
    this.changedSettings = {
      view: view
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });

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
    if (level && value) {
      Object.assign(this.changedSettings, {
        [level]: value
      });
    }

    if (level === 'resolution') {
      if (value === 'upcoming_daily_plz4') {
        this.levelSettings['resolutionPlaningOption'] = 'today'
        this.changedSettings['resolutionPlaningOption'] = 'today'
      }

      if (value === 'upcoming_monthly_plz4') {
        this.levelSettings['resolutionPlaningOption'] = 'thisMonth'
        this.changedSettings['resolutionPlaningOption'] = 'thisMonth'
      }
    }

    if (level === 'view') {
      this.onChangeView(value)
      this.resetUrlParams(value)
    }

    if (level === 'thema') {
      this.levelSettings['fg'] = 'Gesamt'
    }

    if (level === 'resolution' && value === 'upcoming_4weeks_plz4') {
      this.levelSettings['resolutionPlaningOption'] = 'last4Weeks'
    }

    if (level === 'resolution' && value === 'upcoming_daily_plz4') {
      this.levelSettings['resolutionPlaningOption'] = 'today'
    }
    
    if(level === 'fg') {
      this.levelSettings['fgSubGroup'] = 'Gesamt'
    }

    this.levelSettings[level] = value
    this.levelSettings = this.aggregation.updateStartStop(this.levelSettings)
    if (this.levelSettings['start'] && this.levelSettings['stop']) {
      await this.setData().then(() => {
        if (Object.keys(this.changedSettings).length > 0) {
          this.setUrlParams()
        }
      })
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
    const timeStringWeeks = `${this.levelSettings['resolutionPlaningOption'] === 'last4Weeks' ? 'für die letzten 4 Wochen' : 'für die nächsten 4 Wochen'}`
    const result = `${urgencyString}${statusString}${this.levelSettings['thema'] === "Terminangebot" ? 'Terminangebote' : this.levelSettings['thema']} ${fgString} in ${this.levelSettings['levelValues']} ${this.levelSettings['resolution'] === 'upcoming_daily_plz4' ? timeStringDay : timeStringWeeks}`

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
