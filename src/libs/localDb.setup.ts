import WorkerInjector from "jsstore/dist/worker_injector";
import { Connection, DATA_TYPE, type ITable } from "jsstore";
import { nanoid } from "nanoid";

const connection = new Connection();
connection.addPlugin(WorkerInjector);

let version = 4;

const localVideos: ITable = {
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
};

connection.initDb({
  name: "cordy",
  tables: [localVideos],
  version,
});

export let uid: Promise<string> = (async function () {
  if (await connection.Map.has("uid")) {
    return await connection.Map.get("uid");
  } else {
    let uid = nanoid();
    await connection.Map.set("uid", uid);
    return uid;
  }
})();

export default connection;
