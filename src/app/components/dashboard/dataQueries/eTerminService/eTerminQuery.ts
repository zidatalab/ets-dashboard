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
    let startYear = new Date(levelSettings['start']).getFullYear();
    let startMonth = new Date(levelSettings['start']).getMonth()+1;
    let stopYear = new Date(levelSettings['stop']).getFullYear();
    let stopMonth = new Date(levelSettings['stop']).getMonth()+1;
    let query: any = {
      'client_id': 'ets_reporting',
      'groupinfo': {
        'level': 'KV',
        "fg": levelSettings['fg'],
        'levelid': levelSettings['levelValues'],
        'timeframe': levelSettings['resolution'],
        /* 'Jahr': {
          '$gte': parseInt(levelSettings['start'].slice(0, 4)),
          '$lte': parseInt(levelSettings['stop'].slice(0, 4))
        } */
        '$or': [        
        ]
        },
      "showfields": ["stats_angebot", "stats_nachfrage"]
    }

    if (startYear==stopYear){
      query.groupinfo['$or'] = [
        {'$and': [{ 'Jahr': { '$eq': startYear }, 'Monat': { '$gte': startMonth } },
                  { 'Jahr': { '$eq': stopYear }, 'Monat': { '$lte': stopMonth } }
                ]}
        ]
      }
    if ((startYear+1)==stopYear){
        query.groupinfo['$or'] = [
          {'$and': [
            { 'Jahr': { '$eq': startYear }, 'Monat': { '$gte': startMonth } },           
          ]},          
          {'$and': [{ 'Jahr': { '$eq': stopYear }, 'Monat': { '$lte': stopMonth } }]}
          ]
        }
    if ((startYear+1)<stopYear){
        query.groupinfo['$or'] = [
          {'$and': [
            { 'Jahr': { '$eq': startYear }, 'Monat': { '$gte': startMonth } },           
          ]},
          {'$and': [{ 'Jahr': { '$gt': startYear,'$lt': stopYear } }]},
          {'$and': [{ 'Jahr': { '$eq': stopYear }, 'Monat': { '$lte': stopMonth } }]}
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
      let { data: result }: any = await this.api.postTypeRequestWithoutObs('get_data/', query);

      if (!input.length && result.length) {
        result = result.map((entry: any) => ({
          ...entry,
        }))        
      }

      // Check for last timestamp of aggregation
      if (result.length){
      console.log("A RESULT!")
      let date_of_aggregation=""
      let date_of_aggregation_stored = localStorage.getItem('date_of_aggregation')
      if (!date_of_aggregation_stored){
      localStorage.setItem('date_of_aggregation',result[0].date_of_aggregation)
      }

      for (let item of result){          
        if (date_of_aggregation<item.date_of_aggregation){
          date_of_aggregation = item.date_of_aggregation
        }
      }
      if (date_of_aggregation > date_of_aggregation_stored!) {
        localStorage.setItem('date_of_aggregation',date_of_aggregation)
      }
      }
      // END ADD date_of_aggregation
      for (let item of fields) {
        this.db.deleteWhere(item, 'KV', levelSettings['levelValues'], levelSettings['resolution'], levelSettings['start'], levelSettings['stop'])
        _result[item] = await this.updateDB(result, item, levelSettings)
        this.db.store(item, 'KV', levelSettings['levelValues'], now.toISOString(), levelSettings['start'], levelSettings['stop'], levelSettings['resolution'])
      }

      return _result
    }
  }
}