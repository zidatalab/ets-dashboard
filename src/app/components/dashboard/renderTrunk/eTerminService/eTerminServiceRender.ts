import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
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
    'Nordrhein',
    'Westfalen-Lippe',
    'Rheinland-Pfalz',
    'Saarland',
    'Sachsen',
    'Sachsen-Anhalt',
    'Schleswig-Holstein',
    'Thüringen'
  ];
  resolutionOptions = [{ key: "Monate", value: 'monthly' },{ key: "Kalenderwochen", value: 'weekly' }, { key: "Tage", value: "daily" }];
  professionGroups = ["Gesamt", "Psychotherapeuten", "Fachinternisten", "Nervenärzte", "Hautärzte", "Augenärzte", "Orthopäden", "Kinderärzte", "Frauenärzte", "Hausarzt", "Chirurgen", "Urologen", "HNO-Ärzte", "Weitere Arztgruppen", "Transfusionsmediziner", "Sonderleistungen"]
  themes = ["Überblick", "Terminangebot", "Terminnachfrage"]
  urgencies = [{ key: "Gesamt", value: -1 }, { key: "Akut", value: "AKUT" }, { key: "Dringend", value: "DRINGEND" }, { key: "Nicht Dringend", value: "NICHT_DRINGEND" },]
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
      numberformat:""
    },
    {
      key: "demand",
      name: "Nachfrage",
      firstTile: "Terminsuchen",
      firstTileColor: "#EB9F47",
      secondTile: "erfolglose Terminsuchen",
      secondTileColor: "#ebd247",
      thirdTile: "erfolgreiche Buchungen",
      thirdTileColor: "#C8D42B",
    },
    {
      key: "overview",
      name: "Überblick",
      firstTile: "erfolglose Terminsuchen",
      firstTileColor: "#EB9F47",
      secondTile: "vermittelte Termine",
      secondTileColor: "#C8D42B",
      thirdTile: "nicht vermittelte Termine",
      thirdTileColor: "#FF879E",
    },
  ]
  selectedContainerStringObject: any
  dataYearSince: any = ''
  dataDateSince: any = ''
  dataDateUntil: any = ''
  dataLastAggregation: any = ''  
  async ngOnInit(): Promise<void> {
    this.levelSettings = { 'level': 'KV', "fg": "Gesamt", 'levelValues': 'Gesamt', 'zeitraum': 'Letzte 12 Monate', 'resolution': 'monthly', 'thema': 'Überblick', 'urgency': -1 }
    this.currentUser = this.auth.getUserDetails()
    this.dataLastAggregation = localStorage.getItem('date_of_aggregation')
    this.setKeyDataString()
    this.levelSettings = this.aggregation.updateStartStop(this.levelSettings)
    this.metaData = await this.updateMetaData()    
    if (this.metaData) {
      // If user is logged in, check access
      if (this.currentUser){
        if (!this.currentUser.is_superadmin){
        this.levelValues= this.identifyaccesslevelids()     
        }
        }
      // else: User has only access to Gesamt
      else {
        this.levelValues=['Gesamt']
      }
      
      await this.setLevelData()      
      
     
    }
    

    // this.queryETerminData.getQueryData('',this.levelSettings)
  }

  // function to check for levels, the user has access
  identifyaccesslevelids(){    
    let usergroupsfordashboard = Array()
    let levelsallowed = Array()
    let levelidmeta:any
    usergroupsfordashboard= this.auth.getUserDetails().usergroups[this.api.clientApiId]
    levelidmeta= this.metaData.find((element) => element['type'] === "levelid")
    let levelrights = levelidmeta?.levelrights  
    usergroupsfordashboard.push('public')
    for (let thegroup of usergroupsfordashboard){
      let theids = Array()
      if (levelrights[thegroup]){
        theids=levelrights[thegroup]
      for (let theid of theids){
        if (levelsallowed.indexOf(theid) === -1) {      
          levelsallowed.push(theid);
        }
      }

      }
      
    }
    return levelsallowed
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
    this.inProgress=true
    this.cdr.detectChanges()
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
      this.inProgress=false;
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
  constructChartData(data: any, style: any , chartcolor: string ) {
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
  
}


