"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preload = void 0;
const bluebird_1 = require("bluebird");
// 支持注解
require("reflect-metadata");
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
        console.error(err);
    });
    // 捕获async异常
    process.on("unhandledRejection", (reason, p) => {
        console.error(reason);
    });
}
exports.preload = preload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlbG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3ByZWxvYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQW1DO0FBQ25DLE9BQU87QUFDUCw0QkFBMEI7QUFFMUI7Ozs7R0FJRztBQUNILFNBQWdCLE9BQU87SUFDckIsNEJBQTRCO0lBQzVCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQU8sQ0FBQztJQUN6QixRQUFRO0lBQ1Isa0JBQU8sQ0FBQyxNQUFNLENBQUM7UUFDYixrQkFBa0I7UUFDbEIsUUFBUSxFQUFFLElBQUk7UUFDZCwyQkFBMkI7UUFDM0IsZUFBZSxFQUFFLElBQUk7UUFDckIsc0JBQXNCO1FBQ3RCLFlBQVksRUFBRSxJQUFJO1FBQ2xCLG9CQUFvQjtRQUNwQixVQUFVLEVBQUUsSUFBSTtLQUNqQixDQUFDLENBQUM7SUFFSCxtQkFBbUI7SUFDbkIsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ3BDLHdCQUF3QixFQUFFLEtBQUs7S0FDaEMsQ0FBQyxDQUFDO0lBRUgsU0FBUztJQUNULE9BQU8sQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxHQUFHO1FBQzNDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDLENBQUM7SUFFSCxZQUFZO0lBQ1osT0FBTyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLE1BQVcsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNsRCxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hCLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQTdCRCwwQkE2QkMifQ==