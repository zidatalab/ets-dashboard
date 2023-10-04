import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Plot } from '../../../models/plot.model'
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { AggregationService } from 'src/app/services/aggregation.service';
// import { CsvexportService } from 'src/app/services/csvexport.service';
import { DBService } from 'src/app/services/db.service';
import { Router } from '@angular/router';
import { SmedQuery } from '../../dataQueries/smed/smedQuery';

@Component({
  selector: 'smed-dashboard-render',
  templateUrl: './smedDashboardRender.html',
})
export class SmedDashboardRender implements OnInit {

  constructor(
    private db: DBService,
    // private csv:,
    private api: ApiService,
    private auth: AuthService,
    private aggregation: AggregationService,
    private router: Router,
    private querySmedData: SmedQuery,
    private cdr: ChangeDetectorRef
  ) { }

  plots: Plot = [
    {
      type: '',
      data: []
    }
  ]

  metaData = [];
  inProgress: boolean = true;
  isMetaDataOk: boolean = false;
  mapData: any;
  mapDataFor: any;
  sortData = [];
  level: any;
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
  subGroups: any;
  outcomes: any;
  determinants: any;
  levelSettings: any = {};
  data: any;
  dataKeys: any;
  currentUser: any;
  dataRate: any;
  dataNumber: any;
  geojsonAvailable: any;
  colorScheme: any;
  levelId: string = '';
  dataKeyStable: any;
  isDebug = false;
  // SMED
  statsTs: any = [];
  symptomsList: any;
  symptomsListExport: any;
  summaryInfo: any = {};
  smedRange = {};
  timeRangeOptions = ["Letzte 12 Monate", "Letztes Jahr", "Gesamt"];
  allPublicFields = ['stats', 'mainsymptoms_ts', 'timetotreat', 'timestats', 'qmCases'];
  tsResults = {};
  utilTimes = {};
  timeToTreat: any;
  qmCases: any;
  decisionsTtt: any;
  decisionsPoc: any;
  decisionsPocvsttt: any;
  timeToGo: number = 0;
  isAbsoluteNumbers: boolean = false

  ngOnInit(): void {
    this.isAbsoluteNumbers = false
    this.levelSettings = { 'level': 'KV', 'levelValues': 'Gesamt', 'zeitraum': 'Letzte 12 Monate', 'resolution': 'monthly' }
    this.summaryInfo['done'] = false
    this.colorScheme = this.api.makeScale(5)
    this.mapDataFor = ''
    this.mapData = []
    this.levelSettings = this.aggregation.updateStartStop(this.levelSettings)
    this.auth.currentUser.subscribe(data => {
      this.currentUser = data
    })

    this.updateMetaData()

    window.scroll(0, 0)

    this.setLevel('__init', '')

    setTimeout(() => {
      if (this.statsTs.length === 0) {
        this.setLevel('__init', '')
      }
    }, 1500);

    this.timeToGo = this.checkPortalOnline()

    if ((this.timeToGo < 0) && !this.currentUser) {
      setInterval(() => {
        this.timeToGo = this.checkPortalOnline()

        if (this.timeToGo >= 0) {
          this.router.navigate(['/'])
        }
      }, 500)
    }
  }

  ngOnDestroy() {
    this.mapData = []
  }

  absolutNumberChange(value: any) {
    this.isAbsoluteNumbers = value
  }

  async setLevel(level: any, value: any) {
    if (!this.currentUser && (this.timeToGo < 0)) {
      return null
    }

    if (level !== "__init") {
      this.levelSettings[level] = value;
      this.levelSettings = this.aggregation.updateStartStop(this.levelSettings);
    };

    this.summaryInfo = [];
    this.statsTs = [];
    this.utilTimes = {};
    this.decisionsTtt = [];
    this.decisionsPoc = [];
    this.decisionsPocvsttt = [];
    this.timeToTreat = NaN;
    this.qmCases = NaN;

    if (this.metaData.length === 0) {
      this.updateMetaData();

      return null;
    }

    if (this.levelSettings['start'] && this.levelSettings['stop']) {
      this.inProgress = true;

      await this.setData()

      if (this.currentUser) {
        await this.setData('decisions');
      };
    }

    return null
  }

  async updateMetaData() {
    // if (await this.api.getMetaData('metadata')) {
    if (true) {
      this.metaData = await this.api.getMetaData('metadata')
    }

    if (this.metaData) {
      if (this.metaData.length > 0) {
        this.dometaSettings()
      }
    } else {
      this.metaData = []

      setTimeout(() => {
        if ((this.metaData !== undefined) && (this.sortData !== undefined)) {
          if (this.metaData.length > 0) {
            this.dometaSettings()
          }
        } else {
          this.isMetaDataOk = false
          this.metaData = []
        }
      }, 1500);
    }
  }

  dometaSettings() {
    this.level = this.api.filterArray(this.metaData, 'type', 'level')[0]['varname']
    this.levelId = this.api.filterArray(this.metaData, 'type', 'levelid')[0]['varname']
    this.subGroups = ['Keine'].concat(this.api.getValues(this.api.filterArray(this.metaData, 'type', 'group'), 'varname'))
    this.isMetaDataOk = true
  }

  exportAsCSV(name: any, data: any) {

  }

  async setData(input: any = '') {
    this.levelSettings = this.aggregation.updateStartStop(this.levelSettings);

    const result = await this.querySmedData.getQueryData(input, this.levelSettings, this.allPublicFields)

    if (result) {
      if (result.stats) {
        this.statsTs = result.stats.statsTs
        this.summaryInfo = result.stats.summaryInfo
      }

      if (result.mainsymptoms_ts) {
        this.symptomsList = result.mainsymptoms_ts
      }

      if (result.timestats) {
        // this.utilTimes = result.timestats
      }

      if (result.timetotreat) {
        this.timeToTreat = result.timeToTreat
      }

      if (result.decisions) {
        const getAll = result.decisions

        this.decisionsTtt = getAll.decisionsTtt
        this.decisionsPoc = getAll.decisionsPoc
        this.decisionsPocvsttt = getAll.decisionsPocvsttt
      }

      if (result.qmCases) {
        this.qmCases = result.qmCases
      }
    }

    this.inProgress = false
    this.cdr.detectChanges()
  }

  checkPortalOnline() {
    const date1 = new Date("2022-03-14 08:00:00".replace(/-/g, "/"))
    const date2 = new Date()

    return date2.getTime() - date1.getTime()
  }

  stringCount(timeDiff: any) {
    if (timeDiff >= 0) {
      return ''
    }

    const days = Math.floor(-timeDiff / (1000 * 60 * 60 * 24));
    let hours = Math.floor(-timeDiff / (1000 * 60 * 60));
    let minutes = Math.floor(-timeDiff / (1000 * 60));
    let seconds = Math.floor(-timeDiff / (1000));

    hours = Math.floor((hours / 24 - Math.floor(hours / 24)) * 24);
    minutes = Math.floor((minutes / 60 - Math.floor(minutes / 60)) * 60);
    seconds = Math.floor((seconds / 60 - Math.floor(seconds / 60)) * 60);

    return days + ' Tage ' + hours + " Stunden " + minutes + " Minuten " + seconds + " Sekunden";
  }
}

