import { Injectable } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { DBService } from "src/app/services/db.service";
import { MakeSmedData } from "./makeSmedData";
import { AggregationService } from 'src/app/services/aggregation.service';

@Injectable({
  providedIn: 'root'
})
export class SmedQuery {
  constructor(
    private api: ApiService,
    private db: DBService,
    private makeData: MakeSmedData,
    private aggregation: AggregationService,
  ) { }

  async updateDB(data: any, input: any, levelSettings: any) {
    await this.aggregation.newCombine(data, input)
    const result = await this.makeData.init(input, levelSettings)

    return result
  }

  async getQueryData(input: any = '', levelSettings: any, allPublicFields: any) {
    let _result: any = []
    let dbDataRange
    let now: Date = new Date();
    let oldStand: Date = new Date();
    let dataAge: any = 0; // 0 hours old     
    // let query: any = {
    //   "client_id": this.api.clientApiId,
    //   "groupinfo": {}
    // };

    // query['groupinfo']['level'] = 'KV'
    // query['groupinfo']['levelid'] = levelSettings['levelValues']
    // query['groupinfo']['timeframe'] = levelSettings['resolution']
    // query['groupinfo']['Jahr'] = {
    //   '$gte': parseInt(levelSettings['start'].slice(0, 4)),
    //   '$lte': parseInt(levelSettings['stop'].slice(0, 4))
    // }
    /**
     * WIeso nicht direkt ins object schreiben? :D
     */
    let query: any = {
      "client_id": this.api.clientApiId,
      "groupinfo": {
        'level': 'KV',
        'levelid': levelSettings['levelValues'],
        'timeframe': levelSettings['resolution'],
        'Jahr': {
          '$gte': parseInt(levelSettings['start'].slice(0, 4)),
          '$lte': parseInt(levelSettings['stop'].slice(0, 4))
        }
      }
    };

    // if (input !== '') {
    //   query['showfields'] = [input, 'KM6Versicherte', 'BEVSTAND']
    //   const _data: any = await this.db.queryDataDates(
    //     'KV',
    //     levelSettings['levelValues'],
    //     input,
    //     levelSettings['resolution']
    //   )

    //   if (_data.length > 0) {
    //     dbDataRange = Object.create(_data[0])
    //   }

    // } else {
    //   query['showfields'] = allPublicFields.concat(['KM6Versicherte', 'BEVSTAND'])

    //   const _data = await this.db.queryDataDates(
    //     'KV',
    //     levelSettings['levelValues'],
    //     allPublicFields[0],
    //     levelSettings['resolution']
    //   )

    //   if (_data.length > 0) {
    //     dbDataRange = Object.create(_data[0])
    //   }
    // }
    /**
     * Durch die kleine Anpassung, wird der code sich gut kürzern da du kaum if else brauchst
     * Da im restlichen code alles als array behandelt wird
     * die alternative zu "input !== ''"" wäre "input.length" da if 0 als false gewertet wird und 1 oder höher als true
     */
    const fields = input.length ? [input] : allPublicFields
    query['showfields'] =  fields.concat(['KM6Versicherte', 'BEVSTAND'])
    const {levelValues, resolution} = levelSettings
    const _data: any = await this.db.queryDataDates('KV', levelValues, fields[0], resolution)

    // if (_data.length > 0) {
    //   dbDataRange = Object.create(_data[0])
    // }

    // if (!dbDataRange) {
    //   dbDataRange = { 'startdate': new Date('2000-01-01'), 'stopdate': new Date('2000-01-01') };
    // } else {
    //   oldStand = new Date(dbDataRange['Stand'])
    //   dataAge = (now.getTime() - oldStand.getTime()) / (1000 * 60 * 60)
    // }
    /**
     * Einfach umdrehen und den default wert setzen und wenn daten vorliegen überschreiben 
     * alternativ in zeile 36 direkt beim initialisieren machen
     */
    dbDataRange = { 'startdate': new Date('2000-01-01'), 'stopdate': new Date('2000-01-01') };

    if(_data.length > 0) {
      dbDataRange = Object.create(_data[0]);
      oldStand = new Date(dbDataRange['Stand'])
      dataAge = (now.getTime() - oldStand.getTime()) / (1000 * 60 * 60)
    }  

    const isStartDateValid = new Date(dbDataRange['startdate']) <= new Date(levelSettings['start']);
    const isEndDateValid = new Date(dbDataRange['stopdate']) >= new Date(levelSettings['stop']);
    /** 
     * Einzelne Variabeln für bissle lesbarkeit :D 
     */
    if (isStartDateValid && isEndDateValid && dataAge < 6) {
      // if (input.length) {
      //   _result.push(await this.makeData.getSmedData(input))
      // } else {
        for (let item of fields) {
          _result.push(await this.makeData.getSmedData(item))
        }
      // }
    } else {
      // const data: any = await this.api.postTypeRequestWithoutObs('get_data/', query);
      // let result = data['data']
      /**
       * Destrukturieren, sparen manchmal unnötige zeilen
       */
      let {data:result}: any = await this.api.postTypeRequestWithoutObs('get_data/', query);

      if (!input.length && result.length) {
        // for (let item of result) {
        //   if (!item.mainsymptoms_ts) {
        //     item.mainsymptoms_ts = []
        //   }
        // }
        /** 
         * Einfach den Array Mappen, finde ist dadurch viel transparenter da du auch die alte variable neu zuweisen musst
         */
        result = result.map((entry:any) => ({
          ...entry, 
          mainsymptoms_ts: entry.mainsymptoms_ts ? entry.mainsymptoms_ts : [] 
        }))

        // for (let item of allPublicFields) {
        //   this.db.deleteWhere(item, 'KV', levelSettings['levelValues'], levelSettings['resolution'], levelSettings['start'], levelSettings['stop'])
        //   _result.push(await this.updateDB(result, item, levelSettings))
        //   this.db.store(item, 'KV', levelSettings['levelValues'], now.toISOString(), levelSettings['start'], levelSettings['stop'], levelSettings['resolution'])
        // }
        //
        // return _result
      }

      // this.db.deleteWhere(input, 'KV', levelSettings['levelValues'], levelSettings['resolution'], levelSettings['start'], levelSettings['stop'])
      // _result.push(await this.updateDB(result, input, levelSettings))
      // this.db.store(input, 'KV', levelSettings['levelValues'], now.toISOString(), levelSettings['start'], levelSettings['stop'], levelSettings['resolution'])    
      
      /**
       * durch "fields", in zeile 134 hast du eh immer einen array entweder mit einem oder mehreren werten du brauchst somit keine if else und kannst alles gleich behandeln
       */
      for (let item of fields) {
        this.db.deleteWhere(item, 'KV', levelSettings['levelValues'], levelSettings['resolution'], levelSettings['start'], levelSettings['stop'])
        // _result.push(await this.updateDB(result, item, levelSettings))
        // const data : any = (await this.updateDB(result, item, levelSettings)) || {};
        // console.log(item, data)
        _result[item] = await this.updateDB(result, item, levelSettings)
        this.db.store(item, 'KV', levelSettings['levelValues'], now.toISOString(), levelSettings['start'], levelSettings['stop'], levelSettings['resolution'])
      }
    }

    return _result
  }
}
