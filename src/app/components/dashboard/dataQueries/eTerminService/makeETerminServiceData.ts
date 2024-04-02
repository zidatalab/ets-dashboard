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

  localDateParser(input: string) {
    return new Date(input).toLocaleDateString()
  }

  async getETerminData(input: any, isMapData : boolean = false, data : any = []) {
    /**
     * for data structurization and aggregation see Teams Convo 
     */

    if (input === 'stats_angebot') {
      return await this.createStats(this.levelSettings, input)
    }

    if (input === 'stats_nachfrage') {
      return await this.createStats(this.levelSettings, input)
    }

    return null
  }

  async createStatsForMap(data: any, levelSettings: any, input: any) {

    console.log(data)
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

    if (dbData.length > 0) {
      result.dataYearSince = dbData[0].date.slice(0, 4)
      result.dataDateSince = dbData[0].date
      result.dataDateUntil = dbData[dbData.length - 1].date

      if (input === 'stats_angebot') {
        const resAppointmentOffer = []
        const resAppointmentBooked = []
        const resAppointmentUnarranged = []

        let dataAvailableOffer = 0
        let dataBookedAppointments = 0
        let dataUnarrangedAppointments = 0

        const filtered = dbData.filter((item : any) => {
          return item.angebot_group_dringlichkeit === this.levelSettings.urgency
        })
        
        for (const item of filtered) {
          if (item.angebot_group_status === "available" || item.angebot_group_status === 'booked') {
            resAppointmentOffer.push({ total: item['angebot_Anzahl'], date: this.localDateParser(item['angebot_reference_date']) })
            dataAvailableOffer += item.angebot_Anzahl
          }

          if (item.angebot_group_status === 'booked') {
            resAppointmentBooked.push({ total: item['angebot_Anzahl'], date: this.localDateParser(item['angebot_reference_date']) })
            dataBookedAppointments += item.angebot_Anzahl
          }

          if (item.angebot_group_status === 'available') {
            resAppointmentUnarranged.push({ total: item['angebot_Anzahl'], date: this.localDateParser(item['angebot_reference_date']) })
            dataUnarrangedAppointments += item.angebot_Anzahl
          }
        }

        summaryInfo['Anzahl Angebot'] = dataAvailableOffer
        summaryInfo['Anzahl nicht vermittelt Termine'] = dataUnarrangedAppointments
        summaryInfo['Anzahl Termine vermittelt'] = dataBookedAppointments
        summaryInfo['Anteil Terminangebot'] = (dataBookedAppointments / dataAvailableOffer) * 100

        result.appointmentByProfessionGroups = this.api.groupBySum(dbData, 'fg', 'test', 'Anzahl')
        result.appointmentOffer = this.flattenArray(resAppointmentOffer)
        result.appointmentBooked = this.flattenArray(resAppointmentBooked)
        result.appointmentUnarranged = this.flattenArray(resAppointmentUnarranged)

        result.dataYearSince = dbData[0].date.slice(0, 4)
        result.dataDateUntil = dbData[0].date
      }

      if (input === 'stats_nachfrage') {
        const resAppointmentDemand = []
        const resAppointmentDemandUnarranged = []
        const resAppointmentDemandArranged = []
        let dataAppointmentDemand = 0
        let dataAppointmentDemandUnarranged = 0
        let dataAppointmentDemandArranged = 0

        const filtered = dbData.filter((item : any) => {
          return item.nachfrage_group_dringlichkeit === this.levelSettings.urgency
        })

        for (const item of filtered) {
          if (
            (item.nachfrage_group_status === "keine_buchung")
            || (item.nachfrage_group_status === "gebucht_arzt_abgesagt")
            || (item.nachfrage_group_status === "erfolgreich_gebucht")
            || (item.nachfrage_group_status === "gebucht_pat_abgesagt")

          ) {
            resAppointmentDemand.push({ total: item['nachfrage_Anzahl'], date: this.localDateParser(item['nachfrage_reference_date']) })
            dataAppointmentDemand += item.nachfrage_Anzahl
          }

          if ((item.nachfrage_group_status === "keine_buchung")
            || (item.nachfrage_group_status === "gebucht_arzt_abgesagt")
          ) {
            resAppointmentDemandUnarranged.push({ total: item['nachfrage_Anzahl'], date: this.localDateParser(item['nachfrage_reference_date']) })
            dataAppointmentDemandUnarranged += item.nachfrage_Anzahl
          }

          if ((item.nachfrage_group_status === "erfolgreich_gebucht")
            || (item.nachfrage_group_status === "gebucht_pat_abgesagt")
          ) {
            resAppointmentDemandArranged.push({ total: item['nachfrage_Anzahl'], date: this.localDateParser(item['nachfrage_reference_date']) })
            dataAppointmentDemandArranged += item.nachfrage_Anzahl
          }
        }

        summaryInfo['Anzahl Terminnachfrage'] = dataAppointmentDemand
        summaryInfo['Anzahl nicht vermittelte Terminnachfrage'] = dataAppointmentDemandUnarranged
        summaryInfo['Anzahl vermittelte Terminnachfrage'] = dataAppointmentDemandArranged
        summaryInfo['Anzahl fristgerecht vermittelt'] = dataAppointmentDemandArranged
        summaryInfo['Anteil Vermittelungswünsche'] = (dataAppointmentDemandArranged / dataAppointmentDemand) * 100

        result.resAppointmentDemand = this.flattenArray(resAppointmentDemand)
        result.appointmentDemandUnarranged = this.flattenArray(resAppointmentDemandUnarranged)
        result.appointmentDemandArranged = this.flattenArray(resAppointmentDemandArranged)

        result.dataYearSince = dbData[0].date.slice(0, 4)
        result.dataDateUntil = dbData[0].date
      }
      return {
        summaryInfo: summaryInfo,
        appointmentDemandTotal: result.resAppointmentDemand,
        appointmentDemandUnarranged: result.appointmentDemandUnarranged,
        appointmentDemandArranged: result.appointmentDemandArranged,
        appointmentOfferTotal: result.appointmentOffer,
        appointmentBooked: result.appointmentBooked,
        appointmentUnarranged: result.appointmentUnarranged,
        dataYearSince: result.dataYearSince,
        dataDateUntil: result.dataDateUntil,
        dataDateSince: result.dataDateSince
      }
    }

    return {}
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
