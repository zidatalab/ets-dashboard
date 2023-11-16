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
  professionGroups = ["Psychotherapeuten", "Fachinternisten", "Nervenärzte", "Hautärzte", "Augenärzte", "Orthopäden", "Kinderärzte", "Frauenärzte", "Hausarzt", "Chirurgen", "Urologen", "HNO-Ärzte", "Weitere Arztgruppen", "Transfusionsmediziner", "Sonderleistungen"]

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
    let appointmentBooked = []
    let appointmentUnarranged = []
    let summaryInfo: any = []
    let appointmentByProfessionGroups = []

    /**
     * data aggregation condionally depending on theme selection
     */

    let appointments: any = await this.db.listData(
      'stats_angebot',
      'KV',
      levelSettings['levelValues'],
      levelSettings['start'],
      levelSettings['stop'],
      true,
      levelSettings["resolution"]
    )

    console.log(appointments)

    if (appointments) {
      let dataAvailable = 0
      let dataBooked = 0
      let dataUnarrangedAppointments = 0

      for (const item of appointments) {
        if (item.status === "available") {
          appointmentOffer.push({ total: item['Anzahl'], date: item['reference_date'] })
          dataAvailable += item.Anzahl
        }

        if (item.status === 'booked') {
          appointmentBooked.push({ total: item['Anzahl'], date: item['reference_date'] })
          dataBooked += item.Anzahl
        }

        if (item.status === 'unavailable') {
          appointmentUnarranged.push({ total: item['Anzahl'], date: item['reference_date'] })
        }

        dataUnarrangedAppointments = dataAvailable - dataBooked
      }

      summaryInfo['Anzahl Terminanfragen'] = 0
      summaryInfo['Anzahl nicht vermittelte Terminanfragen'] = 0
      summaryInfo['Anzahl vermittelte Terminanfragen'] = 0
      summaryInfo['Anzahl fristgerecht vermittelt'] = 0
      summaryInfo['Anzahl Angebot'] = dataAvailable
      summaryInfo['Anzahl nicht vermittelt Termine'] = dataUnarrangedAppointments
      summaryInfo['Anzahl Termine vermittelt'] = dataBooked

      // console.log(appointments)

      appointments.appointmentByProfessionGroups = this.api.groupBySum(appointments, 'fg', 'test', 'Anzahl')
      appointments.appointmentOffer = this.flattenArray(appointmentOffer)
      appointments.appointmentBooked = this.flattenArray(appointmentBooked)
      appointments.appointmentUnarranged = this.flattenArray(appointmentUnarranged)
    }

    return {
      summaryInfo: summaryInfo,
      appointmentOfferTotal: appointments.appointmentOffer,
      appointmentBookedTotal: appointments.appointmentBooked
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
