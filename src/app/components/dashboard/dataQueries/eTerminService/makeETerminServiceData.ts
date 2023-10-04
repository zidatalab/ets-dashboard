import { Injectable } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { DBService } from "src/app/services/db.service";
import { AggregationService } from 'src/app/services/aggregation.service';

@Injectable({
  providedIn: 'root'
})

export class MakeETerminData {
  constructor(
    private api: ApiService,
    private db: DBService,
    private aggregation: AggregationService,
  ) { }

  levelSettings: any = []

  async init(input: any, levelSettings: any) {
    this.levelSettings = levelSettings

    const result = await this.getETerminData(input)

    return result
  }

  async getETerminData(input: any) {
    /**
     * for data structurization and aggregation see Teams Convo 
     */
    if (input === 'stats_angebot') {
      return await this.createStats(this.levelSettings)
    }

    return
  }

  async createStats(levelSettings: any) {
    let appointmentOffer = []
    let summaryInfo: any = []

    let appointments: any = await this.db.listData(
      'stats_angebot',
      'KV',
      levelSettings['levelValues'],
      levelSettings['start'],
      levelSettings['stop'],
      true,
      levelSettings["resolution"]
    )

    if (appointments) {
      let dataAvailable = 0
      let dataBooked = 0

      for (const item of appointments) {
        if (item.status === "available") {
          appointmentOffer.push({ total: item['Anzahl'], date: item['reference_date'] })
          dataAvailable += item.Anzahl
        }

        if (item.status === 'booked') {
          dataBooked += item.Anzahl
        }
      }

      summaryInfo['Anzahl Angebot'] = dataAvailable
      summaryInfo['Anzahl Verteilt'] = dataBooked

      appointments.appointmentOffer = this.flattenArray(appointmentOffer)
    }

    return {
      summaryInfo: summaryInfo,
      appointmentOfferTotal: appointments.appointmentOffer
    }
  }

  private flattenArray(array: { total: any; date: any; }[]) {
    const aggregatedData: any = {};

    array.forEach(entry => {
      if (aggregatedData.hasOwnProperty(entry.date)) {
        aggregatedData[entry.date] += entry.total;
      } else {
        aggregatedData[entry.date] = entry.total;
      }
    });

    const resultArray = Object.keys(aggregatedData).map(date => ({
      total: aggregatedData[date],
      date: date
    }));

    return resultArray;
  }
}
