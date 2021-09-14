"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const preload_1 = require("./preload");
const routeUtil = require("./app/util/routeUtil");
const Updater_1 = require("./app/domain/Updater");
const fs = require("fs");
const updateInstance = (0, Updater_1.getUpdateInstance)();
/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
(0, preload_1.preload)();
function errorHandler(err, msg, resp, session, cb) {
    const errMsg = `${pinus_1.pinus.app.serverId} error handler msg[${JSON.stringify(msg)}] ,resp[${JSON.stringify(resp)}] ,
  to resolve unknown exception: sessionId:${JSON.stringify(session.export())} ,
  error stack: ${err.stack}`;
    console.error(errMsg);
    if (!resp) {
        resp = { code: 1003, message: errMsg };
    }
    cb(err, resp);
}
function globalErrorHandler(err, msg, resp, session, cb) {
    const errMsg = `${pinus_1.pinus.app.serverId} globalErrorHandler msg[${JSON.stringify(msg)}] ,resp[${JSON.stringify(resp)}] ,
  to resolve unknown exception: sessionId:${JSON.stringify(session.export())} ,
  error stack: ${err.stack}`;
    console.error(errMsg);
    if (cb) {
        cb(err, resp ? resp : { code: 503, message: errMsg });
    }
}
let app = pinus_1.pinus.createApp();
app.set("name", "pinus-talk-room");
app.configure("production|development|test", "game", function () {
    updateInstance.init();
});
app.configure("development|production", "gate", function () {
    app.set("connectorConfig", {
        connector: pinus_1.pinus.connectors.hybridconnector,
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
        connector: pinus_1.pinus.connectors.hybridconnector,
        heartbeat: 3,
        useDict: true,
        useProtobuf: true,
    });
});
app.configure("development|production", "connector", function () {
    app.set("connectorConfig", {
        connector: pinus_1.pinus.connectors.hybridconnector,
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
        connector: pinus_1.pinus.connectors.hybridconnector,
        heartbeat: 3,
        useDict: true,
        useProtobuf: true,
    });
});
app.configure("production|development|test", function () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQWdHO0FBQ2hHLHVDQUFvQztBQUNwQyxrREFBa0Q7QUFDbEQsa0RBQXlEO0FBQ3pELHlCQUF5QjtBQUV6QixNQUFNLGNBQWMsR0FBRyxJQUFBLDJCQUFpQixHQUFFLENBQUM7QUFDM0M7Ozs7R0FJRztBQUNILElBQUEsaUJBQU8sR0FBRSxDQUFDO0FBRVYsU0FBUyxZQUFZLENBQUMsR0FBVSxFQUFFLEdBQVEsRUFBRSxJQUFTLEVBQUUsT0FBaUMsRUFBRSxFQUFtQjtJQUMzRyxNQUFNLE1BQU0sR0FBRyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxzQkFBc0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQzs0Q0FDbEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQzNELEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMzQixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3RCLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDVCxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztLQUN4QztJQUNELEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDaEIsQ0FBQztBQUVELFNBQVMsa0JBQWtCLENBQUMsR0FBVSxFQUFFLEdBQVEsRUFBRSxJQUFTLEVBQUUsT0FBaUMsRUFBRSxFQUFtQjtJQUNqSCxNQUFNLE1BQU0sR0FBRyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSwyQkFBMkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQzs0Q0FD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