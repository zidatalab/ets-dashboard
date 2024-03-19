import { Injectable } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { DBService } from "src/app/services/db.service";
import { MakeETerminData } from "./makeETerminServiceData";
import { AggregationService } from 'src/app/services/aggregation.service';
import { AuthService } from "src/app/services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class ETerminQuery {
  constructor(
    private api: ApiService,
    private db: DBService,
    private makeData: MakeETerminData,
    private aggregation: AggregationService,
    private auth: AuthService
  ) { }

  async updateDB(data: any, input: any, levelSettings: any) {
    await this.aggregation.newCombine(data, input)
    const result = await this.makeData.init(input, levelSettings)

    return result
  }

  async getQueryData(input: any = '', levelSettings: any, allPublicFields: any) {
    let startYear = new Date(levelSettings['start']).getFullYear();
    let startMonth = new Date(levelSettings['start']).getMonth() + 1;
    let stopYear = new Date(levelSettings['stop']).getFullYear();
    let stopMonth = new Date(levelSettings['stop']).getMonth() + 1;

    console.log(startYear, startMonth, stopYear, stopMonth)
    
    let query: any = {
      'client_id': 'ets_reporting',
      'groupinfo': {
        'level': 'KV',
        "fg": levelSettings['fg'],
        'levelid': levelSettings['levelValues'],
        'timeframe': levelSettings['resolution'],
        '$or': [
        ]
      },
      "showfields": ["stats_angebot", "stats_nachfrage"]
    }

    if (startYear == stopYear) {
      query.groupinfo['$or'] = [
        {
          '$and': [{ 'Jahr': { '$eq': startYear }, 'Monat': { '$gte': startMonth } },
          { 'Jahr': { '$eq': stopYear }, 'Monat': { '$lte': stopMonth } }
          ]
        }
      ]
    }

    if ((startYear + 1) == stopYear) {
      query.groupinfo['$or'] = [
        {
          '$and': [
            { 'Jahr': { '$eq': startYear }, 'Monat': { '$gte': startMonth } },
          ]
        },
        { '$and': [{ 'Jahr': { '$eq': stopYear }, 'Monat': { '$lte': stopMonth } }] }
      ]
    }

    if ((startYear + 1) < stopYear) {
      query.groupinfo['$or'] = [
        {
          '$and': [
            { 'Jahr': { '$eq': startYear }, 'Monat': { '$gte': startMonth } },
          ]
        },
        { '$and': [{ 'Jahr': { '$gt': startYear, '$lt': stopYear } }] },
        { '$and': [{ 'Jahr': { '$eq': stopYear }, 'Monat': { '$lte': stopMonth } }] }
      ]
    }

    let _result: any = []
    let dbDataRange
    let now: Date = new Date();
    let oldStand: Date = new Date();
    let dataAge: any = 0;

    const fields = input.length ? [input] : allPublicFields
    const { levelValues, resolution } = levelSettings
    const _data: any = await this.db.queryDataDates('KV', levelValues, fields[0], resolution)

    dbDataRange = { 'startdate': new Date('2000-01-01'), 'stopdate': new Date('2000-01-01') };

    if (_data.length > 0) {
      dbDataRange = Object.create(_data[0]);
      oldStand = new Date(dbDataRange['Stand'])
      dataAge = (now.getTime() - oldStand.getTime()) / (1000 * 60 * 60)
    }

    const isStartDateValid = new Date(dbDataRange['startdate']) <= new Date(levelSettings['start']);
    const isEndDateValid = new Date(dbDataRange['stopdate']) >= new Date(levelSettings['stop']);

    if (isStartDateValid && isEndDateValid && dataAge < 6) {
      for (let item of fields) {
        _result.push(await this.makeData.getETerminData(item))
      }
    } else {
      this.auth.refreshToken()
      let { data: result }: any = await this.api.postTypeRequestWithoutObs('get_data/', query);

      if(!result.length) {
        return new Error("No data available for given query")
      }

      if (!input.length && result.length) {
        result = result.map((entry: any) => ({
          ...entry,
        }))
      }

      if (result.length) {
        let aggregationDate = ""
        let aggregationDateStored = localStorage.getItem('date_of_aggregation')

        if (!aggregationDateStored) {
          localStorage.setItem('date_of_aggregation', result[0].date_of_aggregation)
        }

        for (let item of result) {
          if (aggregationDate < item.date_of_aggregation) {
            aggregationDate = item.date_of_aggregation
          }
        }

        if (aggregationDate > aggregationDateStored!) {
          localStorage.setItem('date_of_aggregation', aggregationDate)
        }
      }

      for (let item of fields) {
        this.db.deleteWhere(item, 'KV', levelSettings['levelValues'], levelSettings['resolution'], levelSettings['start'], levelSettings['stop'])
        _result[item] = await this.updateDB(result, item, levelSettings)
        this.db.store(item, 'KV', levelSettings['levelValues'], now.toISOString(), levelSettings['start'], levelSettings['stop'], levelSettings['resolution'])
      }

      return _result
    }
  }
}