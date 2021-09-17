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
        colaA.log(`room.test.ts heartBeatTimeout`, event);
    });
    colaA.listen("onHallAdd", (event) => {
        colaA.log(`room.test.ts onHallAdd`, event);
    });
    // 测试用户B
    colaB = new Cola_1.default(init_B, options);
    // 心跳timeout
    colaB.listen("heartBeatTimeout", event => {
        colaB.log(`room.test.ts heartBeatTimeout`, event);
    });
    colaB.listen("onHallAdd", (event) => {
        colaB.log(`room.test.ts onHallAdd`, event);
    });
});
afterEach(async () => {
    await colaA.close();
    colaA = null;
    await colaB.close();
    colaB = null;
});
test("用户A创建房间room-1977，用户B进入该房间，用户A监听用户B进入/离开房间的事件", () => {
    return new Promise(async (resolve, reject) => {
        try {
            let rid = "";
            // 用户A监听用户B进入房间事件
            colaA.listen("onRoomAdd", async (event) => {
                try {
                    colaA.log("room.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A监听用户B进入/离开房间的事件 onRoomAdd", event);
                    expect(event.uid).toBe(playerInfoB.uid);
                    expect(event.gameId).toBe(playerInfoB.gameId);
                    expect(event.name).toBe(playerInfoB.name);
                    expect(event.teamId).toBe(playerInfoExtraB.teamId);
                    expect(event.customPlayerStatus).toBe(playerInfoExtraB.customPlayerStatus);
                    expect(event.customProfile).toBe(playerInfoExtraB.customProfile);
                    expect(event.matchAttributes).toStrictEqual(playerInfoExtraB.matchAttributes);
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户A监听用户B离开房间事件
            colaA.listen("onKick", (event) => {
                try {
                    colaA.log("room.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A监听用户B进入/离开房间的事件 onKick", event);
                    expect(event.uid).toBe(playerInfoB.uid);
                    expect(event.rid).toBe(rid);
                    setTimeout(() => resolve(), 1000);
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户B监听用户A创建房间事件
            colaB.listen("onRoomCreate", async (event) => {
                try {
                    colaB.log("room.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A监听用户B进入/离开房间的事件 onRoomCreate", event);
                    rid = event.rid;
                    const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
                    colaB.log(`room.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A监听用户B进入/离开房间的事件 onRoomCreate roomInfo=`, roomInfo);
                    expect(roomInfo.playerList.length).toBe(2);
                    expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
                    expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
                    await colaB.leaveRoom(rid);
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
test("用户A创建房间room-1977，用户B进入该房间，房主（用户A）修改房间信息，用户B监听房间修改消息，用户B尝试修改房间信息，由于用户B不是房主，所以修改信息失败", () => {
    return new Promise(async (resolve, reject) => {
        try {
            let rid = "";
            // 用户A监听用户B进入房间事件
            colaA.listen("onRoomAdd", async (event) => {
                try {
                    colaA.log("room.test.ts 用户A创建房间room-1977，用户B进入该房间，房主（用户A）修改房间信息，用户B监听房间修改消息，用户B尝试修改房间信息，由于用户B不是房主，所以修改信息失败 onRoomAdd", event);
                    expect(event.uid).toBe(playerInfoB.uid);
                    expect(event.gameId).toBe(playerInfoB.gameId);
                    expect(event.name).toBe(playerInfoB.name);
                    expect(event.teamId).toStrictEqual(playerInfoExtraB.teamId);
                    expect(event.customPlayerStatus).toBe(playerInfoExtraB.customPlayerStatus);
                    expect(event.customProfile).toBe(playerInfoExtraB.customProfile);
                    expect(event.matchAttributes).toStrictEqual(playerInfoExtraB.matchAttributes);
                    // 房主（用户A）修改房间信息
                    const changeRoomRes = await colaA.changeRoom({
                        name: "room-2077",
                        isPrivate: true,
                        customProperties: "1",
                        isForbidJoin: true,
                    });
                    expect(changeRoomRes.name).toBe("room-2077");
                    expect(changeRoomRes.isPrivate).toBeTruthy();
                    expect(changeRoomRes.customProperties).toBe("1");
                    expect(changeRoomRes.isForbidJoin).toBeTruthy();
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户B监听用户A创建房间事件
            colaB.listen("onRoomCreate", async (event) => {
                try {
                    colaB.log("room.test.ts 用户A创建房间room-1977，用户B进入该房间，房主（用户A）修改房间信息，用户B监听房间修改消息，用户B尝试修改房间信息，由于用户B不是房主，所以修改信息失败 onRoomCreate", event);
                    rid = event.rid;
                    const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
                    colaB.log("room.test.ts 用户A创建房间room-1977，用户B进入该房间，房主（用户A）修改房间信息，用户B监听房间修改消息，用户B尝试修改房间信息，由于用户B不是房主，所以修改信息失败 onRoomCreate roomInfo=", roomInfo);
                    expect(roomInfo.playerList.length).toBe(2);
                    expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
                    expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户B监听房间信息变更事件
            colaB.listen("onChangeRoom", async (event) => {
                // 非房主（用户B）修改房间信息
                try {
                    expect(event.name).toBe("room-2077");
                    expect(event.isPrivate).toBeTruthy();
                    expect(event.customProperties).toBe("1");
                    expect(event.isForbidJoin).toBeTruthy();
                    await colaB.changeRoom({
                        name: "room-2177",
                        isPrivate: false,
                        customProperties: "2",
                        isForbidJoin: false,
                    });
                }
                catch (e) {
                    console.log(e);
                    expect(e.code).toBe(500);
                    expect(e.message).toBe("非房主无法修改房间信息");
                    expect(e.data).toBeNull();
                    resolve();
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
test("用户A创建房间room-1977，用户B进入该房间，用户A根据房间id查询房间数据", () => {
    return new Promise(async (resolve, reject) => {
        try {
            let rid = "";
            // 用户A监听用户B进入房间事件
            colaA.listen("onRoomAdd", async (event) => {
                try {
                    colaA.log("room.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A根据房间id查询房间数据 onRoomAdd", event);
                    expect(event.uid).toBe(playerInfoB.uid);
                    expect(event.gameId).toBe(playerInfoB.gameId);
                    expect(event.name).toBe(playerInfoB.name);
                    expect(event.teamId).toStrictEqual(playerInfoExtraB.teamId);
                    expect(event.customPlayerStatus).toBe(playerInfoExtraB.customPlayerStatus);
                    expect(event.customProfile).toBe(playerInfoExtraB.customProfile);
                    expect(event.matchAttributes).toStrictEqual(playerInfoExtraB.matchAttributes);
                    // 用户A根据房间id查询房间数据
                    const roomInfo = await colaA.getRoomByRoomId({ rid });
                    expect(roomInfo.rid).toBe(rid);
                    expect(roomInfo.name).toBe(myRoomA.name);
                    expect(roomInfo.type).toBe(myRoomA.type);
                    expect(roomInfo.createType).toBe(0);
                    expect(roomInfo.isPrivate).toBeFalsy();
                    expect(roomInfo.customProperties).toBe("");
                    expect(roomInfo.maxPlayers).toBe(2);
                    expect(roomInfo.teamList.length).toBe(0);
                    expect(roomInfo.frameSyncState).toBe(0);
                    expect(roomInfo.gameId).toBe("dnf");
                    expect(roomInfo.isForbidJoin).toBeFalsy();
                    expect(roomInfo.owner).toBe(playerInfoA.uid);
                    expect(roomInfo.playerList.length).toBe(2);
                    roomInfo.playerList.forEach(item => {
                        if (item.uid === playerInfoA.uid) {
                            expect(item.name).toBe(playerInfoA.name);
                            expect(item.teamId).toStrictEqual(playerInfoExtraA.teamId);
                            expect(item.customPlayerStatus).toStrictEqual(playerInfoExtraA.customPlayerStatus);
                            expect(item.customProfile).toStrictEqual(playerInfoExtraA.customProfile);
                            expect(item.matchAttributes).toStrictEqual(playerInfoExtraA.matchAttributes);
                        }
                        if (item.uid === playerInfoB.uid) {
                            expect(item.name).toBe(playerInfoB.name);
                            expect(item.teamId).toStrictEqual(playerInfoExtraB.teamId);
                            expect(item.customPlayerStatus).toStrictEqual(playerInfoExtraB.customPlayerStatus);
                            expect(item.customProfile).toStrictEqual(playerInfoExtraB.customProfile);
                            expect(item.matchAttributes).toStrictEqual(playerInfoExtraB.matchAttributes);
                        }
                    });
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户B监听用户A创建房间事件
            colaB.listen("onRoomCreate", async (event) => {
                try {
                    colaB.log("room.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A根据房间id查询房间数据 onRoomCreate", event);
                    rid = event.rid;
                    const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
                    colaB.log("room.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A根据房间id查询房间数据 roomInfo=", roomInfo);
                    expect(roomInfo.playerList.length).toBe(2);
                    expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
                    expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户A、B进入游戏大厅，用户A创建房间
            await colaA.enterHall();
            await colaB.enterHall();
            const room = await colaA.createRoom(myRoomA);
            rid = room.rid;
        }
        catch (e) {
            reject(e);
        }
    });
});
test("用户A创建房间room-1977，用户B进入该房间，用户A解散该房间，用户A/B监听房间解散事件", () => {
    return new Promise(async (resolve, reject) => {
        try {
            let rid = "";
            let listenNum = 0;
            // 用户A监听用户B进入房间事件
            colaA.listen("onRoomAdd", async (event) => {
                try {
                    colaA.log("room.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A解散该房间，用户A/B监听房间解散事件 onRoomAdd", event);
                    expect(event.uid).toBe(playerInfoB.uid);
                    expect(event.gameId).toBe(playerInfoB.gameId);
                    expect(event.name).toBe(playerInfoB.name);
                    expect(event.teamId).toStrictEqual(playerInfoExtraB.teamId);
                    expect(event.customPlayerStatus).toBe(playerInfoExtraB.customPlayerStatus);
                    expect(event.customProfile).toBe(playerInfoExtraB.customProfile);
                    expect(event.matchAttributes).toStrictEqual(playerInfoExtraB.matchAttributes);
                    // 用户A解散该房间
                    colaA.dismissRoom(rid);
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户B监听用户A创建房间事件
            colaB.listen("onRoomCreate", async (event) => {
                try {
                    colaB.log("room.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A解散该房间，用户A/B监听房间解散事件 onRoomCreate", event);
                    rid = event.rid;
                    const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
                    colaB.log(`room.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A解散该房间，用户A/B监听房间解散事件 roomInfo=`, roomInfo);
                    expect(roomInfo.playerList.length).toBe(2);
                    expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
                    expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
                }
                catch (e) {
                    reject(e);
                }
            });
            colaA.listen("onDismissRoom", async (event) => {
                try {
                    expect(event).toBe("dismissRoom");
                    listenNum++;
                    if (listenNum === 2)
                        resolve();
                }
                catch (e) {
                    reject(e);
                }
            });
            colaB.listen("onDismissRoom", async (event) => {
                try {
                    expect(event).toBe("dismissRoom");
                    listenNum++;
                    if (listenNum === 2)
                        resolve();
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户A、B进入游戏大厅，用户A创建房间
            await colaA.enterHall();
            await colaB.enterHall();
            const room = await colaA.createRoom(myRoomA);
            rid = room.rid;
        }
        catch (e) {
            reject(e);
        }
    });
});
test("用户A创建公共房间room-1977，并禁止其他用户进入房间，用户B尝试进入该房间，无法进入", () => {
    return new Promise(async (resolve, reject) => {
        try {
            let rid = "";
            // 用户B监听用户A创建房间事件
            colaB.listen("onRoomCreate", async (event) => {
                try {
                    colaB.log("room.test.ts 用户A创建公共房间room-1977，并禁止其他用户进入房间，用户B尝试进入该房间，无法进入 onRoomCreate", event);
                    rid = event.rid;
                    // 在用户A禁止其他用户进入房间后，用户B尝试进入该房间
                    setTimeout(async () => {
                        try {
                            const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
                            colaB.log("room.test.ts 用户A创建公共房间room-1977，并禁止其他用户进入房间，用户B尝试进入该房间，无法进入 roomInfo=", roomInfo);
                        }
                        catch (e) {
                            expect(e.code).toBe(500);
                            expect(e.message).toBe("房主拒绝用户进入房间");
                            expect(e.data).toBeNull();
                            resolve();
                        }
                    }, 1000);
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户A、B进入游戏大厅，用户A创建房间
            await colaA.enterHall();
            await colaB.enterHall();
            await colaA.createRoom(myRoomA);
            await colaA.changeRoom({
                isForbidJoin: true,
            });
        }
        catch (e) {
            reject(e);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdHMvcm9vbS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUNBQXdDO0FBRXhDLDJDQUFvQztBQUVwQyxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUM7QUFDN0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBRXRCLE1BQU0sV0FBVyxHQUF3QjtJQUN2QyxHQUFHLEVBQUUsUUFBUTtJQUNiLE1BQU0sRUFBRSxLQUFLO0lBQ2IsSUFBSSxFQUFFLFFBQVE7Q0FDZixDQUFDO0FBQ0YsTUFBTSxnQkFBZ0IsR0FBeUI7SUFDN0MsTUFBTSxFQUFFLEdBQUc7SUFDWCxrQkFBa0IsRUFBRSxDQUFDO0lBQ3JCLGFBQWEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFDbEQsZUFBZSxFQUFFLEVBQUU7Q0FDcEIsQ0FBQztBQUNGLE1BQU0sV0FBVyxHQUF3QjtJQUN2QyxHQUFHLEVBQUUsUUFBUTtJQUNiLE1BQU0sRUFBRSxLQUFLO0lBQ2IsSUFBSSxFQUFFLFFBQVE7Q0FDZixDQUFDO0FBQ0YsTUFBTSxnQkFBZ0IsR0FBeUI7SUFDN0MsTUFBTSxFQUFFLEdBQUc7SUFDWCxrQkFBa0IsRUFBRSxDQUFDO0lBQ3JCLGFBQWEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFDbEQsZUFBZSxFQUFFLEVBQUU7Q0FDcEIsQ0FBQztBQUNGLE1BQU0sT0FBTyxHQUEyQjtJQUN0QyxJQUFJLEVBQUUsV0FBVztJQUNqQixJQUFJLEVBQUUsR0FBRztJQUNULFVBQVUsRUFBRSxDQUFDO0lBQ2IsVUFBVSxFQUFFLENBQUM7SUFDYixTQUFTLEVBQUUsS0FBSztJQUNoQixnQkFBZ0IsRUFBRSxFQUFF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