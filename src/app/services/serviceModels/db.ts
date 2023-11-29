import Dexie, { Table } from "dexie";

export class DataItem {
  level: string = '';
  levelId: string = '';
  year: number = 0;
  month: number = 0;
  calenderWeek: number = 0;
  date: string = '';
  indicator: string = '';
  timeframe: string = '';
  data:any;
}

export class StandItem {
  level: string = '';
  levelId: string = '';
  stand: string = '';
  indicator: string = '';
  startDate: string = '';
  stopDate: string = '';
  timeframe: string = '';
}

export class AppDB extends Dexie {
  public dataDB: Table<DataItem, number>;
  public standDB: Table<StandItem, number>;

  constructor() {
    super('smeddb')

    const db = this

    db.on("close", function (event: any) {
      db.close()
    })

    db.version(11).stores({
      dataDB: 'id++,[level+levelId+indicator+timeframe+date],[level+levelId+indicator+timeframe]',
      standDB: 'id++,[level+levelId+indicator+timeframe]',
    })

    db.dataDB.mapToClass(DataItem)
    db.standDB.mapToClass(StandItem)
  }
}

export const db = new AppDB()