import { pinus, RESERVED, RouteRecord, FrontendOrBackendSession, HandlerCallback } from "pinus";
import { preload } from "./preload";
import * as routeUtil from "./app/util/routeUtil";
import { getUpdateInstance } from "./app/domain/Updater";
import * as fs from "fs";

const updateInstance = getUpdateInstance();
/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
preload();

function errorHandler(err: Error, msg: any, resp: any, session: FrontendOrBackendSession, cb: HandlerCallback) {
  const errMsg = `${pinus.app.serverId} error handler msg[${JSON.stringify(msg)}] ,resp[${JSON.stringify(resp)}] ,
  to resolve unknown exception: sessionId:${JSON.stringify(session.export())} ,
  error stack: ${err.stack}`;
  console.error(errMsg);
  if (!resp) {
    resp = { code: 1003, message: errMsg };
  }
  cb(err, resp);
}

function globalErrorHandler(err: Error, msg: any, resp: any, session: FrontendOrBackendSession, cb: HandlerCallback) {
  const errMsg = `${pinus.app.serverId} globalErrorHandler msg[${JSON.stringify(msg)}] ,resp[${JSON.stringify(resp)}] ,
  to resolve unknown exception: sessionId:${JSON.stringify(session.export())} ,
  error stack: ${err.stack}`;
  console.error(errMsg);

  if (cb) {
    cb(err, resp ? resp : { code: 503, message: errMsg });
  }
}

let app = pinus.createApp();
app.set("name", "pinus-talk-room");

app.configure("production|development|test", "game", function () {
  updateInstance.init();
});

app.configure("development|production", "gate", function () {
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

app.configure("test", "gate", function () {
  app.set("connectorConfig", {
    connector: pinus.connectors.hybridconnector,
    heartbeat: 3,
    useDict: true,
    useProtobuf: true,
  });
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

app.configure("test", "connector", function () {
  app.set("connectorConfig", {
    connector: pinus.connectors.hybridconnector,
    heartbeat: 3,
    useDict: true,
    useProtobuf: true,
  });
});

app.configure("production|development|test", function () {
  app.set(RESERVED.ERROR_HANDLER, errorHandler);
  app.set(RESERVED.GLOBAL_ERROR_HANDLER, globalErrorHandler);
  app.globalAfter((err: Error, routeRecord: RouteRecord, msg: any, session: FrontendOrBackendSession, resp: any, cb: HandlerCallback) => {
    console.log("global after ", err, routeRecord, msg);
  });

  // route configures
  app.route("game", routeUtil.game);
});

app.start();

process.on("uncaughtException", function (err) {
  console.error(" Caught exception: " + err.stack);
});
