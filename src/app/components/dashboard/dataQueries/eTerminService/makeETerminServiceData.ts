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

  isUrgencyMatch(itemUrgency: string, selectedUrgency: string) {
    if (selectedUrgency === "AKUT") {
      return itemUrgency === "AKUT" || itemUrgency === "PT_AKUTBEHANDLUNG";
    }

    return itemUrgency === selectedUrgency;
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

        for (const item of dbData) {
          if (!this.isUrgencyMatch(item.angebot_group_dringlichkeit, this.levelSettings.urgency)) {
            continue
          }

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

        for (const item of dbData) {
          if (!this.isUrgencyMatch(item.nachfrage_group_dringlichkeit, this.levelSettings.urgency)) {
            continue
          }

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
