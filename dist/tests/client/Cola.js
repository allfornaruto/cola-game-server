"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus = require("./PinusForEgret");
class ColaClient {
    constructor(params, options) {
        this.gameId = params.gameId;
        this.playerInitInfo = params.playerInitInfo;
        this.gateHost = params.gateHost;
        this.gatePort = params.gatePort;
        this.client = new pinus.WSClient();
        if (!!options) {
            this.debug = Boolean(options.debug);
        }
    }
    /**
     * Cola事件监听处理
     * @param event 事件名称
     * @param cb 监听回调
     */
    listen(event, cb) {
        this.client.on(event, data => {
            cb(data);
        });
    }
    /**
     * 进入游戏大厅
     */
    async enterHall() {
        try {
            const { host, port } = await this.getConnector();
            this.connectorHost = host;
            this.connectorPort = port;
            await this.startConnectToHall();
        }
        catch (e) {
            console.error(e);
        }
    }
    /**
     * 创建房间
     * @param {Cola.Params.CreateRoom} params 创建房间参数
     */
    createRoom(params) {
        return new Promise((resolve, reject) => {
            const requestData = {
                gameId: this.gameId,
                name: params.name,
                type: params.type,
                createType: params.createType,
                maxPlayers: params.maxPlayers,
                isPrivate: params.isPrivate,
                customProperties: params.customProperties,
                teamList: params.teamList,
                playerInfoExtra: params.playerInfoExtra,
            };
            this.client.request("game.gameHandler.createRoom", requestData, (res) => {
                if (res.code === 200) {
                    resolve(res.data);
                }
                else {
                    reject(res);
                }
            });
        });
    }
    /**
     * 进入房间
     * @param {Cola.Params.EnterRoom} params 进入房间参数
     */
    enterRoom(params) {
        return new Promise((resolve, reject) => {
            const requestData = params;
            this.client.request("game.gameHandler.enterRoom", requestData, (res) => {
                if (res.code === 200) {
                    resolve(res.data);
                }
                else {
                    reject(res);
                }
            });
        });
    }
    /**
     * 离开房间
     * @param {string} rid 房间id
     */
    leaveRoom(rid) {
        const requestData = { rid };
        this.client.notify("game.gameHandler.leaveRoom", requestData);
    }
    /**
     * 根据房间ID获取房间信息
     * @param {Cola.Request.GetRoomByRoomId} params
     */
    getRoomByRoomId(params) {
        return new Promise((resolve, reject) => {
            const requestData = params;
            this.client.request("game.gameHandler.getRoomByRoomId", requestData, (res) => {
                if (res.code === 200) {
                    resolve(res.data);
                }
                else {
                    reject(res);
                }
            });
        });
    }
    /**
     * 房主修改房间信息
     * @description 修改成功后，房间内全部成员都会收到一条修改房间广播 onChangeRoom，Room实例将更新。
     * @description 只有房主有权限修改房间
     * @param {Cola.Params.ChangeRoom} params 修改房间信息参数
     */
    changeRoom(params) {
        return new Promise((resolve, reject) => {
            const requestData = params;
            this.client.request("game.gameHandler.changeRoom", requestData, (res) => {
                if (res.code === 200) {
                    resolve(res.data);
                }
                else {
                    reject(res);
                }
            });
        });
    }
    /**
     * 修改玩家状态
     * @description 修改玩家状态是修改 Player 中的 customPlayerStatus 字段，玩家的状态由开发者自定义。
     * @description 修改成功后，房间内全部成员都会收到一条修改玩家状态广播 onChangeCustomPlayerStatus，Room实例将更新。
     * @param {number} customPlayerStatus 修改玩家状态参数
     */
    changeCustomPlayerStatus(customPlayerStatus) {
        return new Promise((resolve, reject) => {
            const requestData = {
                customPlayerStatus,
            };
            this.client.request("game.gameHandler.changeCustomPlayerStatus", requestData, (res) => {
                if (res.code === 200) {
                    resolve(res.data);
                }
                else {
                    reject(res);
                }
            });
        });
    }
    /**
     * 房间内任意一个玩家成功调用该接口将导致全部玩家开始接收帧广播
     *
     * 调用成功后房间内全部成员将收到 onStartFrameSync 广播。该接口会修改房间帧同步状态为“已开始帧同步”
     */
    startFrameSync() {
        return new Promise((resolve, reject) => {
            const requestData = {};
            this.client.request("game.gameHandler.startFrameSync", requestData, (res) => {
                if (res.code === 200) {
                    resolve(res.data);
                }
                else {
                    reject(res);
                }
            });
        });
    }
    /**
     * 发送帧数据参数
     *
     * 必须在调用startFrameSync之后才可调用该方法
     *
     */
    sendFrame(data) {
        return new Promise((resolve, reject) => {
            const requestData = { data };
            this.client.request("game.gameHandler.sendFrame", requestData, (res) => {
                if (res.code === 200) {
                    resolve(res.data);
                }
                else {
                    reject(res);
                }
            });
        });
    }
    /**
     * 房间内任意一个玩家成功调用该接口将导致全部玩家停止接收帧广播
     *
     * 调用成功后房间内全部成员将收到 onStopFrameSync 广播。该接口会修改房间帧同步状态为“已停止帧同步”
     */
    stopFrameSync() {
        return new Promise((resolve, reject) => {
            const requestData = {};
            this.client.request("game.gameHandler.stopFrameSync", requestData, (res) => {
                if (res.code === 200) {
                    resolve(res.data);
                }
                else {
                    reject(res);
                }
            });
        });
    }
    /**
     * 在房间内发送消息给指定用户
     * @param {string[]} uidList 用户uid数组
     * @param {string} content 发送内容
     */
    sendMsg(uidList, content) {
        return new Promise((resolve, _) => {
            const requestData = { uidList, content };
            this.client.request("game.gameHandler.sendToClient", requestData, (res) => {
                if (res.code === 200) {
                    resolve(res.data);
                }
            });
        });
    }
    /**
     * 与服务器断开连接
     */
    async close() {
        const status = await this.client.disconnect();
        return { status };
    }
    /**
     * 通过gate服务器查询分配的connector服务器
     */
    getConnector() {
        return new Promise((resolve, reject) => {
            this.client.init({
                host: this.gateHost,
                port: this.gatePort,
                log: this.debug,
            }, () => {
                const requestData = this.playerInitInfo.uid;
                this.client.request("gate.gateHandler.getConnectorEntry", requestData, (res) => {
                    if (res.code === 200) {
                        resolve(res.data);
                    }
                    else {
                        reject(res);
                    }
                });
            });
        });
    }
    /**
     * 连接上connector服务器，并进入大厅
     */
    startConnectToHall() {
        return new Promise((resolve, reject) => {
            this.client.init({
                host: this.connectorHost,
                port: this.connectorPort,
                log: this.debug,
            }, () => {
                const requestData = this.playerInitInfo;
                this.client.request("connector.entryHandler.enter", requestData, (res) => {
                    if (res.code === 200) {
                        resolve();
                    }
                    else {
                        reject(res);
                    }
                });
            });
        });
    }
}
exports.default = ColaClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3RzL2NsaWVudC9Db2xhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUNBQXlDO0FBR3pDLE1BQXFCLFVBQVU7SUFVN0IsWUFBWSxNQUFpQixFQUFFLE9BQTBCO1FBQ3ZELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM1QixJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUM7UUFDNUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUNoQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25DLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRTtZQUNiLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNyQztJQUNILENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLEtBQWlCLEVBQUUsRUFBb0I7UUFDbkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQzNCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ksS0FBSyxDQUFDLFNBQVM7UUFDcEIsSUFBSTtZQUNGLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDakQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFDMUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFDMUIsTUFBTSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztTQUNqQztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNsQjtJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSSxVQUFVLENBQUMsTUFBOEI7UUFDOUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNyQyxNQUFNLFdBQVcsR0FBK0I7Z0JBQzlDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtnQkFDbkIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO2dCQUNqQixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7Z0JBQ2pCLFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVTtnQkFDN0IsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVO2dCQUM3QixTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVM7Z0JBQzNCLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0I7Z0JBQ3pDLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUTtnQkFDekIsZUFBZSxFQUFFLE1BQU0sQ0FBQyxlQUFlO2FBQ3hDLENBQUM7WUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsRUFBRSxXQUFXLEVBQUUsQ0FBQyxHQUE2QixFQUFFLEVBQUU7Z0JBQ2hHLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxHQUFHLEVBQUU7b0JBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ25CO3FCQUFNO29CQUNMLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDYjtZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksU0FBUyxDQUFDLE1BQTZCO1FBQzVDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDckMsTUFBTSxXQUFXLEdBQThCLE1BQU0sQ0FBQztZQUN0RCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsRUFBRSxXQUFXLEVBQUUsQ0FBQyxHQUE0QixFQUFFLEVBQUU7Z0JBQzlGLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxHQUFHLEVBQUU7b0JBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ25CO3FCQUFNO29CQUNMLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDYjtZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksU0FBUyxDQUFDLEdBQVc7UUFDMUIsTUFBTSxXQUFXLEdBQThCLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDdkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsNEJBQTRCLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVEOzs7T0FHRztJQUNJLGVBQWUsQ0FBQyxNQUFvQztRQUN6RCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3JDLE1BQU0sV0FBVyxHQUFpQyxNQUFNLENBQUM7WUFDekQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsa0NBQWtDLEVBQUUsV0FBVyxFQUFFLENBQUMsR0FBa0MsRUFBRSxFQUFFO2dCQUMxRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssR0FBRyxFQUFFO29CQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNuQjtxQkFBTTtvQkFDTCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2I7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksVUFBVSxDQUFDLE1BQThCO1FBQzlDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDckMsTUFBTSxXQUFXLEdBQStCLE1BQU0sQ0FBQztZQUN2RCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsRUFBRSxXQUFXLEVBQUUsQ0FBQyxHQUE2QixFQUFFLEVBQUU7Z0JBQ2hHLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxHQUFHLEVBQUU7b0JBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ25CO3FCQUFNO29CQUNMLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDYjtZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSx3QkFBd0IsQ0FBQyxrQkFBMEI7UUFDeEQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNyQyxNQUFNLFdBQVcsR0FBMEM7Z0JBQ3pELGtCQUFrQjthQUNuQixDQUFDO1lBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsMkNBQTJDLEVBQUUsV0FBVyxFQUFFLENBQUMsR0FBMkMsRUFBRSxFQUFFO2dCQUM1SCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssR0FBRyxFQUFFO29CQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNuQjtxQkFBTTtvQkFDTCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2I7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxjQUFjO1FBQ25CLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDckMsTUFBTSxXQUFXLEdBQWdDLEVBQUUsQ0FBQztZQUNwRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxHQUFpQyxFQUFFLEVBQUU7Z0JBQ3hHLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxHQUFHLEVBQUU7b0JBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ25CO3FCQUFNO29CQUNMLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDYjtZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxTQUFTLENBQUMsSUFBWTtRQUMzQixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3JDLE1BQU0sV0FBVyxHQUEyQixFQUFFLElBQUksRUFBRSxDQUFDO1lBQ3JELElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDRCQUE0QixFQUFFLFdBQVcsRUFBRSxDQUFDLEdBQTRCLEVBQUUsRUFBRTtnQkFDOUYsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLEdBQUcsRUFBRTtvQkFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDbkI7cUJBQU07b0JBQ0wsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNiO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksYUFBYTtRQUNsQixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3JDLE1BQU0sV0FBVyxHQUErQixFQUFFLENBQUM7WUFDbkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0NBQWdDLEVBQUUsV0FBVyxFQUFFLENBQUMsR0FBZ0MsRUFBRSxFQUFFO2dCQUN0RyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssR0FBRyxFQUFFO29CQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNuQjtxQkFBTTtvQkFDTCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2I7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxPQUFPLENBQUMsT0FBaUIsRUFBRSxPQUFlO1FBQy9DLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDaEMsTUFBTSxXQUFXLEdBQThCLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ3BFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLCtCQUErQixFQUFFLFdBQVcsRUFBRSxDQUFDLEdBQStCLEVBQUUsRUFBRTtnQkFDcEcsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLEdBQUcsRUFBRTtvQkFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDbkI7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ksS0FBSyxDQUFDLEtBQUs7UUFDaEIsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzlDLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBRUQ7O09BRUc7SUFDSyxZQUFZO1FBQ2xCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ2Q7Z0JBQ0UsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRO2dCQUNuQixJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQ25CLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSzthQUNoQixFQUNELEdBQUcsRUFBRTtnQkFDSCxNQUFNLFdBQVcsR0FBbUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUM7Z0JBQzVFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLG9DQUFvQyxFQUFFLFdBQVcsRUFBRSxDQUFDLEdBQXdDLEVBQUUsRUFBRTtvQkFDbEgsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLEdBQUcsRUFBRTt3QkFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDbkI7eUJBQU07d0JBQ0wsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUNiO2dCQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUNGLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNLLGtCQUFrQjtRQUN4QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNkO2dCQUNFLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYTtnQkFDeEIsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhO2dCQUN4QixHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUs7YUFDaEIsRUFDRCxHQUFHLEVBQUU7Z0JBQ0gsTUFBTSxXQUFXLEdBQWdDLElBQUksQ0FBQyxjQUFjLENBQUM7Z0JBQ3JFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDhCQUE4QixFQUFFLFdBQVcsRUFBRSxDQUFDLEdBQWlDLEVBQUUsRUFBRTtvQkFDckcsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLEdBQUcsRUFBRTt3QkFDcEIsT0FBTyxFQUFFLENBQUM7cUJBQ1g7eUJBQU07d0JBQ0wsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUNiO2dCQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUNGLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQTVSRCw2QkE0UkMifQ==