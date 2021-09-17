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
        colaA.log(`frame.test.ts heartBeatTimeout`, event);
    });
    colaA.listen("onHallAdd", (event) => {
        colaA.log(`frame.test.ts onHallAdd`, event);
    });
    // 测试用户B
    colaB = new Cola_1.default(init_B, options);
    // 心跳timeout
    colaB.listen("heartBeatTimeout", event => {
        colaB.log(`frame.test.ts heartBeatTimeout`, event);
    });
    colaB.listen("onHallAdd", (event) => {
        colaB.log(`frame.test.ts onHallAdd`, event);
    });
});
afterEach(async () => {
    await colaA.close();
    colaA = null;
    await colaB.close();
    colaB = null;
});
test("用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步, 用户A与用户B监听房间帧同步开启事件，随后用户A停止帧同步，用户A与用户B监听房间帧同步停止事件", () => {
    return new Promise(async (resolve, reject) => {
        try {
            let rid = "";
            let flag_1 = false;
            let flag_2 = false;
            // 用户A监听用户B进入房间事件
            colaA.listen("onRoomAdd", async (event) => {
                try {
                    colaA.log("frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步, 用户A与用户B监听房间帧同步开启事件，随后用户A停止帧同步，用户A与用户B监听房间帧同步停止事件 onRoomAdd", event);
                    expect(event.uid).toBe(playerInfoB.uid);
                    expect(event.gameId).toBe(playerInfoB.gameId);
                    expect(event.name).toBe(playerInfoB.name);
                    expect(event.teamId).toStrictEqual(playerInfoExtraB.teamId);
                    expect(event.customPlayerStatus).toBe(playerInfoExtraB.customPlayerStatus);
                    expect(event.customProfile).toBe(playerInfoExtraB.customProfile);
                    expect(event.matchAttributes).toStrictEqual(playerInfoExtraB.matchAttributes);
                    // 用户A开启帧同步
                    const res = await colaA.startFrameSync();
                    expect(res.status).toBe(true);
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户B监听用户A创建房间事件
            colaB.listen("onRoomCreate", async (event) => {
                try {
                    colaB.log("frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步, 用户A与用户B监听房间帧同步开启事件，随后用户A停止帧同步，用户A与用户B监听房间帧同步停止事件 onRoomCreate", event);
                    rid = event.rid;
                    const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
                    console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
                    expect(roomInfo.playerList.length).toBe(2);
                    expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
                    expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户A监听房间帧同步开启，随后停止帧同步
            colaA.listen("onStartFrameSync", async (event) => {
                try {
                    colaA.log("frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步, 用户A与用户B监听房间帧同步开启事件，随后用户A停止帧同步，用户A与用户B监听房间帧同步停止事件 onStartFrameSync");
                    expect(event).toBe("startFrame");
                    const stopFrameRes = await colaA.stopFrameSync();
                    expect(stopFrameRes.status).toBeTruthy();
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户B监听房间帧同步开启
            colaB.listen("onStartFrameSync", async (event) => {
                try {
                    colaB.log("frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步, 用户A与用户B监听房间帧同步开启事件，随后用户A停止帧同步，用户A与用户B监听房间帧同步停止事件 onStartFrameSync");
                    expect(event).toBe("startFrame");
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户A监听房间帧同步停止
            colaA.listen("onStopFrameSync", async (event) => {
                try {
                    colaA.log("frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步, 用户A与用户B监听房间帧同步开启事件，随后用户A停止帧同步，用户A与用户B监听房间帧同步停止事件 onStopFrameSync");
                    expect(event).toBe("stopFrame");
                    flag_1 = true;
                    if (flag_1 && flag_2)
                        resolve();
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户B监听房间帧同步停止
            colaB.listen("onStopFrameSync", async (event) => {
                try {
                    colaB.log("frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步, 用户A与用户B监听房间帧同步开启事件，随后用户A停止帧同步，用户A与用户B监听房间帧同步停止事件 onStopFrameSync");
                    expect(event).toBe("stopFrame");
                    flag_2 = true;
                    if (flag_1 && flag_2)
                        resolve();
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
test("用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步并发送帧消息(进度0, 10, 20, ...100)，用户B监听帧消息", () => {
    return new Promise(async (resolve, reject) => {
        try {
            let rid = "";
            // 用户A监听用户B进入房间事件
            colaA.listen("onRoomAdd", async (event) => {
                try {
                    colaA.log("frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步并发送帧消息(进度0, 10, 20, ...100)，用户B监听帧消息 onRoomAdd", event);
                    expect(event.uid).toBe(playerInfoB.uid);
                    expect(event.gameId).toBe(playerInfoB.gameId);
                    expect(event.name).toBe(playerInfoB.name);
                    expect(event.teamId).toStrictEqual(playerInfoExtraB.teamId);
                    expect(event.customPlayerStatus).toBe(playerInfoExtraB.customPlayerStatus);
                    expect(event.customProfile).toBe(playerInfoExtraB.customProfile);
                    expect(event.matchAttributes).toStrictEqual(playerInfoExtraB.matchAttributes);
                    // 用户A开启帧同步并发送帧消息
                    let progress = 0;
                    const res = await colaA.startFrameSync();
                    expect(res.status).toBe(true);
                    let interval = null;
                    if (res.status) {
                        interval = setInterval(async () => {
                            const sendFrameRes = await colaA.sendFrame(JSON.stringify({ progress }));
                            colaA.log(`frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步并发送帧消息(进度0, 10, 20, ...100)，用户B监听帧消息 sendFrameRes=`, sendFrameRes);
                            progress += 10;
                            if (progress > 100) {
                                progress = 100;
                                clearInterval(interval);
                                interval = null;
                            }
                        }, 1000);
                    }
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户B监听用户A创建房间事件
            colaB.listen("onRoomCreate", async (event) => {
                try {
                    colaB.log("frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步并发送帧消息(进度0, 10, 20, ...100)，用户B监听帧消息 onRoomCreate", event);
                    rid = event.rid;
                    const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
                    console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
                    expect(roomInfo.playerList.length).toBe(2);
                    expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
                    expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户B监听用户A发送的帧消息
            colaB.listen("onRecvFrame", async (event) => {
                try {
                    colaB.log("frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步并发送帧消息(进度0, 10, 20, ...100)，用户B监听帧消息 onRecvFrame", event);
                    const { id, isReplay, items } = event;
                    expect(items).toBeDefined();
                    expect(isReplay).toBe(false);
                    expect(id).toBeDefined();
                    if (items.length > 0) {
                        const jsonData = JSON.parse(items[0].direction);
                        if (jsonData.progress === 100)
                            resolve();
                    }
                }
                catch (e) {
                    reject(e);
                }
            });
            colaB.listen("onDismissRoom", async (event) => {
                colaB.log("frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步并发送帧消息(进度0, 10, 20, ...100)，用户B监听帧消息 onDismissRoom");
                expect(event).toBe("dismissRoom");
                colaB.leaveRoom(rid);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWUudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3RzL2ZyYW1lLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBd0M7QUFFeEMsMkNBQW9DO0FBRXBDLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQztBQUM3QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFFdEIsTUFBTSxXQUFXLEdBQXdCO0lBQ3ZDLEdBQUcsRUFBRSxRQUFRO0lBQ2IsTUFBTSxFQUFFLEtBQUs7SUFDYixJQUFJLEVBQUUsUUFBUTtDQUNmLENBQUM7QUFDRixNQUFNLGdCQUFnQixHQUF5QjtJQUM3QyxNQUFNLEVBQUUsR0FBRztJQUNYLGtCQUFrQixFQUFFLENBQUM7SUFDckIsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUNsRCxlQUFlLEVBQUUsRUFBRTtDQUNwQixDQUFDO0FBQ0YsTUFBTSxXQUFXLEdBQXdCO0lBQ3ZDLEdBQUcsRUFBRSxRQUFRO0lBQ2IsTUFBTSxFQUFFLEtBQUs7SUFDYixJQUFJLEVBQUUsUUFBUTtDQUNmLENBQUM7QUFDRixNQUFNLGdCQUFnQixHQUF5QjtJQUM3QyxNQUFNLEVBQUUsR0FBRztJQUNYLGtCQUFrQixFQUFFLENBQUM7SUFDckIsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUNsRCxlQUFlLEVBQUUsRUFBRTtDQUNwQixDQUFDO0FBQ0YsTUFBTSxPQUFPLEdBQTJCO0lBQ3RDLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUksRUFBRSxHQUFHO0lBQ1QsVUFBVSxFQUFFLENBQUM7SUFDYixVQUFVLEVBQUUsQ0FBQztJQUNiLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLGdCQUFnQixFQUFFLEVB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