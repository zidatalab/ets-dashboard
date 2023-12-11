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

  datestringparser(input:string){
    return new Date(input).toLocaleDateString()
  }

  async getETerminData(input: any) {
    /**
     * for data structurization and aggregation see Teams Convo 
     */
    if (input === 'stats_angebot') {
      let res_angebot = await this.createStats(this.levelSettings, input)
      return res_angebot
    }

    if (input === 'stats_nachfrage') {
      let res_nachfrage = await this.createStats(this.levelSettings, input)
      return res_nachfrage 
    }

    return null
  }

  async createStats(levelSettings: any, input: any) {
    let dbData: any = await this.db.listData(
      input,
      'KV',
      levelSettings['levelValues'],
      levelSettings['start'],
      levelSettings['stop'],
      true,
      levelSettings["resolution"],
    )
    let summaryInfo: any = []
    let result: any = []

    if (dbData) {
      if (levelSettings['urgency'] !== -1) {
        dbData = dbData.filter((item: any) => {
          return item.angebot_group_dringlichkeit === levelSettings["urgency"]
        })
      }

      result.dataYearSince = dbData[0].date.slice(0,4)
      result.dataDateSince = dbData[0].date
      result.dataDateUntil = dbData[0].date

      if (input === 'stats_angebot') {
        const resAppointmentOffer = []
        const resAppointmentBooked = []
        const resAppointmentUnarranged = []

        let dataAvailableOffer = 0
        let dataBookedAppointments = 0
        let dataUnarrangedAppointments = 0

        for (const item of dbData) {
          if (item.angebot_group_status === "available") {
            resAppointmentOffer.push({ total: item['angebot_Anzahl'], date: this.datestringparser(item['angebot_reference_date']) })
            dataAvailableOffer += item.angebot_Anzahl
          }

          if (item.angebot_group_status === 'booked' || item.angebot_group_status === 'unavailable') {
            resAppointmentBooked.push({ total: item['angebot_Anzahl'], date: this.datestringparser(item['angebot_reference_date']) })
            dataBookedAppointments += item.angebot_Anzahl
          }

          if (item.angebot_group_status === 'unavailable') {
            resAppointmentUnarranged.push({ total: item['angebot_Anzahl'], date: this.datestringparser(item['angebot_reference_date']) })
          }

          dataUnarrangedAppointments = dataAvailableOffer - dataBookedAppointments
        }

        summaryInfo['Anzahl Angebot'] = dataAvailableOffer
        summaryInfo['Anzahl nicht vermittelt Termine'] = dataUnarrangedAppointments
        summaryInfo['Anzahl Termine vermittelt'] = dataBookedAppointments

        result.appointmentByProfessionGroups = this.api.groupBySum(dbData, 'fg', 'test', 'Anzahl')
        result.appointmentOffer = this.flattenArray(resAppointmentOffer)
        result.appointmentBooked = this.flattenArray(resAppointmentBooked)
        result.appointmentUnarranged = this.flattenArray(resAppointmentUnarranged)

        result.dataYearSince = dbData[0].date.slice(0,4)
        result.dataDateUntil = dbData[0].date
      }

      if (input === 'stats_nachfrage') {
        const resAppointmentDemand = []
        const resAppointmentDemandUnarranged = []
        const resAppointmentDemandArranged = []
        let dataAppointmentDemand = 0
        let dataAppointmentDemandUnarranged = 0
        let dataAppointmentDemandArranged = 0

        for (const item of dbData) {
          if (item.nachfrage_group_status ) {
            resAppointmentDemand.push({ total: item['nachfrage_Anzahl'], date: this.datestringparser(item['nachfrage_reference_date']) })
            dataAppointmentDemand += item.nachfrage_Anzahl
          }

          if (item.nachfrage_group_status === "keine_buchung") {
            resAppointmentDemandUnarranged.push({ total: item['nachfrage_Anzahl'], date: this.datestringparser(item['nachfrage_reference_date']) })
            dataAppointmentDemandUnarranged += item.nachfrage_Anzahl
          }

          if (item.nachfrage_group_status === "erfolgreich_gebucht") {
            resAppointmentDemandArranged.push({ total: item['nachfrage_Anzahl'], date: this.datestringparser(item['nachfrage_reference_date']) })
            dataAppointmentDemandArranged += item.nachfrage_Anzahl
          }
        }

        summaryInfo['Anzahl Terminnachfrage'] = dataAppointmentDemand + dataAppointmentDemandUnarranged
        summaryInfo['Anzahl nicht vermittelte Terminnachfrage'] = dataAppointmentDemandUnarranged
        summaryInfo['Anzahl vermittelte Terminnachfrage'] = dataAppointmentDemandArranged
        summaryInfo['Anzahl fristgerecht vermittelt'] = dataAppointmentDemandArranged

        result.resAppointmentDemand = this.flattenArray(resAppointmentDemand)
        result.appointmentDemandUnarranged = this.flattenArray(resAppointmentDemandUnarranged)
        result.appointmentDemandArranged = this.flattenArray(resAppointmentDemandArranged)

        result.dataYearSince = dbData[0].date.slice(0,4)
        result.dataDateUntil = dbData[0].date
      }
    }

    return {
      summaryInfo: summaryInfo,
      appointmentDemandTotal: result.resAppointmentDemand,
      appointmentDemandUnarranged: result.appointmentDemandUnarranged,
      appointmentArranged: result.appointmentDemandArranged,
      appointmentOfferTotal: result.appointmentOffer,
      appointmentBookedTotal: result.appointmentBooked,
      dataYearSince: result.dataYearSince,
      dataDateUntil: result.dataDateUntil,
      dataDateSince: result.dataDateSince
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
