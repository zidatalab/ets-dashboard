import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { AggregationService } from 'src/app/services/aggregation.service';
// import { CsvexportService } from 'src/app/services/csvexport.service';
import { DBService } from 'src/app/services/db.service';
import { Router } from '@angular/router';

@Component({
  template: `
    <app-dashboard></app-dashboard>
  `
})
export class HomeComponent {

  // constructor(
  //   private db: DBService,
  //   // private csv:,
  //   private api: ApiService,
  //   private auth: AuthService,
  //   private aggregation: AggregationService,
  //   private router: Router
  // ) { }

  // metaData = [];
  // inProgress: boolean = false;
  // isMetaDataOk: boolean = false;
  // mapData: any;
  // mapDataFor: any;
  // sortData = [];
  // level: any;
  // levelValues = [
  //   'Gesamt',
  //   'Baden-Württemberg',
  //   'Bayern',
  //   'Berlin',
  //   'Brandenburg',
  //   'Bremen',
  //   'Hamburg',
  //   'Hessen',
  //   'Mecklenburg-Vorpommern',
  //   'Niedersachsen',
  //   'Nordrhein-Westfalen',
  //   'Nordrhein',
  //   'Westfalen-Lippe',
  //   'Rheinland-Pfalz',
  //   'Saarland',
  //   'Sachsen',
  //   'Sachsen-Anhalt',
  //   'Schleswig-Holstein',
  //   'Thüringen'
  // ];
  // subGroups: any;
  // outcomes: any;
  // determinants: any;
  // levelSettings: any = {};
  // data: any;
  // dataKeys: any;
  // currentUser: any;
  // dataRate: any;
  // dataNumber: any;
  // geojsonAvailable: any;
  // colorScheme: any;
  // levelId: string = '';
  // dataKeyStable: any;
  // isDebug = false;
  // // SMED
  // statsTs: any = [];
  // symptomsList: any;
  // symptomsListExport: any;
  // summaryInfo: any = {};
  // smedRange = {};
  // timeRangeOptions = ["Letzte 12 Monate", "Letztes Jahr", "Gesamt"];
  // allPublicFields = ['stats', 'mainsymptoms_ts', 'timetotreat', 'timestats', 'qmCases'];
  // tsResults = {};
  // utilTimes = {};
  // timeToTreat: any;
  // qmCases: any;
  // decisionsTtt: any;
  // decisionsPoc: any;
  // decisionsPocvsttt: any;
  // timeToGo: number = 0;
  // isAbsoluteNumbers: boolean = false

  // ngOnInit(): void {
  //   this.levelSettings = { 'level': 'KV', 'levelValues': 'Gesamt', 'zeitraum': 'Letzte 12 Monate', 'resolution': 'monthly' }
  //   this.summaryInfo['done'] = false
  //   this.colorScheme = this.api.makeScale(5)
  //   this.mapDataFor = ''
  //   this.mapData = []
  //   this.levelSettings = this.aggregation.updateStartStop(this.levelSettings)
  //   this.auth.currentUser.subscribe(data => {
  //     this.currentUser = data
  //   })

  //   this.updateMetaData()

  //   window.scroll(0, 0)

  //   this.setLevel('__init', '')

  //   setTimeout(() => {
  //     if (this.statsTs.length === 0) {
  //       this.setLevel('__init', '')
  //     }
  //   }, 1500);

  //   this.timeToGo = this.checkPortalOnline()

  //   if ((this.timeToGo < 0) && !this.currentUser) {
  //     setInterval(() => {
  //       this.timeToGo = this.checkPortalOnline()

  //       if (this.timeToGo >= 0) {
  //         this.router.navigate(['/'])
  //       }
  //     }, 500)
  //   }
  // }

  // ngOnDestroy() {
  //   this.mapData = []
  // }

  // async setLevel(level: any, value: any) {
  //   if (!this.currentUser && (this.timeToGo < 0)) {
  //     return null
  //   }

  //   if (level !== "__init") {
  //     this.levelSettings[level] = value;
  //     this.levelSettings = this.aggregation.updateStartStop(this.levelSettings);
  //   };

  //   this.summaryInfo = [];
  //   this.statsTs = [];
  //   this.utilTimes = {};
  //   this.decisionsTtt = [];
  //   this.decisionsPoc = [];
  //   this.decisionsPocvsttt = [];
  //   this.timeToTreat = NaN;
  //   this.qmCases = NaN;

  //   if (this.metaData.length === 0) {
  //     this.updateMetaData();

  //     return null;
  //   }

  //   if (this.levelSettings['start'] && this.levelSettings['stop']) {
  //     this.inProgress = true;

  //     await this.queryData();

  //     if (this.currentUser) {
  //       await this.queryData('decisions');
  //     };
  //   }

  //   return null
  // }

  // async updateMetaData() {
  //   if (await this.api.getMetaData('metadata')) {
  //     this.metaData = await this.api.getMetaData('metadata')
  //   }

  //   if (this.metaData) {
  //     if (this.metaData.length > 0) {
  //       this.dometaSettings()
  //     }
  //   } else {
  //     this.metaData = []

  //     setTimeout(() => {
  //       if ((this.metaData !== undefined) && (this.sortData !== undefined)) {
  //         if (this.metaData.length > 0) {
  //           this.dometaSettings()
  //         }
  //       } else {
  //         this.isMetaDataOk = false
  //         this.metaData = []
  //       }
  //     }, 1500);
  //   }
  // }

  // dometaSettings() {
  //   this.level = this.api.filterArray(this.metaData, 'type', 'level')[0]['varname']
  //   this.levelId = this.api.filterArray(this.metaData, 'type', 'levelid')[0]['varname']
  //   this.subGroups = ['Keine'].concat(this.api.getValues(this.api.filterArray(this.metaData, 'type', 'group'), 'varname'))
  //   this.isMetaDataOk = true
  // }

  // async queryData(input: any = '') {
  //   const now: Date = new Date()
  //   let oldStand: Date = new Date()
  //   let dataAge = 0
  //   let query: any = {
  //     'client_id': this.api.clientApiId,
  //     'groupinfo': {}
  //   }
  //   let dbDataRange: any

  //   query['groupinfo']['level'] = 'KV'
  //   query['groupinfo']['levelid'] = this.levelSettings['levelValues']
  //   query['groupinfo']['timeframe'] = this.levelSettings['resolution']
  //   query['groupinfo']['Jahr'] = {
  //     '$gte': parseInt(this.levelSettings['start'].slice(0, 4)),
  //     '$lte': parseInt(this.levelSettings['stop'].slice(0, 4))
  //   }

  //   if (input !== '') {
  //     query['showfields'] = [input, 'KM6Versicherte', 'BEVSTAND']
  //   } else {
  //     query['showfields'] = this.allPublicFields.concat(['KM6Versicherte', 'BEVSTAND'])
  //   }

  //   if (input !== '') {
  //     await this.db.queryDataDates(
  //       'KV',
  //       this.levelSettings['levelValues'],
  //       input,
  //       this.levelSettings['resolution']
  //     ).then(data => {
  //       if (data.length > 0) {
  //         dbDataRange = Object.create(data[0])
  //       }
  //     })
  //   } else {
  //     await this.db.queryDataDates(
  //       'KV',
  //       this.levelSettings['levelValues'],
  //       this.allPublicFields[0],
  //       this.levelSettings['resolution']
  //     ).then(data => {
  //       if (data.length > 0) {
  //         dbDataRange = Object.create(data[0])
  //       }
  //     })
  //   }

  //   if (!dbDataRange) {
  //     dbDataRange = { 'startdate': '2000-01-01', 'stopdate': '2000-01-01' };
  //   } else {
  //     oldStand = new Date(dbDataRange['Stand'])
  //     dataAge = (now.getTime() - oldStand.getTime()) / (1000 * 60 * 60)
  //   }

  //   if ((dbDataRange['startdate'] <= this.levelSettings['start']) && (dbDataRange['stopdate'] >= this.levelSettings['stop'])
  //     && (dataAge < 6)) {
  //     if (input !== '') {
  //       this.makeData(input)
  //     } else {
  //       for (let item of this.allPublicFields) {
  //         this.makeData(item)
  //       }
  //     }
  //   } else {
  //     await this.api.postTypeRequest('get_data/', query).subscribe(
  //       (data: any) => {
  //         let result = data['data']

  //         if (input === '') {
  //           for (let item of result) {
  //             if (!item.mainsymptoms_ts) {
  //               item.mainsymptoms_ts = []
  //             }
  //           }
  //         }

  //         if (input !== '' && result.length > 0) {
  //           this.db.deleteWhere(input, 'KV', this.levelSettings['levelValues'], this.levelSettings['resolution'], this.levelSettings['start'], this.levelSettings['stop'])
  //             .then(() => {
  //               this.updateDB(result, input)
  //             })
  //           this.db.store(input, 'KV', this.levelSettings['levelValues'], now.toISOString(), this.levelSettings['start'], this.levelSettings['stop'], this.levelSettings['resolution'])
  //         }

  //         if (input === '' && result.length > 0) {
  //           for (let item of this.allPublicFields) {
  //             this.db.deleteWhere(item, 'KV', this.levelSettings['levelValues'], this.levelSettings['resolution'], this.levelSettings['start'], this.levelSettings['stop'])
  //               .then(() => {
  //                 this.updateDB(result, item)
  //               })
  //             this.db.store(item, 'KV', this.levelSettings['levelValues'], now.toISOString(), this.levelSettings['start'], this.levelSettings['stop'], this.levelSettings['resolution'])
  //           }
  //         }
  //       }, error => { }
  //     )
  //   }
  // }

  // async updateDB(data: any, input: any) {
  //   await this.aggregation.newCombine(data, input)
  //   await this.makeData(input)
  // }

  // exportAsCSV(name: any, data: any) {

  // }

  // async makeData(input: any) {
  //   this.levelSettings = this.aggregation.updateStartStop(this.levelSettings);

  //   if (input === "stats") {
  //     this.statsTs = [];
  //     this.summaryInfo = [];
  //     let statSWDate: any = await this.db.listData(
  //       'stats',
  //       "KV",
  //       this.levelSettings['levelValues'],
  //       this.levelSettings['start'],
  //       this.levelSettings['stop'],
  //       true,
  //       this.levelSettings["resolution"]);

  //     if (statSWDate.length > 0) {

  //       for (let item of statSWDate) {
  //         item["Mittlere Dauer (Sek.)"] = (item["DAUERsmed"] / item["DAUERsmedFaelle"]);

  //         if (item["Dauer_sek"] == 0) {
  //           item["Mittlere Dauer (Sek.)"] = null;
  //         }

  //         item["Mittlere Anzahl Beschwerden"] = item["Anzahl_Beschwerden"] / item["Assessments"];
  //         item["Mittlere Anzahl Fragen"] = item["Anzahl_Fragen"] / item["Assessments"];

  //         if (item["Anzahl_Beschwerden"] == 0) {
  //           item["Mittlere Anzahl Beschwerden"] = null;
  //         }

  //         item["Assessments pro 100 Tsd. Einw."] = item["Assessments"] / (item["BEVSTAND"] / 1e5);
  //         item["Anteil ARE Assessments"] = (100 * ((item["Assessments_mit_ARE_v3"] / item["Assessments"]) / .25)) - 100;

  //         item['totaleNumbers'] = item['Assessments']
  //       };

  //       this.statsTs = statSWDate;
  //       let levelId = this.statsTs[0]['levelid'];

  //       if (levelId != "Gesamt") { this.summaryInfo["levelid"] = " in ".concat(levelId); }
  //       else { this.summaryInfo["levelid"] = " in Deutschland"; };

  //       this.summaryInfo["Assessments Gesamt"] = this.api.sumArray(this.api.getValues(this.statsTs, "Assessments"));
  //       this.summaryInfo["Assessments pro Woche"] = this.summaryInfo["Assessments Gesamt"] / this.api.getValues(this.statsTs, "Assessments").length;
  //       this.summaryInfo["Mittlere Dauer"] = this.api.sumArray(this.api.getValues(this.statsTs, "DAUERsmed")) / this.api.sumArray(this.api.getValues(this.statsTs, "DAUERsmedFaelle"));
  //       this.summaryInfo["Anzahl Beschwerden"] = this.api.sumArray(this.api.getValues(this.statsTs, "Anzahl_Beschwerden")) / this.summaryInfo["Assessments Gesamt"];
  //       this.summaryInfo["Anzahl Fragen"] = this.api.sumArray(this.api.getValues(this.statsTs, "Anzahl_Fragen")) / this.summaryInfo["Assessments Gesamt"];
  //       let sorteddates = this.api.getValues(this.statsTs, "Datum").sort();
  //       this.summaryInfo["Beginn"] = new Date(sorteddates[0]);
  //       this.summaryInfo["Ende"] = new Date(sorteddates.pop());
  //       this.summaryInfo["done"] = true;

  //       this.inProgress = false;
  //     }
  //   }

  //   if (input === "mainsymptoms_ts") {
  //     let symptoms_list: any = [];

  //     symptoms_list = await this.db.listData('mainsymptoms_ts', "KV", this.levelSettings['levelValues'], this.levelSettings['start'], this.levelSettings['stop'], true, this.levelSettings["resolution"]);
  //     symptoms_list = this.api.getValues(symptoms_list, 'data');

  //     this.symptomsListExport = this.api.sortArray(this.api.groupBySum(symptoms_list, 'Sympt', '', 'n'), 'n', "descending");

  //     for (let item of this.symptomsListExport) {
  //       let anzahl_symptome = this.api.sumArray(this.api.getValues(this.symptomsListExport, "n"));
  //       item["Anteil"] = Math.round(1000 * item['n'] / anzahl_symptome) / 10;
  //     }

  //     this.symptomsList = this.symptomsListExport.slice(0, 15);
  //   };

  //   if (input == "timestats") {
  //     let utilTimes: any = [];
  //     let dbUtilTimes = await this.db.listData('timestats', "KV", this.levelSettings['levelValues'], this.levelSettings['start'], this.levelSettings['stop'], false, this.levelSettings["resolution"]);
  //     dbUtilTimes = this.api.getValues(dbUtilTimes, 'data');
  //     utilTimes = this.api.groupBySum(dbUtilTimes, "wt", "h", "n");
  //     let nTotal = this.api.sumArray(this.api.getValues(utilTimes, 'n'));
  //     dbUtilTimes = [];

  //     for (let item of utilTimes) {
  //       item["Wochentag"] = this.api.getWeekDayName(item["wt"]);
  //       item['Anzahl'] = item['n'];
  //       item['Anteil'] = 0.1 * Math.round(1000 * item['n'] / nTotal);
  //       item['TimeLabel'] = item['h'] + "-" + (item['h'] + 2) + 'h';

  //       delete item['n'];
  //     }

  //     // this.utilTimes = this.api.makeheatmapdata(utiltimes, "wt", "h", 'Anteil', 'Wochentag', 'TimeLabel');
  //   };

  //   if (input == "timetotreat") {
  //     let result: any = [];
  //     let standardSort = [
  //       {
  //         TTTsmed_text: undefined,
  //         Anzahl: 0,
  //         Anteil: 0
  //       },
  //       {
  //         TTTsmed_text: 'Notfall',
  //         Anzahl: 0,
  //         Anteil: 0
  //       },
  //       {
  //         TTTsmed_text: 'schnellstmögliche ärztliche Behandlung',
  //         Anzahl: 0,
  //         Anteil: 0
  //       },
  //       {
  //         TTTsmed_text: 'Ärztliche Behandlung innerhalb von 24h',
  //         Anzahl: 0,
  //         Anteil: 0
  //       },
  //       {
  //         TTTsmed_text: 'Ärztliche Behandlung nicht innerhalb von 24h erforderlich',
  //         Anzahl: 0,
  //         Anteil: 0
  //       },
  //       {
  //         TTTsmed_text: 'k.A./Befragung unklar',
  //         Anzahl: 0,
  //         Anteil: 0
  //       }
  //     ]

  //     result = await this.db.listData('timetotreat', "KV", this.levelSettings['levelValues'], this.levelSettings['start'], this.levelSettings['stop'], true, this.levelSettings["resolution"]);
  //     result = this.api.groupBySum(result, 'TTTsmed_text', '', 'Anzahl');
  //     const total = this.api.sumArray(this.api.getValues(result, 'Anzahl'));

  //     for (let item of result) {
  //       item['Anteil'] = Math.round(1000 * item['Anzahl'] / total) / 10;
  //     }

  //     if (result[0].TTTsmed_text !== undefined) {
  //       result.push({ TTTsmed_text: undefined, Anzahl: 0, Anteil: 0 })
  //     }

  //     this.timeToTreat = createStandardSort(result);

  //     function createStandardSort(data: any) {
  //       const result = []

  //       for (const item of standardSort) {
  //         for (const _item of data) {
  //           if (item.TTTsmed_text === _item.TTTsmed_text) {
  //             item.Anteil = _item.Anteil
  //             item.Anzahl = _item.Anzahl
  //           }
  //         }
  //         result.push(item)
  //       }
  //       return result.reverse()
  //     }
  //   }

  //   if (input == "decisions") {
  //     let decisions: any = [];
  //     decisions = await this.db.listData('decisions', "KV", this.levelSettings['levelValues'], this.levelSettings['start'], this.levelSettings['stop'], true, this.levelSettings["resolution"]);
  //     let total = this.api.sumArray(this.api.getValues(decisions, 'Anzahl'));
  //     this.decisionsTtt = this.api.replaceMissing(this.api.groupBySum(decisions, 'TTTsmed_text', "TTTdispo_text", 'Anzahl'), 'TTTdispo_text', "Keine Daten");
  //     this.decisionsPoc = this.api.replaceMissing(this.api.groupBySum(decisions, 'POCsmed_text', "POCdispo_text", 'Anzahl'), 'POCdispo_text', "Keine Daten");;
  //     this.decisionsPocvsttt = this.api.groupBySum(decisions, 'TTTsmed_text', "POCsmed_text", 'Anzahl');
  //   }

  //   if (input === "qmCases") {
  //     let standardSort = [
  //       {
  //         text: "Vortriage",
  //         data: 0,
  //       },
  //       {
  //         text: 'nur Notfall ausgeschlossen',
  //         data: 0,
  //       },
  //       {
  //         text: 'Assessment vollständig',
  //         data: 0,
  //       },
  //       {
  //         text: 'Assessement abgekürzt',
  //         data: 0,
  //       },
  //       {
  //         text: 'SmED nicht anwendbar',
  //         data: 0,
  //       },
  //     ]

  //     const data: any = await this.db.listData('stats', "KV", this.levelSettings['levelValues'], this.levelSettings['start'], this.levelSettings['stop'], true, this.levelSettings["resolution"]);
  //     let total = 0

  //     if (data.length > 0) {
  //       for (const item of data) {
  //         if (item["QMFaelle"]) {
  //           total += item["QMFaelle"]
  //           for (const _item of standardSort) {
  //             if (_item.text === "Vortriage") {
  //               if (_item.data === 0) {
  //                 _item.data = (this.api.sumArray(this.api.getValues(data, "QM_Kat_Vortriage")))
  //               }
  //             }
  //             if (_item.text === "nur Notfall ausgeschlossen") {
  //               if (_item.data === 0) {
  //                 _item.data = (this.api.sumArray(this.api.getValues(data, "QM_Kat_nur_Notfall_ausgeschlossen")))
  //               }
  //             }
  //             if (_item.text === "Assessment vollständig") {
  //               if (_item.data === 0) {
  //                 _item.data = (this.api.sumArray(this.api.getValues(data, "QM_Kat_Assessment_vollst")))
  //               }
  //             }
  //             if (_item.text === "Assessement abgekürzt") {
  //               if (_item.data === 0) {
  //                 _item.data = (this.api.sumArray(this.api.getValues(data, "QM_Kat_Assessment_abgekuerzt")))
  //               }
  //             }
  //             if (_item.text === "SmED nicht anwendbar") {
  //               if (_item.data === 0) {
  //                 _item.data = (this.api.sumArray(this.api.getValues(data, "QM_Kat_SmED_nicht_anwendbar")))
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }

  //     if (standardSort) {
  //       for (const item of standardSort) {
  //         item.data = inPercent(item.data, total)
  //       }
  //     }

  //     this.qmCases = standardSort.reverse()

  //     function inPercent(x: any, y: any) {
  //       const result = Math.round(1000 * x / y) / 10

  //       return result
  //     }
  //   }
  // }

  // checkPortalOnline() {
  //   const date1 = new Date("2022-03-14 08:00:00".replace(/-/g, "/"))
  //   const date2 = new Date()

  //   return date2.getTime() - date1.getTime()
  // }

  // stringCount(timeDiff: any) {
  //   if (timeDiff >= 0) {
  //     return ''
  //   }

  //   const days = Math.floor(-timeDiff / (1000 * 60 * 60 * 24));
  //   let hours = Math.floor(-timeDiff / (1000 * 60 * 60));
  //   let minutes = Math.floor(-timeDiff / (1000 * 60));
  //   let seconds = Math.floor(-timeDiff / (1000));

  //   hours = Math.floor((hours / 24 - Math.floor(hours / 24)) * 24);
  //   minutes = Math.floor((minutes / 60 - Math.floor(minutes / 60)) * 60);
  //   seconds = Math.floor((seconds / 60 - Math.floor(seconds / 60)) * 60);

  //   return days + ' Tage ' + hours + " Stunden " + minutes + " Minuten " + seconds + " Sekunden";
  // }
}
