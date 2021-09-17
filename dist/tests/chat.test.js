"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Cola_1 = require("../client/Cola");
const testUtils_1 = require("./testUtils");
const gateHost = "127.0.0.1";
const gatePort = 3100;
const playerInfoA = {
    uid: "111111",
    gameId: "dnf",
    name: "测试用户-A",
};
const playerInfoExtraA = {
    teamId: "1",
    customPlayerStatus: 0,
    customProfile: JSON.stringify({ hp: 100, mp: 80 }),
    matchAttributes: [],
};
const playerInfoB = {
    uid: "222222",
    gameId: "dnf",
    name: "测试用户-B",
};
const playerInfoExtraB = {
    teamId: "2",
    customPlayerStatus: 0,
    customProfile: JSON.stringify({ hp: 120, mp: 60 }),
    matchAttributes: [],
};
const myRoomA = {
    name: "room-1977",
    type: "0",
    createType: 0,
    maxPlayers: 2,
    isPrivate: false,
    customProperties: "",
    teamList: [],
    playerInfoExtra: playerInfoExtraA,
};
const init_A = {
    gateHost,
    gatePort,
    gameId: "dnf",
    playerInitInfo: playerInfoA,
};
const init_B = {
    gateHost,
    gatePort,
    gameId: "dnf",
    playerInitInfo: playerInfoB,
};
const options = {
    debug: true,
};
let colaA = null;
let colaB = null;
const log = testUtils_1.default.getLog({});
beforeEach(async () => {
    // 测试用户A
    colaA = new Cola_1.default(init_A, options);
    // 心跳timeout
    colaA.listen("heartBeatTimeout", event => {
        colaA.log(`chat.test.ts heartBeatTimeout`, event);
    });
    colaA.listen("onHallAdd", (event) => {
        colaA.log(`chat.test.ts onHallAdd`, event);
    });
    // 测试用户B
    colaB = new Cola_1.default(init_B, options);
    // 心跳timeout
    colaB.listen("heartBeatTimeout", event => {
        colaB.log(`chat.test.ts heartBeatTimeout`, event);
    });
    colaB.listen("onHallAdd", (event) => {
        colaB.log(`chat.test.ts onHallAdd`, event);
    });
});
afterEach(async () => {
    await colaA.close();
    colaA = null;
    await colaB.close();
    colaB = null;
});
test("用户A创建房间room-1977，用户B进入该房间，用户A发送消息，用户B监听消息", () => {
    return new Promise(async (resolve, reject) => {
        try {
            let rid = "";
            // 用户A监听用户B进入房间事件
            colaA.listen("onRoomAdd", async (event) => {
                try {
                    colaA.log("chat.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A发送消息，用户B监听消息 onRoomAdd", event);
                    expect(event.uid).toBe(playerInfoB.uid);
                    expect(event.gameId).toBe(playerInfoB.gameId);
                    expect(event.name).toBe(playerInfoB.name);
                    expect(event.teamId).toStrictEqual(playerInfoExtraB.teamId);
                    expect(event.customPlayerStatus).toBe(playerInfoExtraB.customPlayerStatus);
                    expect(event.customProfile).toBe(playerInfoExtraB.customProfile);
                    expect(event.matchAttributes).toStrictEqual(playerInfoExtraB.matchAttributes);
                    // 用户A发送消息
                    const sendResult = await colaA.sendMsg(["222222"], "Hello colaB");
                    expect(sendResult.status).toBeTruthy();
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户B监听用户A创建房间事件
            colaB.listen("onRoomCreate", async (event) => {
                try {
                    colaB.log("chat.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A发送消息，用户B监听消息 onRoomCreate", event);
                    rid = event.rid;
                    const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
                    colaB.log("chat.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A发送消息，用户B监听消息 roomInfo=", roomInfo);
                    expect(roomInfo.playerList.length).toBe(2);
                    expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
                    expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户B监听用户A发送的消息
            colaB.listen("onChat", async (event) => {
                try {
                    colaB.log("chat.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A发送消息，用户B监听消息 onChat", event);
                    expect(event.msg).toBe("Hello colaB");
                    expect(event.from).toBe(playerInfoA.uid);
                    expect(event.target).toStrictEqual([playerInfoB.uid]);
                    setTimeout(() => resolve(), 1000);
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户A、B进入游戏大厅，用户A创建房间
            await colaA.enterHall();
            await colaB.enterHall();
            await colaA.createRoom(myRoomA);
        }
        catch (e) {
            reject(e);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdC50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdHMvY2hhdC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUNBQXdDO0FBRXhDLDJDQUFvQztBQUVwQyxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUM7QUFDN0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBRXRCLE1BQU0sV0FBVyxHQUF3QjtJQUN2QyxHQUFHLEVBQUUsUUFBUTtJQUNiLE1BQU0sRUFBRSxLQUFLO0lBQ2IsSUFBSSxFQUFFLFFBQVE7Q0FDZixDQUFDO0FBQ0YsTUFBTSxnQkFBZ0IsR0FBeUI7SUFDN0MsTUFBTSxFQUFFLEdBQUc7SUFDWCxrQkFBa0IsRUFBRSxDQUFDO0lBQ3JCLGFBQWEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFDbEQsZUFBZSxFQUFFLEVBQUU7Q0FDcEIsQ0FBQztBQUNGLE1BQU0sV0FBVyxHQUF3QjtJQUN2QyxHQUFHLEVBQUUsUUFBUTtJQUNiLE1BQU0sRUFBRSxLQUFLO0lBQ2IsSUFBSSxFQUFFLFFBQVE7Q0FDZixDQUFDO0FBQ0YsTUFBTSxnQkFBZ0IsR0FBeUI7SUFDN0MsTUFBTSxFQUFFLEdBQUc7SUFDWCxrQkFBa0IsRUFBRSxDQUFDO0lBQ3JCLGFBQWEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFDbEQsZUFBZSxFQUFFLEVBQUU7Q0FDcEIsQ0FBQztBQUNGLE1BQU0sT0FBTyxHQUEyQjtJQUN0QyxJQUFJLEVBQUUsV0FBVztJQUNqQixJQUFJLEVBQUUsR0FBRztJQUNULFVBQVUsRUFBRSxDQUFDO0lBQ2IsVUFBVSxFQUFFLENBQUM7SUFDYixTQUFTLEVBQUUsS0FBSztJQUNoQixnQkFBZ0IsRUFBRSxFQUFF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