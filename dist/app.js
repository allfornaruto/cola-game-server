"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const preload_1 = require("./preload");
const routeUtil = require("./app/util/routeUtil");
const Updater_1 = require("./app/domain/Updater");
const _pinus = require("pinus");
const filePath = _pinus.FILEPATH;
filePath.MASTER = '/config/master';
filePath.SERVER = '/config/servers';
filePath.CRON = '/config/crons';
filePath.LOG = '/config/log4js';
filePath.SERVER_PROTOS = '/config/serverProtos';
filePath.CLIENT_PROTOS = '/config/clientProtos';
filePath.MASTER_HA = '/config/masterha';
filePath.LIFECYCLE = '/lifecycle';
filePath.SERVER_DIR = '/app/servers/';
filePath.CONFIG_DIR = '/config';
const adminfilePath = _pinus.DEFAULT_ADMIN_PATH;
adminfilePath.ADMIN_FILENAME = 'adminUser';
adminfilePath.ADMIN_USER = 'config/adminUser';
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
app.set('name', 'pinus-talk-room');
app.configure('production|development', 'chat', function () {
    Updater_1.default.init();
});
app.configure('production|development', 'connector', function () {
    app.set('connectorConfig', {
        connector: pinus_1.pinus.connectors.hybridconnector,
        heartbeat: 3,
        useDict: true,
        useProtobuf: true
    });
});
app.configure('production|development', 'gate', function () {
    app.set('connectorConfig', {
        connector: pinus_1.pinus.connectors.hybridconnector,
        useProtobuf: true
    });
});
app.configure('production|development', function () {
    app.set(pinus_1.RESERVED.ERROR_HANDLER, errorHandler);
    app.set(pinus_1.RESERVED.GLOBAL_ERROR_HANDLER, globalErrorHandler);
    app.globalAfter((err, routeRecord, msg, session, resp, cb) => {
        // console.log('global after ', err, routeRecord, msg);
    });
    // route configures
    app.route('chat', routeUtil.chat);
    // filter configures
    app.filter(new pinus_1.pinus.filters.timeout());
});
app.start();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQWdHO0FBQ2hHLHVDQUFvQztBQUNwQyxrREFBbUQ7QUFDbkQsa0RBQTJDO0FBQzNDLGdDQUFpQztBQUVqQyxNQUFNLFFBQVEsR0FBSSxNQUFjLENBQUMsUUFBUSxDQUFDO0FBQzFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsZ0JBQWdCLENBQUM7QUFDbkMsUUFBUSxDQUFDLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQztBQUNwQyxRQUFRLENBQUMsSUFBSSxHQUFHLGVBQWUsQ0FBQztBQUNoQyxRQUFRLENBQUMsR0FBRyxHQUFHLGdCQUFnQixDQUFDO0FBQ2hDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsc0JBQXNCLENBQUM7QUFDaEQsUUFBUSxDQUFDLGFBQWEsR0FBRyxzQkFBc0IsQ0FBQztBQUNoRCxRQUFRLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDO0FBQ3hDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDO0FBQ2xDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsZUFBZSxDQUFDO0FBQ3RDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBRWhDLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztBQUNoRCxhQUFhLENBQUMsY0FBYyxHQUFHLFdBQVcsQ0FBQztBQUMzQyxhQUFhLENBQUMsVUFBVSxHQUFHLGtCQUFrQixDQUFDO0FBQzlDOzs7O0dBSUc7QUFDSCxpQkFBTyxFQUFFLENBQUM7QUFFVixTQUFTLFlBQVksQ0FBQyxHQUFVLEVBQUUsR0FBUSxFQUFFLElBQVMsRUFDbkQsT0FBaUMsRUFBRSxFQUFtQjtJQUN0RCxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLHNCQUFzQixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksQ0FBQyxT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