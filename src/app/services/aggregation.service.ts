import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DBService } from 'src/app/services/db.service';
import { DataItem } from 'src/app/services/serviceModels/db';
import { query } from '@angular/animations';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AggregationService {

  constructor(
    private db: DBService,
    private api: ApiService
  ) { }

  async newCombine(array: any, fieldname: any) {
    const dbArray = []

    if (array.length === 0) {
      return []
    }

    for (let item of array) {
      if (!item[fieldname]) {
        return dbArray
      }

      for (let fieldItem of item[fieldname]) {
        let toPush : any = new DataItem
        toPush['level'] = item['level'];
        toPush['levelId'] = item['levelid'];
        toPush['year'] = item['Jahr'];
        toPush['month'] = item['Monat'];
        toPush['calenderWeek'] = fieldItem['KW'] ? fieldItem['KW'] : '';
        // ATTENTION
        if(fieldname === 'stats_angebot') toPush['date'] = fieldItem['angebot_reference_date']
        if(fieldname === 'stats_nachfrage') toPush['date'] = fieldItem['nachfrage_reference_date']
        delete fieldItem['KW'];
        toPush['data'] = fieldItem;
        toPush['indicator'] = fieldname;
        toPush['timeframe'] = item['timeframe'];
        toPush['fg'] = item['fg']

        dbArray.push(toPush)
      }
    }

    await this.db.addDateBulk(dbArray)

    return
  }

  queryTS(groupVariables = [], outcome = '', levelSettings: any, topX: any = false, sort = false, filterVariables = '', filterValues = [], topXVariable = '') {
    let toFilter = false

    if (levelSettings['zeitraum'] !== 'Gesamt') {
      const query = {
        'startdate': levelSettings['start'].toISOString().slice(0, 10),
        'stopdate': levelSettings['end'].toISOString().slice(0, 10),
        'subgroups': groupVariables,
        'filterlist': [{}],
        'outcome': ''
      }

      query['filterlist'].push({ 'level': 'KV' })

      if (levelSettings['levelvalues'] !== 'Gesamt') {
        query['filterlist'].push({ 'levelid': levelSettings['levelvalues'] })
      }

      if (outcome !== '') {
        query['outcome'] = outcome
      }

      if (filterVariables !== '' && filterValues.length > 0) {
        toFilter = true
      }

      return this.api.postTypeRequest('analytics/timeseries', query).subscribe(
        (data: any) => {
          let result = data['result']

          if (sort) {
            result = this.api.sortArray(result, 'count', 'descending')
          }

          if (topX && topXVariable !== '') {
            result = result.slice(0, topX)
          }

          if (toFilter) {
            result = this.api.filterArrayByList(result, filterVariables, filterValues)
          }

          if (topX && topXVariable !== '') {
            let keyCounts = [null]

            for (let item of result) {
              if (keyCounts[item[topXVariable]] && Math.round(item['count'])) {
                keyCounts[item[topXVariable]] = keyCounts[item[topXVariable]] + item['count'];
              }

              if (!keyCounts[item[topXVariable]] && Math.round(item['count'])) {
                keyCounts[item[topXVariable]] = item['count'];
              }
            }

            const keyCountsArray = [{}]

            for (let key of Object.keys(keyCounts)) {
              // keyCountsArray.push({ 'name': key, 'count': keyCounts[key] })
            }

            let filterList = this.api.getValues(this.api.sortArray(keyCountsArray, 'count', 'descending').slice(0, topX), "name")

            result = this.api.filterArrayByList(result, topXVariable, filterList)
          }

          return result
        },
        error => { return [] }
      )
    }

    return []
  }

  addDate(array: any, year: any, isoWeek: any) {
    for (let item of array) {
      item['Datum'] = this.getDateIsoWeek(item[isoWeek], item[year])
    }

    return array
  }

  addDateMonth(array: any, year: any, month: any) {
    for (let item of array) {
      item['Datum'] = new Date(`${item[year]}-${item[month]}-01`)
    }

    return array
  }

  getDateIsoWeek(week: any, year: any) {
    const millisecendsPerDay = 1000 * 60 * 60 * 24
    let yearStart = new Date(`${year}-01-01`)

    yearStart = new Date(yearStart.getTime() - (yearStart.getDay() - 1) * millisecendsPerDay)

    const result = new Date(yearStart.getTime() + millisecendsPerDay * 7 * (week + 1))

    return result
  }

  aggregateSymptoms(symptoms: any) {
    const inputArray = []
    let output: any = {}
    const result = []

    for (let item of symptoms) {
      inputArray.push(item['Symptome'])
    }

    for (let item of inputArray) {
      if (output[item.name] !== undefined) {
        output[item.name] = output[item.name] + item['n']
      } else {
        output[item.name] = item['']
      }
    }

    output['Keine Angabe'] = output['']

    delete output['']

    for (let key in Object.keys(output)) {
      result.push({ "name": Object.keys(output)[key], "n": Object.values(output)[key] })
    }

    return this.api.sortArray(result, 'n', 'descending')
  }

  updateStartStop(levelSettings: any) {
    console.log('updateStartStop',levelSettings);
    let tzOffset = (new Date()).getTimezoneOffset() * 60000;
    let today = new Date();
    let startDate = today.getFullYear() + "-01-01";;
    let endDate = today.getFullYear() + "-12-31";
    let millisecendsPerDay = 1000 * 60 * 60 * 24;

    if (levelSettings["resolution"] == "monthly") {
      startDate = "2021-01-01";
      endDate = today.toISOString().slice(0, 10)
    };

    
    if (levelSettings["resolution"] == "weekly") {
      let newstartDate = new Date();
      newstartDate.setDate(today.getDate() - 12 * 7);
      startDate = newstartDate.toISOString().slice(0, 10);
      endDate = today.toISOString().slice(0, 10)
    };

    if (levelSettings["resolution"] == "daily") {
      let newstartDate = new Date();
      newstartDate.setDate(today.getDate() - 30);
      startDate = newstartDate.toISOString().slice(0, 10);
      endDate = today.toISOString().slice(0, 10)
    };

    if (levelSettings["zeitraum"] == "Aktuelles Jahr") {
      startDate = new Date(today.getFullYear() + "-01-01").toISOString().slice(0, 10);
      endDate = new Date(today.getFullYear() + "-12-31").toISOString().slice(0, 10)
    };

    if (levelSettings["zeitraum"] == "Letztes Jahr") {
      startDate = new Date(today.getFullYear() - 1 + "-01-01").toISOString().slice(0, 10);
      endDate = new Date(today.getFullYear() - 1 + "-12-31").toISOString().slice(0, 10);
    };


    if (levelSettings["zeitraum"] == "Letzte 4 Wochen") {
      endDate = new Date(today.getTime() - today.getDay() * millisecendsPerDay).toISOString().slice(0, 10);
      startDate = new Date(today.getTime() - ((4 * 7) - 1) * millisecendsPerDay).toISOString().slice(0, 10);
    };

    if (levelSettings["zeitraum"] == "Letzte Woche") {
      endDate = new Date(today.getTime() - today.getDay() * millisecendsPerDay).toISOString().slice(0, 10);
      startDate = new Date(today.getTime() - ((6)) * millisecendsPerDay).toISOString().slice(0, 10);
    };

    if (levelSettings["zeitraum"] == "Detailliert") {
      let newstart = (new Date(levelSettings['start_picker'] - tzOffset)).toISOString().slice(0, 10);
      let newstop = (new Date(levelSettings['stop_picker'] - tzOffset)).toISOString().slice(0, 10);
      //console.log("Detailliert",levelSettings['start_picker'],newstart,levelSettings['stop_picker'],newstop);
      levelSettings["start"] = newstart;
      levelSettings["stop"] = newstop;
    }

    if (levelSettings["zeitraum"] != "Detailliert") {
      levelSettings["start"] = startDate;
      levelSettings["stop"] = endDate;
    }

    return levelSettings;
  }
}
