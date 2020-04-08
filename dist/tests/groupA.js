"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus = require("./client/PinusForEgret");
let usersList = [{
        rid: "room-001",
        uid: "user-1",
        name: "测试用户-1",
        client: null
    }, {
        rid: "room-001",
        uid: "user-2",
        name: "测试用户-2",
        client: null
    }];
usersList = usersList.map(user => {
    const pinusClient = new pinus.WSClient();
    // 错误处理
    pinusClient.on(pinus.WSClient.EVENT_IO_ERROR, event => console.error('>>>>>>error', event));
    // 关闭处理
    pinusClient.on(pinus.WSClient.EVENT_CLOSE, event => console.error('>>>>>>close', event));
    // 心跳timeout
    pinusClient.on(pinus.WSClient.EVENT_HEART_BEAT_TIMEOUT, event => console.error('>>>>>>heart beat timeout', event));
    // 踢出
    pinusClient.on(pinus.WSClient.EVENT_KICK, event => console.error('>>>>>>kick', event));
    // 收到消息
    pinusClient.on('onChat', event => console.log(`>>>>>>onChat user=${user.name} event = ${JSON.stringify(event)}`));
    // 收到玩家进入房间
    pinusClient.on('onAdd', event => console.log(`>>>>>>onAdd user=${user.name} event = ${JSON.stringify(event)}`));
    // 收到玩家离开房间
    pinusClient.on('onLeave', event => console.log(`>>>>>>onLeave user=${user.name} event = ${JSON.stringify(event)}`));
    // 监听到连接断开
    pinusClient.on('onDisconnect', event => console.log(`>>>>>>onDisconnect user=${user.name} event = ${JSON.stringify(event)}`));
    user.client = pinusClient;
    return user;
});
(async () => {
    // 测试用户1：向gate服务器查询可用的connectors
    const user1 = usersList[0];
    const getConnectorsResult1 = await getConnectors(user1.client, "127.0.0.1", "3100");
    const connectors1 = getConnectorsResult1.connectors;
    const connectorHost1 = connectors1[0].clientHost;
    const connectorPort1 = connectors1[0].clientPort;
    // 测试用户1：选择一个connector进行连接，进入房间
    const connectOption1 = {
        rid: user1.rid,
        uid: user1.uid,
        name: user1.name,
    };
    const result1 = await enterRoom(user1.client, connectorHost1, connectorPort1, connectOption1);
    console.log(`result1=${JSON.stringify(result1)}`);
    // 测试用户2：向gate服务器查询可用的connectors
    const user2 = usersList[1];
    const getConnectorsResult2 = await getConnectors(user2.client, "127.0.0.1", "3100");
    const connectors2 = getConnectorsResult2.connectors;
    const connectorHost2 = connectors2[0].clientHost;
    const connectorPort2 = connectors2[0].clientPort;
    // 测试用户2：选择一个connector进行连接，进入房间
    const connectOption2 = {
        rid: user2.rid,
        uid: user2.uid,
        name: user2.name,
    };
    // 返回该房间内存在的用户
    const result2 = await enterRoom(user2.client, connectorHost2, connectorPort2, connectOption2);
    console.log(`result2=${JSON.stringify(result2)}`);
    // 测试用户2：给测试用户1发送消息
    user2.client.notify('chat.chatHandler.send', { content: "你好啊", target: "user-1" });
})().catch(err => console.error(err.message));
function getConnectors(client, host, port) {
    return new Promise((resolve, reject) => {
        client.init({
            host,
            port,
            log: true
        }, () => {
            client.request("gate.gateHandler.getConnectorEntry", {}, res => {
                if (res.code === 200) {
                    resolve({ connectors: res.connectors, message: "" });
                }
                else {
                    console.error(res.message);
                    resolve({ connectors: [], message: res.message });
                }
            });
        });
    });
}
function enterRoom(client, host, port, connectOption) {
    return new Promise((resolve, reject) => {
        client.init({
            host,
            port,
            log: true
        }, () => {
            client.request("connector.entryHandler.enter", connectOption, res => {
                if (res.code === 200) {
                    resolve(res);
                }
                else {
                    console.error(`connector.entryHandler.enter Error`);
                    console.error(res);
                    resolve("connect connector-server error");
                }
            });
        });
    });
}
function sendMessage(client, msg) {
    return new Promise((resolve, reject) => {
        client.request('chat.chatHandler.send', msg, (res) => {
            resolve(res);
        });
    });
}
// 查询频道 -> gate.gateHandler.getConnectorEntry
// 进入频道，自动进入大厅房间，查询大厅玩家列表、查询对战房间列表
// 监听大厅玩家；监听房间
// 创建对战房间
// 选择对战房间并进入；监听玩家进入
// 房间内定向发送消息、广播发送消息；监听玩家消息
// 离开房间；监听玩家离开
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBBLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdHMvZ3JvdXBBLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsZ0RBQWdEO0FBa0JoRCxJQUFJLFNBQVMsR0FBVyxDQUFDO1FBQ3hCLEdBQUcsRUFBRSxVQUFVO1FBQ2YsR0FBRyxFQUFFLFFBQVE7UUFDYixJQUFJLEVBQUUsUUFBUTtRQUNkLE1BQU0sRUFBRSxJQUFJO0tBQ1osRUFBQztRQUNELEdBQUcsRUFBRSxVQUFVO1FBQ2YsR0FBRyxFQUFFLFFBQVE7UUFDYixJQUFJLEVBQUUsUUFBUTtRQUNkLE1BQU0sRUFBRSxJQUFJO0tBQ1osQ0FBQyxDQUFDO0FBRUgsU0FBUyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7SUFDaEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDekMsT0FBTztJQUNQLFdBQVcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzVGLE9BQU87SUFDUCxXQUFXLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN6RixZQUFZO0lBQ1osV0FBVyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ25ILEtBQUs7SUFDTCxXQUFXLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENB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