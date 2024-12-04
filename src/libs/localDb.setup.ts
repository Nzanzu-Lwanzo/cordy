import WorkerInjector from "jsstore/dist/worker_injector";
import { Connection, DATA_TYPE } from "jsstore";

const connection = new Connection();
connection.addPlugin(WorkerInjector);

let version = 2;

connection.initDb({
  name: "cordy",
  tables: [
    {
      name: "videos",
      columns: {
        id: {
          dataType: DATA_TYPE.Number,
          autoIncrement: true,
          primaryKey: true,
          notNull: true,
        },
        file: { dataType: DATA_TYPE.Object, notNull: true },
        date: {
          dataType: DATA_TYPE.DateTime,
          default: new Date(),
          notNull: true,
        },
      },
      alter: {
        [version]: {
          drop: { url: {} },
          add: {
            blob: { dataType: DATA_TYPE.Object, notNull: true },
          },
        },
      },
    },
  ],
  version,
});

export default connection;
