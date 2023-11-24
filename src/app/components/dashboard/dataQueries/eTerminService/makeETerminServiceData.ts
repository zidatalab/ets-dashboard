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

    let dbData: any = await this.db.listData(
      ['stats_angebot', 'stats_nachfrage'],
      'KV',
      levelSettings['levelValues'],
      levelSettings['start'],
      levelSettings['stop'],
      true,
      levelSettings["resolution"]
    )

    console.log(levelSettings)
    console.log(dbData)

    if (dbData) {
      console.log(dbData['nachfrage_Anzahl'])
      let dataAvailableOffer = 0
      let dataBookedAppointments = 0
      let dataUnarrangedAppointments = 0

      for (const item of dbData) {
        if (item.angebot_group_status === "available") {
          appointmentOffer.push({ total: item['angebot_Anzahl'], date: item['angebot_reference_date'] })
          dataAvailableOffer += item.angebot_Anzahl
        }
        
        if (item.angebot_group_status === 'booked') {
          appointmentBooked.push({ total: item['angebot_Anzahl'], date: item['angebot_reference_date'] })
          dataBookedAppointments += item.angebot_Anzahl
        }

        if (item.angebot_group_status === 'unavailable') {
          appointmentUnarranged.push({ total: item['angebot_Anzahl'], date: item['angebot_reference_date'] })
        }

        dataUnarrangedAppointments = dataAvailableOffer - dataBookedAppointments
      }

      summaryInfo['Anzahl Terminnachfrage'] = 0
      summaryInfo['Anzahl nicht vermittelte Terminnachfrage'] = 0
      summaryInfo['Anzahl vermittelte Terminnachfrage'] = 0
      summaryInfo['Anzahl fristgerecht vermittelt'] = 0
      summaryInfo['Anzahl Angebot'] = dataAvailableOffer
      summaryInfo['Anzahl nicht vermittelt Termine'] = dataUnarrangedAppointments
      summaryInfo['Anzahl Termine vermittelt'] = dataBookedAppointments

      dbData.appointmentByProfessionGroups = this.api.groupBySum(dbData, 'fg', 'test', 'Anzahl')
      dbData.appointmentOffer = this.flattenArray(appointmentOffer)
      dbData.appointmentBooked = this.flattenArray(appointmentBooked)
      dbData.appointmentUnarranged = this.flattenArray(appointmentUnarranged)
    }

    return {
      summaryInfo: summaryInfo,
      appointmentOfferTotal: dbData.appointmentOffer,
      appointmentBookedTotal: dbData.appointmentBooked
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
