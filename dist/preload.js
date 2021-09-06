"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preload = void 0;
const bluebird_1 = require("bluebird");
// 支持注解
require("reflect-metadata");
const pinus_1 = require("pinus");
/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
function preload() {
    // 使用bluebird输出完整的promise调用链
    global.Promise = bluebird_1.Promise;
    // 开启长堆栈
    bluebird_1.Promise.config({
        // Enable warnings
        warnings: true,
        // Enable long stack traces
        longStackTraces: true,
        // Enable cancellation
        cancellation: true,
        // Enable monitoring
        monitoring: true,
    });
    // 自动解析ts的sourcemap
    require("source-map-support").install({
        handleUncaughtExceptions: false,
    });
    // 捕获普通异常
    process.on("uncaughtException", function (err) {
        console.error(pinus_1.pinus.app.getServerId(), "uncaughtException Caught exception: ", err);
    });
    // 捕获async异常
    process.on("unhandledRejection", (reason, p) => {
        console.error(pinus_1.pinus.app.getServerId(), "Caught Unhandled Rejection at:", p, "reason:", reason);
    });
}
exports.preload = preload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlbG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3ByZWxvYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQW1DO0FBQ25DLE9BQU87QUFDUCw0QkFBMEI7QUFDMUIsaUNBQThCO0FBRTlCOzs7O0dBSUc7QUFDSCxTQUFnQixPQUFPO0lBQ3JCLDRCQUE0QjtJQUM1QixNQUFNLENBQUMsT0FBTyxHQUFHLGtCQUFPLENBQUM7SUFDekIsUUFBUTtJQUNSLGtCQUFPLENBQUMsTUFBTSxDQUFDO1FBQ2Isa0JBQWtCO1FBQ2xCLFFBQVEsRUFBRSxJQUFJO1FBQ2QsMkJBQTJCO1FBQzNCLGVBQWUsRUFBRSxJQUFJO1FBQ3JCLHNCQUFzQjtRQUN0QixZQUFZLEVBQUUsSUFBSTtRQUNsQixvQkFBb0I7UUFDcEIsVUFBVSxFQUFFLElBQUk7S0FDakIsQ0FBQyxDQUFDO0lBRUgsbUJBQW1CO0lBQ25CLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUNwQyx3QkFBd0IsRUFBRSxLQUFLO0tBQ2hDLENBQUMsQ0FBQztJQUVILFNBQVM7SUFDVCxPQUFPLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLFVBQVUsR0FBRztRQUMzQyxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsc0NBQXNDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdEYsQ0FBQyxDQUFDLENBQUM7SUFFSCxZQUFZO0lBQ1osT0FBTyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLE1BQVcsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNsRCxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsZ0NBQWdDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNqRyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUE3QkQsMEJBNkJDIn0=