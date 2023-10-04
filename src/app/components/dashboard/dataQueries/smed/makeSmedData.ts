import { Injectable } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { DBService } from "src/app/services/db.service";
import { AggregationService } from 'src/app/services/aggregation.service';

@Injectable({
  providedIn: 'root'
})

export class MakeSmedData {
  constructor(
    private api: ApiService,
    private db: DBService,
    private aggregation: AggregationService,
  ) { }

  levelSettings: any = []

  async init(input: any, levelSettings: any) {
    this.levelSettings = levelSettings
    // let result : any = []
    const result = await this.getSmedData(input)

    return result
  }

  async getSmedData(input: any = '') {
    if (input === "stats") {
      return await this.createStats(this.levelSettings)
    }

    if (input === "mainsymptoms_ts") {
      return await this.createMainsymptoms_ts(this.levelSettings)
    };

    if (input == "timestats") {
      const timestats = await this.createTimeStats(this.levelSettings);

      // this.utilTimes = this.api.makeheatmapdata(utiltimes, "wt", "h", 'Anteil', 'Wochentag', 'TimeLabel');
      return { timestats: timestats }
    };

    if (input == "timetotreat") {
      return await this.createTimeToTreat(this.levelSettings)
    }

    if (input == "decisions") {
      return await this.createDecisions(this.levelSettings)
    }

    if (input === "qmCases") {
      return await this.createQMCases(this.levelSettings)
    }

    return
  }

  private async createQMCases(levelSettings: any) {
    let standardSort = [
      {
        text: "Vortriage",
        data: 0,
      },
      {
        text: 'nur Notfall ausgeschlossen',
        data: 0,
      },
      {
        text: 'Assessment vollständig',
        data: 0,
      },
      {
        text: 'Assessement abgekürzt',
        data: 0,
      },
      {
        text: 'SmED nicht anwendbar',
        data: 0,
      },
    ];

    let qmCases: any = []
    const data: any = await this.db.listData('stats', "KV", levelSettings['levelValues'], levelSettings['start'], levelSettings['stop'], true, levelSettings["resolution"]);
    let total = 0;

    if (data.length > 0) {
      for (const item of data) {
        if (item["QMFaelle"]) {
          total += item["QMFaelle"];
          for (const _item of standardSort) {
            if (_item.text === "Vortriage") {
              if (_item.data === 0) {
                _item.data = (this.api.sumArray(this.api.getValues(data, "QM_Kat_Vortriage")));
              }
            }
            if (_item.text === "nur Notfall ausgeschlossen") {
              if (_item.data === 0) {
                _item.data = (this.api.sumArray(this.api.getValues(data, "QM_Kat_nur_Notfall_ausgeschlossen")));
              }
            }
            if (_item.text === "Assessment vollständig") {
              if (_item.data === 0) {
                _item.data = (this.api.sumArray(this.api.getValues(data, "QM_Kat_Assessment_vollst")));
              }
            }
            if (_item.text === "Assessement abgekürzt") {
              if (_item.data === 0) {
                _item.data = (this.api.sumArray(this.api.getValues(data, "QM_Kat_Assessment_abgekuerzt")));
              }
            }
            if (_item.text === "SmED nicht anwendbar") {
              if (_item.data === 0) {
                _item.data = (this.api.sumArray(this.api.getValues(data, "QM_Kat_SmED_nicht_anwendbar")));
              }
            }
          }
        }
      }
    }

    if (standardSort) {
      for (const item of standardSort) {
        item.data = inPercent(item.data, total);
      }
    }

    qmCases = standardSort.reverse();

    return qmCases

    function inPercent(x: any, y: any) {
      const result = Math.round(1000 * x / y) / 10;

      return result;
    }
  }

  private async createDecisions(levelSettings: any) {
    let decisions: any = [];
    decisions = await this.db.listData('decisions', "KV", levelSettings['levelValues'], levelSettings['start'], levelSettings['stop'], true, levelSettings["resolution"]);
    let total = this.api.sumArray(this.api.getValues(decisions, 'Anzahl'));
    const decisionsTtt = this.api.replaceMissing(this.api.groupBySum(decisions, 'TTTsmed_text', "TTTdispo_text", 'Anzahl'), 'TTTdispo_text', "Keine Daten");
    const decisionsPoc = this.api.replaceMissing(this.api.groupBySum(decisions, 'POCsmed_text', "POCdispo_text", 'Anzahl'), 'POCdispo_text', "Keine Daten");;
    const decisionsPocvsttt = this.api.groupBySum(decisions, 'TTTsmed_text', "POCsmed_text", 'Anzahl');

    return {
      total: total,
      decisionsTtt: decisionsTtt,
      decisionsPoc: decisionsPoc,
      decisionsPocvsttt: decisionsPocvsttt
    }
  }

  private async createTimeToTreat(levelSettings: any) {
    let result: any = [];
    let standardSort = [
      {
        TTTsmed_text: undefined,
        Anzahl: 0,
        Anteil: 0
      },
      {
        TTTsmed_text: 'Notfall',
        Anzahl: 0,
        Anteil: 0
      },
      {
        TTTsmed_text: 'schnellstmögliche ärztliche Behandlung',
        Anzahl: 0,
        Anteil: 0
      },
      {
        TTTsmed_text: 'Ärztliche Behandlung innerhalb von 24h',
        Anzahl: 0,
        Anteil: 0
      },
      {
        TTTsmed_text: 'Ärztliche Behandlung nicht innerhalb von 24h erforderlich',
        Anzahl: 0,
        Anteil: 0
      },
      {
        TTTsmed_text: 'k.A./Befragung unklar',
        Anzahl: 0,
        Anteil: 0
      }
    ];
    let timeToTreat: any = []

    result = await this.db.listData('timetotreat', "KV", levelSettings['levelValues'], levelSettings['start'], levelSettings['stop'], true, levelSettings["resolution"]);
    result = this.api.groupBySum(result, 'TTTsmed_text', '', 'Anzahl');
    const total = this.api.sumArray(this.api.getValues(result, 'Anzahl'));

    for (let item of result) {
      item['Anteil'] = Math.round(1000 * item['Anzahl'] / total) / 10;
    }


    if (result[0].TTTsmed_text !== undefined) {
      result.push({ TTTsmed_text: undefined, Anzahl: 0, Anteil: 0 });
    }

    timeToTreat = createStandardSort(result);

    return timeToTreat

    function createStandardSort(data: any) {
      const result = [];

      for (const item of standardSort) {
        for (const _item of data) {
          if (item.TTTsmed_text === _item.TTTsmed_text) {
            item.Anteil = _item.Anteil;
            item.Anzahl = _item.Anzahl;
          }
        }
        result.push(item);
      }

      return result.reverse();
    }
  }

  private async createTimeStats(levelSettings: any) {
    let utilTimes: any = [];
    let dbUtilTimes = await this.db.listData('timestats', "KV", levelSettings['levelValues'], levelSettings['start'], levelSettings['stop'], false, levelSettings["resolution"]);
    dbUtilTimes = this.api.getValues(dbUtilTimes, 'data');
    utilTimes = this.api.groupBySum(dbUtilTimes, "wt", "h", "n");
    let nTotal = this.api.sumArray(this.api.getValues(utilTimes, 'n'));
    dbUtilTimes = [];

    let result: any = []

    for (let item of utilTimes) {
      item["Wochentag"] = this.api.getWeekDayName(item["wt"]);
      item['Anzahl'] = item['n'];
      item['Anteil'] = 0.1 * Math.round(1000 * item['n'] / nTotal);
      item['TimeLabel'] = item['h'] + "-" + (item['h'] + 2) + 'h';

      delete item['n'];
    }

    // heatmap deactivated
    // result = this.api.makeheatmapdata(utiltimes, "wt", "h", 'Anteil', 'Wochentag', 'TimeLabel')

    return result
  }

  private async createMainsymptoms_ts(levelSettings: any) {
    let symptomsList: any = [];
    let symptomsListExport: any = []

    symptomsList = await this.db.listData('mainsymptoms_ts', "KV", levelSettings['levelValues'], levelSettings['start'], levelSettings['stop'], true, levelSettings["resolution"]);
    symptomsList = this.api.getValues(symptomsList, 'data');

    symptomsListExport = this.api.sortArray(this.api.groupBySum(symptomsList, 'Sympt', '', 'n'), 'n', "descending");

    for (let item of symptomsListExport) {
      let anzahl_symptome = this.api.sumArray(this.api.getValues(symptomsListExport, "n"));
      item["Anteil"] = Math.round(1000 * item['n'] / anzahl_symptome) / 10;
    }

    symptomsList = symptomsListExport.slice(0, 15);

    return symptomsList
  }

  private async createStats(levelSettings: any) {
    let statsTs = [];
    let summaryInfo: any = [];
    let statSWDate: any = await this.db.listData(
      'stats',
      "KV",
      levelSettings['levelValues'],
      levelSettings['start'],
      levelSettings['stop'],
      true,
      levelSettings["resolution"]);

    if (statSWDate.length > 0) {

      for (let item of statSWDate) {
        item["Mittlere Dauer (Sek.)"] = (item["DAUERsmed"] / item["DAUERsmedFaelle"]);

        if (item["Dauer_sek"] === 0) {
          item["Mittlere Dauer (Sek.)"] = null;
        }

        item["Mittlere Anzahl Beschwerden"] = item["Anzahl_Beschwerden"] / item["Assessments"];
        item["Mittlere Anzahl Fragen"] = item["Anzahl_Fragen"] / item["Assessments"];

        if (item["Anzahl_Beschwerden"] === 0) {
          item["Mittlere Anzahl Beschwerden"] = null;
        }

        item["Assessments pro 100 Tsd. Einw."] = item["Assessments"] / (item["BEVSTAND"] / 1e5);
        item["Anteil ARE Assessments"] = (100 * ((item["Assessments_mit_ARE_v3"] / item["Assessments"]) / .25)) - 100;

        item['totaleNumbers'] = item['Assessments'];
      };

      statsTs = statSWDate;
      let levelId = statsTs[0]['levelid'];

      if (levelId != "Gesamt") {
        summaryInfo["levelid"] = " in ".concat(levelId);
      } else {
        summaryInfo["levelid"] = " in Deutschland";
      };

      summaryInfo["Assessments Gesamt"] = this.api.sumArray(this.api.getValues(statsTs, "Assessments"));
      summaryInfo["Assessments pro Woche"] = summaryInfo["Assessments Gesamt"] / this.api.getValues(statsTs, "Assessments").length;
      summaryInfo["Mittlere Dauer"] = this.api.sumArray(this.api.getValues(statsTs, "DAUERsmed")) / this.api.sumArray(this.api.getValues(statsTs, "DAUERsmedFaelle"));
      summaryInfo["Anzahl Beschwerden"] = this.api.sumArray(this.api.getValues(statsTs, "Anzahl_Beschwerden")) / summaryInfo["Assessments Gesamt"];
      summaryInfo["Anzahl Fragen"] = this.api.sumArray(this.api.getValues(statsTs, "Anzahl_Fragen")) / summaryInfo["Assessments Gesamt"];
      let sorteddates = this.api.getValues(statsTs, "Datum").sort();
      summaryInfo["Beginn"] = new Date(sorteddates[0]);
      summaryInfo["Ende"] = new Date(sorteddates.pop());
      summaryInfo["done"] = true;

      return {
        summaryInfo: summaryInfo,
        statsTs: statsTs
      }
    }

    return []
  }
}