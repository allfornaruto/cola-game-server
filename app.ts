import { pinus, RESERVED, RouteRecord, FrontendOrBackendSession, HandlerCallback } from "pinus";
import { preload } from "./preload";
import * as routeUtil from "./app/util/routeUtil";
import { getUpdateInstance } from "./app/domain/Updater";
import _pinus = require("pinus");
import * as fs from "fs";

const updateInstance = getUpdateInstance();
const filePath = (_pinus as any).FILEPATH;
filePath.MASTER = "/config/master";
filePath.SERVER = "/config/servers";
filePath.CRON = "/config/crons";
filePath.LOG = "/config/log4js";
filePath.SERVER_PROTOS = "/config/serverProtos";
filePath.CLIENT_PROTOS = "/config/clientProtos";
filePath.MASTER_HA = "/config/masterha";
filePath.LIFECYCLE = "/lifecycle";
filePath.SERVER_DIR = "/app/servers/";
filePath.CONFIG_DIR = "/config";

const adminfilePath = _pinus.DEFAULT_ADMIN_PATH;
adminfilePath.ADMIN_FILENAME = "adminUser";
adminfilePath.ADMIN_USER = "config/adminUser";
/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
preload();

function errorHandler(err: Error, msg: any, resp: any, session: FrontendOrBackendSession, cb: HandlerCallback) {
  console.error(`${pinus.app.serverId} error handler msg[${JSON.stringify(msg)}] ,resp[${JSON.stringify(resp)}] ,
to resolve unknown exception: sessionId:${JSON.stringify(session.export())} ,
error stack: ${err.stack}`);
  if (!resp) {
    resp = { code: 1003 };
  }
  cb(err, resp);
}

function globalErrorHandler(err: Error, msg: any, resp: any, session: FrontendOrBackendSession, cb: HandlerCallback) {
  console.error(`${pinus.app.serverId} globalErrorHandler msg[${JSON.stringify(msg)}] ,resp[${JSON.stringify(resp)}] ,
to resolve unknown exception: sessionId:${JSON.stringify(session.export())} ,
error stack: ${err.stack}`);

  if (cb) {
    cb(err, resp ? resp : { code: 503 });
  }
}

let app = pinus.createApp();
app.set("name", "pinus-talk-room");

app.configure("production|development", "game", function () {
  updateInstance.init();
});

app.configure("development|production", "connector", function () {
  app.set("connectorConfig", {
    connector: pinus.connectors.hybridconnector,
    heartbeat: 3,
    useDict: true,
    useProtobuf: true,
    ssl: {
      type: "wss",
      key: fs.readFileSync("./key/www.allfornaruto.cn.key"),
      cert: fs.readFileSync("./key/www.allfornaruto.cn.pem"),
    },
  });
});

app.configure("production|development", "gate", function () {
  app.set("connectorConfig", {
    connector: pinus.connectors.hybridconnector,
    heartbeat: 3,
    useDict: true,
    useProtobuf: true,
    ssl: {
      type: "wss",
      key: fs.readFileSync("./key/www.allfornaruto.cn.key"),
      cert: fs.readFileSync("./key/www.allfornaruto.cn.pem"),
    },
  });
});

app.configure("production|development", function () {
  app.set(RESERVED.ERROR_HANDLER, errorHandler);
  app.set(RESERVED.GLOBAL_ERROR_HANDLER, globalErrorHandler);
  app.globalAfter((err: Error, routeRecord: RouteRecord, msg: any, session: FrontendOrBackendSession, resp: any, cb: HandlerCallback) => {
    // console.log('global after ', err, routeRecord, msg);
  });

  // route configures
  app.route("game", routeUtil.game);

  // filter configures
  app.filter(new pinus.filters.timeout());
});

app.start();
