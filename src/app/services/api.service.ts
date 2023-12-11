import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { retry, timeout } from 'rxjs/operators';
import * as chroma from "chroma-js";
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  public apiServer = 'https://api.zidatasciencelab.de/'
  public clientApiId = 'ets_reporting'//'smed_reporting'////////////// 

  public primarycolor = "#2196f3"; // "#e91e63";
  public accentcolor = "#e3714e1";
  public warncolor = "#e1149b";

  constructor(private httpClient: HttpClient) { }

  // requester
  public getTypeRequest(url: any) {
    return this.httpClient.get(`${this.apiServer}${url}`).pipe(map(result => {
      return result
    })).pipe(retry(3))
  }

  public postTypeRequest(url: any, payload: any) {
    return this.httpClient.post(`${this.apiServer}${url}`, payload).pipe(map(result => {
      return result
    }))
  }

  public postTypeRequestRetry(url: any, payload: any) {
    return this.httpClient.post(`${this.apiServer}${url}`, payload).pipe(map(result => {
      return result
    })).pipe(retry(3))
  }

  public postTypeRequestWithoutObs(url: any, payload: any) {
    return firstValueFrom(this.httpClient.post(`${this.apiServer}${url}`, payload).pipe((retry(3))))
  }

  // user functions
  public updateUser(user: any, setting: any, value: any, usergroups = "") {
    interface Payload { email: any, key: any, value: any, usergroups?: any }

    const payload: Payload = {
      email: user,
      key: setting,
      value: value
    }

    if (usergroups !== '') {
      payload.usergroups = usergroups
    }

    return this.postTypeRequest('userstatus/', payload)
  }

  public deleteUser(user: any, password = "") {
    const payload = { 'email': user, password: password }

    return this.postTypeRequest('deleteuser', payload)
  }

  public changePassword(user: any, newPassword: any, oldPassword = '') {
    const payload = { 'email': user, 'newpassword': newPassword, oldPassword: oldPassword }

    return this.postTypeRequest('changepwd', payload)
  }

  // local helper functions

  public objectKeysToColumns(array: any, objectName: string | number) {
    for (let item of array) {
      let object = item[objectName]

      for (let key of Object.keys(object)) {
        item[key] = object[key]
      }

      object[objectName] = NaN

      delete object[objectName]
    }


    return array
  }

  // data functions / aggregation, manipulation
  public getValues(array: any, key: string | number) {
    const values = []

    for (let item of array) {
      values.push(item[key])
    }

    return values
  }

  public getKeys(array: {}[]) {
    return Object.keys(array[0])
  }

  public getOptions(array: any[], key: string | number) {
    return array.map((item: { [x: string]: any; }) => item[key]).filter((value: any, index: any, self: string | any[]) => self.indexOf(value) === index)
  }

  public filterArray(array: any, key: string | number, value: any) {
    const result: any[] = []

    if (!Array.isArray(array)) {
      return result
    }

    let i = 0
    for (let item of array) {
      if (item[key] === value) {
        result.push(item)
      }
      i += 1
    }

    return result
  }

  public filterNAArray(array: any, key: string | number) {
    const result = []

    let i = 0
    for (let item of array) {
      if (item[key] && (item[key] !== null) && (!isNaN(item[key]))) {
        result.push(item)
      }
      i += 1
    }

    return result
  }

  public filterNA(array: any) {
    const result = []

    for (let item of array) {
      if (!isNaN(item)) {
        result.push(item)
      }
    }

    return result
  }

  public filterArrayByList(array: any, key: string | number, list: string | any[]) {
    const result = []

    let i = 0
    for (let item of array) {
      if (list.indexOf(item[key]) >= 0) {
        result.push(item)
      }

      i += 1
    }

    return result
  }

  public async getMetaData(name: string) {
    const metaName: any = localStorage.getItem(name)

    return JSON.parse(metaName)
  }

  public sortArray(array: any, key: string | number, order = 'ascending') {
    const result = array

    if (order !== 'ascending') {
      return result.sort((a: { [x: string]: number; }, b: { [x: string]: number; }) => (a[key] > b[key] ? -1 : 1))
    }

    result.sort((a: { [x: string]: number; }, b: { [x: string]: number; }) => (a[key] < b[key] ? -1 : 1))

    return result
  }

  public sumArray(array: any) {
    let total = 0

    for (let item of array) {
      if (parseFloat(item)) {
        total += item
      }
    }

    return total
  }

  public getUniqueValues(array: any, key: string | number) {
    let items = this.getValues(array, key)

    return [...new Set(items)]
  }

  public groupBySum(array: any, key1: string | number, key2 = '', outcome: string | number) {
    const result = []
    const valuesKey1 = this.getUniqueValues(array, key1)
    let valuesKey2 = []

    if (key2 === "") {
      valuesKey2 = this.getUniqueValues(array, key2)
    }

    for (let item of valuesKey1) {
      const keyValues = this.filterArray(array, key1, item)


      if (key2 === '') {
        let toPush: any = {}

        toPush[key1] = item
        toPush.outcome = this.sumArray(this.getValues(keyValues, outcome))
        result.push(toPush)
      }

      if (key2 !== '') {
        for (let _item of valuesKey2) {
          let toPush: any = {}

          toPush[key1] = item
          toPush[key1] = _item
          toPush[outcome] = this.sumArray(this.getValues(this.filterArray(keyValues, key2, _item), outcome))
          result.push(toPush)
        }
      }
    }

    return result
  }

  public getWeekDayName(day: number, mongo = false) {
    const days = mongo ? ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"] : ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

    return days[day - 1]
  }

  public splitArrayByKey(array: any, key: string | number) {
    const result = []
    let splitValues = this.getUniqueValues(array, key)

    for (let item of splitValues) {
      result.push(this.filterArray(array, key, item))
    }

    return result
  }

  public makeScale(bins = 5) {
    return chroma.scale([chroma(this.primarycolor).set('hsl.h', +70), this.primarycolor]).colors(bins);
  }

  public stringWrap(string: string, maxLength = 30) {
    let result = ''
    const wordArray = string.split(" ")
    let lineLength = 0

    for (let item of wordArray) {
      const wordLength = item.length

      if ((lineLength + wordLength) < maxLength) {
        result = `${result} ${item}`
        lineLength = lineLength + wordLength

        return result
      }

      result = `${result} <br> ${item}`
      lineLength = wordLength
    }

    return result
  }

  //remember heatmap data

  public replaceMissing(array: any, key: string | number, replacement = 'Fehlend') {
    for (let item of array) {
      if (!item[key]) {
        item[key] = replacement
      }
    }

    return array
  }

  public arrayIntersect(a: any, b: any) {
    const setA = new Set(a)
    const setB = new Set(b)

    const intersection = new Set([...setA].filter(x => setB.has(x)))

    return Array.from(intersection)
  }
}