"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handler = void 0;
const dispatcher_1 = require("../../../util/dispatcher");
function default_1(app) {
    return new Handler(app);
}
exports.default = default_1;
class Handler {
    constructor(app) {
        this.app = app;
    }
    async getConnectorEntry(uid) {
        console.log(`getConnectorEntry`);
        if (!uid) {
            return { code: 500, message: "缺少uid参数", data: null };
        }
        const connectors = this.app.getServersByType("connector");
        if (!connectors || connectors.length === 0) {
            return { code: 500, message: "没有可以连接的connector服务器", data: null };
        }
        // select connector
        const res = (0, dispatcher_1.dispatch)(uid, connectors);
        return {
            code: 200,
            message: "",
            data: {
                host: res.clientHost,
                port: res.clientPort,
            },
        };
    }
}
exports.Handler = Handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2F0ZUhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nYXRlL2hhbmRsZXIvZ2F0ZUhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EseURBQW9EO0FBR3BELG1CQUF5QixHQUFnQjtJQUN2QyxPQUFPLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzFCLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsT0FBTztJQUNsQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO0lBQUcsQ0FBQztJQUV4QyxLQUFLLENBQUMsaUJBQWlCLENBQUMsR0FBVztRQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNSLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO1NBQ3REO1FBQ0QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7U0FDbEU7UUFDRCxtQkFBbUI7UUFDbkIsTUFBTSxHQUFHLEdBQUcsSUFBQSxxQkFBUSxFQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN0QyxPQUFPO1lBQ0wsSUFBSSxFQUFFLEdBQUc7WUFDVCxPQUFPLEVBQUUsRUFBRTtZQUNYLElBQUksRUFBRTtnQkFDSixJQUFJLEVBQUUsR0FBRyxDQUFDLFVBQVU7Z0JBQ3BCLElBQUksRUFBRSxHQUFHLENBQUMsVUFBVTthQUNyQjtTQUNGLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUF2QkQsMEJBdUJDIn0=