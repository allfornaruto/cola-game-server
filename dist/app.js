"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const preload_1 = require("./preload");
const routeUtil = require("./app/util/routeUtil");
const Updater_1 = require("./app/domain/Updater");
const _pinus = require("pinus");
const updateInstance = Updater_1.getUpdateInstance();
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
    updateInstance.init();
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
    app.route("game", routeUtil.game);
    // filter configures
    app.filter(new pinus_1.pinus.filters.timeout());
});
app.start();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQWdHO0FBQ2hHLHVDQUFvQztBQUNwQyxrREFBa0Q7QUFDbEQsa0RBQXlEO0FBQ3pELGdDQUFpQztBQUVqQyxNQUFNLGNBQWMsR0FBRywyQkFBaUIsRUFBRSxDQUFDO0FBQzNDLE1BQU0sUUFBUSxHQUFJLE1BQWMsQ0FBQyxRQUFRLENBQUM7QUFDMUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQztBQUNuQyxRQUFRLENBQUMsTUFBTSxHQUFHLGlCQUFpQixDQUFDO0FBQ3BDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsZUFBZSxDQUFDO0FBQ2hDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsZ0JBQWdCLENBQUM7QUFDaEMsUUFBUSxDQUFDLGFBQWEsR0FBRyxzQkFBc0IsQ0FBQztBQUNoRCxRQUFRLENBQUMsYUFBYSxHQUFHLHNCQUFzQixDQUFDO0FBQ2hELFFBQVEsQ0FBQyxTQUFTLEdBQUcsa0JBQWtCLENBQUM7QUFDeEMsUUFBUSxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUM7QUFDbEMsUUFBUSxDQUFDLFVBQVUsR0FBRyxlQUFlLENBQUM7QUFDdEMsUUFBUSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFFaEMsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDO0FBQ2hELGFBQWEsQ0FBQyxjQUFjLEdBQUcsV0FBVyxDQUFDO0FBQzNDLGFBQWEsQ0FBQyxVQUFVLEdBQUcsa0JBQWtCLENBQUM7QUFDOUM7Ozs7R0FJRztBQUNILGlCQUFPLEVBQUUsQ0FBQztBQUVWLFNBQVMsWUFBWSxDQUFDLEdBQVUsRUFBRSxHQUFRLEVBQUUsSUFBUyxFQUFFLE9BQWlDLEVBQUUsRUFBbUI7SUFDM0csT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxzQkFBc0IsSUFBSSxDQUFD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