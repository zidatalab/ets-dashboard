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
  resolutionOptions = [{ key: "Gesamt", value: 'Gesamt' }, { key: "Kalenderwoche", value: 'weekly' }, { key: "Tage", value: "daily" }];
  professionGroups = ["Gesamt", "Psychotherapeuten", "Fachinternisten", "Nervenärzte", "Hautärzte", "Augenärzte", "Orthopäden", "Kinderärzte", "Frauenärzte", "Hausarzt", "Chirurgen", "Urologen", "HNO-Ärzte", "Weitere Arztgruppen", "Transfusionsmediziner", "Sonderleistungen"]
  themes = ["Überblick", "Terminangebot", "Anfrage"]
  levelSettings: any = {};
  data: any;
  currentUser: any;
  colorScheme: any;
  allPublicFields = ["stats_angebot", "dringlichkeit", "status_dringlichkeit_combined"]
  summaryInfo: any = []
  professionGroup: any = ''
  appointmentOffer: any = []

  async ngOnInit(): Promise<void> {
    this.levelSettings = { 'level': 'KV', "fg": "Gesamt", 'levelValues': 'Gesamt', 'zeitraum': 'Letzte 12 Monate', 'resolution': 'monthly' }
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
      if (result.stats_angebot) {
        this.summaryInfo = result.stats_angebot.summaryInfo
        this.appointmentOffer = result.stats_angebot.appointmentOfferTotal
      }
    }
  }
}