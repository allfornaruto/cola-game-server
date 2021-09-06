"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appStop = exports.appStart = void 0;
const pinus_1 = require("pinus");
const preload_1 = require("./preload");
const routeUtil = require("./app/util/routeUtil");
const _pinus = require("pinus");
const Updater_1 = require("./app/domain/Updater");
const updateInstance = (0, Updater_1.getUpdateInstance)();
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
(0, preload_1.preload)();
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
const appStart = function () {
    return new Promise((resolve, reject) => {
        const app = pinus_1.pinus.createApp();
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
                // console.log("global after ", err, routeRecord, msg);
            });
            // route configures
            app.route("game", routeUtil.game);
            // filter configures
            app.filter(new pinus_1.pinus.filters.timeout());
        });
        app.start((err, result) => {
            if (err) {
                console.error(err);
                reject();
                return;
            }
            resolve(app);
        });
    });
};
exports.appStart = appStart;
const appStop = (app) => app.stop(true);
exports.appStop = appStop;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwU3RhcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9hcHBTdGFydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBZ0c7QUFDaEcsdUNBQW9DO0FBQ3BDLGtEQUFrRDtBQUNsRCxnQ0FBaUM7QUFDakMsa0RBQXlEO0FBRXpELE1BQU0sY0FBYyxHQUFHLElBQUEsMkJBQWlCLEdBQUUsQ0FBQztBQUMzQyxNQUFNLFFBQVEsR0FBSSxNQUFjLENBQUMsUUFBUSxDQUFDO0FBQzFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsZ0JBQWdCLENBQUM7QUFDbkMsUUFBUSxDQUFDLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQztBQUNwQyxRQUFRLENBQUMsSUFBSSxHQUFHLGVBQWUsQ0FBQztBQUNoQyxRQUFRLENBQUMsR0FBRyxHQUFHLGdCQUFnQixDQUFDO0FBQ2hDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsc0JBQXNCLENBQUM7QUFDaEQsUUFBUSxDQUFDLGFBQWEsR0FBRyxzQkFBc0IsQ0FBQztBQUNoRCxRQUFRLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDO0FBQ3hDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDO0FBQ2xDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsZUFBZSxDQUFDO0FBQ3RDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBRWhDLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztBQUNoRCxhQUFhLENBQUMsY0FBYyxHQUFHLFdBQVcsQ0FBQztBQUMzQyxhQUFhLENBQUMsVUFBVSxHQUFHLGtCQUFrQixDQUFDO0FBQzlDOzs7O0dBSUc7QUFDSCxJQUFBLGlCQUFPLEdBQUUsQ0FBQztBQUVWLFNBQVMsWUFBWSxDQUFDLEdBQVUsRUFBRSxHQUFRLEVBQUUsSUFBUyxFQUFFLE9BQWlDLEVBQUUsRUFBbUI7SUFDM0csT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMs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