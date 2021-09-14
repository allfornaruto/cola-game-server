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
            try {
                cb(data);
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    /**
     * 取消Cola事件监听处理
     * @param event 事件名称
     * @param cb 取消回调
     */
    listenOff(event, cb) {
        try {
            this.client.off(event, () => {
                try {
                    cb();
                }
                catch (e) {
                    console.error(e);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
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
     * 房主解散房间
     * @param {string} rid 房间id
     */
    dismissRoom(rid) {
        const requestData = { rid };
        this.client.notify("game.gameHandler.dismissRoom", requestData);
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
     * 获取房间列表
     * @param {Cola.Request.GetRoomList} params
     */
    getRoomList(params) {
        return new Promise((resolve, reject) => {
            const requestData = params;
            this.client.request("game.gameHandler.getRoomList", requestData, (res) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3RzL2NsaWVudC9Db2xhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUNBQXlDO0FBR3pDLE1BQXFCLFVBQVU7SUFVN0IsWUFBWSxNQUFpQixFQUFFLE9BQTBCO1FBQ3ZELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM1QixJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUM7UUFDNUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUNoQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25DLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRTtZQUNiLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNyQztJQUNILENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLEtBQWlCLEVBQUUsRUFBb0I7UUFDbkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQzNCLElBQUk7Z0JBQ0YsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ1Y7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2xCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLFNBQVMsQ0FBQyxLQUFpQixFQUFFLEVBQVk7UUFDOUMsSUFBSTtZQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUU7Z0JBQzFCLElBQUk7b0JBQ0YsRUFB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