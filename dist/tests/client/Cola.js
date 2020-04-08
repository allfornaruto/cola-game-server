"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus = require("./PinusForEgret");
class ColaClient {
    constructor(playerInfo, gateHost, gatePort, options) {
        this.playerInfo = playerInfo;
        this.gateHost = gateHost;
        this.gatePort = gatePort;
        this.client = new pinus.WSClient();
        if (!!options) {
            this.debug = Boolean(options.debug);
        }
        // 错误处理
        this.client.on(pinus.WSClient.EVENT_IO_ERROR, event => console.error('ColaEvent[error]', event));
        // 关闭处理
        this.client.on(pinus.WSClient.EVENT_CLOSE, event => console.error('ColaEvent[close]', event));
        // 心跳timeout
        this.client.on(pinus.WSClient.EVENT_HEART_BEAT_TIMEOUT, event => console.error('ColaEvent[heartBeatTimeout]', event));
        // 踢出
        this.client.on(pinus.WSClient.EVENT_KICK, event => console.error('ColaEvent[kick]', event));
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
     * @param {String} roomName
     */
    async createRoom(roomName) {
        return new Promise((resolve, reject) => {
            this.client.request("chat.chatHandler.createRoom", { roomName }, (res) => {
                if (res.code === 200) {
                    resolve(res.data);
                }
                else {
                    reject(res);
                }
            });
        });
    }
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
                this.client.request("gate.gateHandler.getConnectorEntry", this.playerInfo.uid, (res) => {
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
                this.client.request("connector.entryHandler.enter", this.playerInfo, (res) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3RzL2NsaWVudC9Db2xhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUNBQXlDO0FBR3pDLE1BQXFCLFVBQVU7SUFTN0IsWUFBWSxVQUEyQixFQUFFLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxPQUEwQjtRQUNyRyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25DLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRTtZQUNiLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNyQztRQUNELE9BQU87UUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNqRyxPQUFPO1FBQ1AsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDOUYsWUFBWTtRQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLDZCQUE2QixFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7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