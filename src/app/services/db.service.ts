import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { db, StandItem } from './serviceModels/db';
import { IndexableTypePart } from 'dexie';

@Injectable({
  providedIn: 'root'
})

export class DBService {

  constructor(private api: ApiService) { }

  async store(indicator: any, level: any, levelId: any, stand: any, minDate: any, maxDate: any, resolution: any) {
    await db.standDB
      .where('[level+levelId+indicator+timeframe]')
      .equals([level, levelId, indicator, resolution])
      .delete()

    db.standDB.put({
      'level': level,
      'levelId': levelId,
      'stand': stand,
      'indicator': indicator,
      'startDate': minDate,
      'stopDate': maxDate,
      'timeframe': resolution,
    })
  }

  getStand(indicator: any, level: any, levelId: any, resolution: any) {
    return db.standDB
      .where('[level+levelId+indicator+timeframe]')
      .equals([level, levelId, indicator, resolution]).first()
  }

  async listData(indicator: any, level: any, levelId: any, start = '', stop = '', expand = true, resolution: any) {
    if (start !== '' && stop !== '' && expand) {
      let data: any = []

      data = await db.dataDB
        .where('[level+levelId+indicator+timeframe+date]')
        .between([level, levelId, indicator, resolution, start], [level, levelId, indicator, resolution, stop])
        .toArray()

      return this.api.objectKeysToColumns(data, 'data')
    }

    if (expand === true) {
      const data = await db.dataDB
        .where('[level+levelId+indicator+timeframe]').equals([level, levelId, indicator, resolution]).toArray()
      return this.api.objectKeysToColumns(data, 'data')
    }

    if (expand === false) {
      return db.dataDB
        .where('[level+levelId+indicator+timeframe]').equals([level, levelId, indicator, resolution]).toArray();
    };

    // subject of change for error handling
    return null
  }

  async queryDataDates(level: any, levelId: any, indicator: any, resolution = 'weekly') {
    const result = await db.standDB
      .where('[level+levelId+indicator+timeframe]')
      .equals([level, levelId, indicator, resolution])
      .toArray()

    return result
  }

  deleteWhere(indicator: any, level: any, levelId: any, resolution = 'weekly', start = '', stop = '') {
    const search = {
      indicator: indicator,
      level: level,
      levelId: levelId,
      timeframe: resolution
    }

    if (!start && !stop) {
      return db.dataDB
        .where('[level+levelId+indicator+timeframe+date]')
        .between([level, levelId, indicator, resolution, start], [level, levelId, indicator, resolution, stop])
        .delete()
    }

    return db.dataDB
      .where('[level+levelId+indicator+timeframe]')
      .equals([level, levelId, indicator, resolution])
      .delete()
  }

  addDateBulk(array: any) {
    return db.dataDB.bulkPut(array)
  }

  async addData(level: any, levelId: any, year: any, month: any, calenderWeek: any, date: any, indicator: any, data: any, resolution: any) {
    return await db.dataDB
      .put({
        indicator: indicator,
        level: level,
        levelId: levelId,
        year: year,
        month: month,
        calenderWeek: calenderWeek,
        date: date,
        data: data,
        timeframe: resolution,
      })
  }

  clean() {
    db.delete()
    db.open()
  }
}