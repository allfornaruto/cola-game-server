"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const preload_1 = require("./preload");
const routeUtil = require("./app/util/routeUtil");
const Updater_1 = require("./app/domain/Updater");
const _pinus = require("pinus");
const filePath = _pinus.FILEPATH;
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
preload_1.preload();
function errorHandler(err, msg, resp, session, cb) {
    console.error(`${pinus_1.pinus.app.serverId} error handler msg[${JSON.stringify(msg)}] ,resp[${JSON.stringify(resp)}] ,
to resolve unknown exception: sessionId:${JSON.stringify(session.export())} ,
error stack: ${err.stack}`);
    if (!resp) {
        resp = { code: 1003 };
    }
    cb(err, resp);
}
function globalErrorHandler(err, msg, resp, session, cb) {
    console.error(`${pinus_1.pinus.app.serverId} globalErrorHandler msg[${JSON.stringify(msg)}] ,resp[${JSON.stringify(resp)}] ,
to resolve unknown exception: sessionId:${JSON.stringify(session.export())} ,
error stack: ${err.stack}`);
    if (cb) {
        cb(err, resp ? resp : { code: 503 });
    }
}
let app = pinus_1.pinus.createApp();
app.set("name", "pinus-talk-room");
app.configure("production|development", "game", function () {
    Updater_1.default.init();
});
app.configure("production|development", "connector", function () {
    app.set("connectorConfig", {
        connector: pinus_1.pinus.connectors.hybridconnector,
        heartbeat: 3,
        useDict: true,
        useProtobuf: true,
    });
});
app.configure("production|development", "gate", function () {
    app.set("connectorConfig", {
        connector: pinus_1.pinus.connectors.hybridconnector,
        useProtobuf: true,
    });
});
app.configure("production|development", function () {
    app.set(pinus_1.RESERVED.ERROR_HANDLER, errorHandler);
    app.set(pinus_1.RESERVED.GLOBAL_ERROR_HANDLER, globalErrorHandler);
    app.globalAfter((err, routeRecord, msg, session, resp, cb) => {
        // console.log('global after ', err, routeRecord, msg);
    });
    // route configures
    app.route("chat", routeUtil.chat);
    // filter configures
    app.filter(new pinus_1.pinus.filters.timeout());
});
app.start();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQWdHO0FBQ2hHLHVDQUFvQztBQUNwQyxrREFBa0Q7QUFDbEQsa0RBQTJDO0FBQzNDLGdDQUFpQztBQUVqQyxNQUFNLFFBQVEsR0FBSSxNQUFjLENBQUMsUUFBUSxDQUFDO0FBQzFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsZ0JBQWdCLENBQUM7QUFDbkMsUUFBUSxDQUFDLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQztBQUNwQyxRQUFRLENBQUMsSUFBSSxHQUFHLGVBQWUsQ0FBQztBQUNoQyxRQUFRLENBQUMsR0FBRyxHQUFHLGdCQUFnQixDQUFDO0FBQ2hDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsc0JBQXNCLENBQUM7QUFDaEQsUUFBUSxDQUFDLGFBQWEsR0FBRyxzQkFBc0IsQ0FBQztBQUNoRCxRQUFRLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDO0FBQ3hDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDO0FBQ2xDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsZUFBZSxDQUFDO0FBQ3RDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBRWhDLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztBQUNoRCxhQUFhLENBQUMsY0FBYyxHQUFHLFdBQVcsQ0FBQztBQUMzQyxhQUFhLENBQUMsVUFBVSxHQUFHLGtCQUFrQixDQUFDO0FBQzlDOzs7O0dBSUc7QUFDSCxpQkFBTyxFQUFFLENBQUM7QUFFVixTQUFTLFlBQVksQ0FBQyxHQUFVLEVBQUUsR0FBUSxFQUFFLElBQVMsRUFBRSxPQUFpQyxFQUFFLEVBQW1CO0lBQzNHLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsc0JBQXNCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxDQUFDLFNB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