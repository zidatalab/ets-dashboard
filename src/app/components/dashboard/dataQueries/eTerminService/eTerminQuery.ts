import { Injectable } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { DBService } from "src/app/services/db.service";
import { MakeETerminData } from "./makeETerminServiceData";
import { AggregationService } from 'src/app/services/aggregation.service';

@Injectable({
  providedIn: 'root'
})
export class ETerminQuery {
  constructor(
    private api: ApiService,
    private db: DBService,
    private makeData: MakeETerminData,
    private aggregation: AggregationService,
  ) { }

  async updateDB(data: any, input: any, levelSettings: any) {
    await this.aggregation.newCombine(data, input)
    const result = await this.makeData.init(input, levelSettings)

    return result
  }

  async getQueryData(input: any = '', levelSettings: any, allPublicFields: any) {
    let query: any = {
      'client_id': 'ets_reporting',
      'groupinfo': {
        'level': 'KV',
        "fg": levelSettings['fg'],
        'levelid': levelSettings['levelValues'],
        'timeframe': levelSettings['resolution'],
        'Jahr': {
          '$gte': parseInt(levelSettings['start'].slice(0, 4)),
          '$lte': parseInt(levelSettings['stop'].slice(0, 4))
        }
      },
      "showfields": ["stats_angebot"]
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
      let { data: result }: any = await this.api.postTypeRequestWithoutObs('get_data/', query);

      if (!input.length && result.length) {
        result = result.map((entry: any) => ({
          ...entry,
        }))
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