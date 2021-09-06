"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const preload_1 = require("./preload");
const routeUtil = require("./app/util/routeUtil");
const Updater_1 = require("./app/domain/Updater");
const updateInstance = (0, Updater_1.getUpdateInstance)();
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
let app = pinus_1.pinus.createApp();
app.set("name", "pinus-talk-room");
app.configure("production|development", "game", function () {
    updateInstance.init();
});
app.configure("development|production", "connector", function () {
    app.set("connectorConfig", {
        connector: pinus_1.pinus.connectors.hybridconnector,
        heartbeat: 3,
        useDict: true,
        useProtobuf: true,
        // ssl: {
        //   type: "wss",
        //   key: fs.readFileSync("./key/www.allfornaruto.cn.key"),
        //   cert: fs.readFileSync("./key/www.allfornaruto.cn.pem"),
        // },
    });
});
app.configure("production|development", "gate", function () {
    app.set("connectorConfig", {
        connector: pinus_1.pinus.connectors.hybridconnector,
        heartbeat: 3,
        useDict: true,
        useProtobuf: true,
        // ssl: {
        //   type: "wss",
        //   key: fs.readFileSync("./key/www.allfornaruto.cn.key"),
        //   cert: fs.readFileSync("./key/www.allfornaruto.cn.pem"),
        // },
    });
});
app.configure("production|development", function () {
    app.set(pinus_1.RESERVED.ERROR_HANDLER, errorHandler);
    app.set(pinus_1.RESERVED.GLOBAL_ERROR_HANDLER, globalErrorHandler);
    app.globalAfter((err, routeRecord, msg, session, resp, cb) => {
        console.log("global after ", err, routeRecord, msg);
    });
    // route configures
    app.route("game", routeUtil.game);
});
app.start();
process.on("uncaughtException", function (err) {
    console.error(" Caught exception: " + err.stack);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQWdHO0FBQ2hHLHVDQUFvQztBQUNwQyxrREFBa0Q7QUFDbEQsa0RBQXlEO0FBRXpELE1BQU0sY0FBYyxHQUFHLElBQUEsMkJBQWlCLEdBQUUsQ0FBQztBQUMzQzs7OztHQUlHO0FBQ0gsSUFBQSxpQkFBTyxHQUFFLENBQUM7QUFFVixTQUFTLFlBQVksQ0FBQyxHQUFVLEVBQUUsR0FBUSxFQUFFLElBQVMsRUFBRSxPQUFpQyxFQUFFLEVBQW1CO0lBQzNHLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsc0JBQXNCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7MENBQ25FLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO2VBQzNELEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzFCLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDVCxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7S0FDdkI7SUFDRCxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2hCLENBQUM7QUFFRCxTQUFTLGtCQUFrQixDQUFDLEdBQVUsRUFBRSxHQUFRLEVBQUUsSUFBUyxFQUFFLE9BQWlDLEVBQUUsRUFBbUI7SUFDakgsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSwyQkFBMkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQzswQ0FDeEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7ZUFDM0QsR0FBRyxD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