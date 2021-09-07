"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Cola_1 = require("./client/Cola");
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
beforeEach(async () => {
    // 测试用户A
    colaA = new Cola_1.default(init_A, options);
    // 错误处理
    colaA.listen("io-error", event => console.error(">>>>>>>>>>>>>>>ColaEvent[error]", event.message));
    // 关闭处理
    colaA.listen("close", event => console.error(">>>>>>>>>>>>>>>ColaEvent[close]", event.message));
    // 心跳timeout
    colaA.listen("heartbeat timeout", event => console.error(">>>>>>>>>>>>>>>ColaEvent[heartBeatTimeout]", event));
    colaA.listen("onHallAdd", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onHallAdd]", JSON.stringify(event));
    });
    // 测试用户B
    colaB = new Cola_1.default(init_B, options);
    // 错误处理
    colaB.listen("io-error", event => console.error(">>>>>>>>>>>>>>>ColaEvent[error]", event.message));
    // 关闭处理
    colaB.listen("close", event => console.error(">>>>>>>>>>>>>>>ColaEvent[close]", event.message));
    // 心跳timeout
    colaB.listen("heartbeat timeout", event => console.error(">>>>>>>>>>>>>>>ColaEvent[heartBeatTimeout]", event));
    // 离开房间
    colaB.listen("onKick", (event) => {
        console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onKick]", event);
    });
    colaB.listen("onHallAdd", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onHallAdd]", JSON.stringify(event));
    });
});
afterEach(async () => {
    await colaA.close();
    colaA = null;
    await colaB.close();
    colaB = null;
    // const channelService = server.get('channelService');
    // channelService.destroyChannel(myRoomName);
});
test("用户A创建房间room-1977，用户B在大厅监听该房间的创建", async (done) => {
    // 用户B监听用户A创建房间事件
    colaB.listen("onRoomCreate", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
        expect(event.gameId).toBe(playerInfoA.gameId);
        expect(event.name).toBe(myRoomA.name);
        expect(event.type).toBe(myRoomA.type);
        expect(event.createType).toBe(myRoomA.createType);
        expect(event.maxPlayers).toBe(myRoomA.maxPlayers);
        expect(event.owner).toBe(playerInfoA.uid);
        expect(event.isPrivate).toBe(myRoomA.isPrivate);
        expect(event.customProperties).toBe(myRoomA.customProperties);
        expect(event.teamList).toStrictEqual(myRoomA.teamList);
        expect(event.maxPlayers).toBe(myRoomA.maxPlayers);
        expect(event.playerList[0].uid).toBe(playerInfoA.uid);
        expect(event.playerList[0].gameId).toBe(playerInfoA.gameId);
        expect(event.playerList[0].name).toBe(playerInfoA.name);
        setTimeout(() => done(), 5000);
    });
    // 用户A、B进入游戏大厅，用户A创建房间
    await colaA.enterHall();
    await colaB.enterHall();
    const roomInfo = await colaA.createRoom(myRoomA);
    console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
    expect(roomInfo.gameId).toBe(playerInfoA.gameId);
    expect(roomInfo.name).toBe(myRoomA.name);
    expect(roomInfo.type).toBe(myRoomA.type);
    expect(roomInfo.createType).toBe(myRoomA.createType);
    expect(roomInfo.maxPlayers).toBe(myRoomA.maxPlayers);
    expect(roomInfo.owner).toBe(playerInfoA.uid);
    expect(roomInfo.isPrivate).toBe(myRoomA.isPrivate);
    expect(roomInfo.customProperties).toBe(myRoomA.customProperties);
    expect(roomInfo.teamList).toStrictEqual(myRoomA.teamList);
    expect(roomInfo.maxPlayers).toBe(myRoomA.maxPlayers);
    expect(roomInfo.playerList[0].uid).toBe(playerInfoA.uid);
    expect(roomInfo.playerList[0].gameId).toBe(playerInfoA.gameId);
    expect(roomInfo.playerList[0].name).toBe(playerInfoA.name);
});
test("用户A创建房间room-1977，用户B进入该房间，用户A监听用户B进入/离开房间的事件", async (done) => {
    let rid = "";
    // 用户A监听用户B进入房间事件
    colaA.listen("onRoomAdd", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onRoomAdd]", JSON.stringify(event));
        expect(event.uid).toBe(playerInfoB.uid);
        expect(event.gameId).toBe(playerInfoB.gameId);
        expect(event.name).toBe(playerInfoB.name);
        expect(event.teamId).toBe(playerInfoExtraB.teamId);
        expect(event.customPlayerStatus).toBe(playerInfoExtraB.customPlayerStatus);
        expect(event.customProfile).toBe(playerInfoExtraB.customProfile);
        expect(event.matchAttributes).toStrictEqual(playerInfoExtraB.matchAttributes);
    });
    // 用户A监听用户B离开房间事件
    colaA.listen("onKick", (event) => {
        console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onKick]", event);
        expect(event.uid).toBe(playerInfoB.uid);
        expect(event.rid).toBe(rid);
        setTimeout(() => done(), 1000);
    });
    // 用户B监听用户A创建房间事件
    colaB.listen("onRoomCreate", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
        rid = event.rid;
        const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
        console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
        expect(roomInfo.playerList.length).toBe(2);
        expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
        expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
        await colaB.leaveRoom(rid);
    });
    // 用户A、B进入游戏大厅，用户A创建房间
    await colaA.enterHall();
    await colaB.enterHall();
    await colaA.createRoom(myRoomA);
});
test("用户A创建房间room-1977，用户B进入该房间，用户A发送消息，用户B监听消息", async (done) => {
    let rid = "";
    // 用户A监听用户B进入房间事件
    colaA.listen("onRoomAdd", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onRoomAdd]", JSON.stringify(event));
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
    });
    // 用户B监听用户A创建房间事件
    colaB.listen("onRoomCreate", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
        rid = event.rid;
        const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
        console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
        expect(roomInfo.playerList.length).toBe(2);
        expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
        expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
    });
    // 用户B监听用户A发送的消息
    colaB.listen("onChat", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onChat]", JSON.stringify(event));
        expect(event.msg).toBe("Hello colaB");
        expect(event.from).toBe(playerInfoA.uid);
        expect(event.target).toStrictEqual([playerInfoB.uid]);
        setTimeout(() => done(), 1000);
    });
    // 用户A、B进入游戏大厅，用户A创建房间
    await colaA.enterHall();
    await colaB.enterHall();
    await colaA.createRoom(myRoomA);
});
test("用户A创建房间room-1977，用户B进入该房间，房主（用户A）修改房间信息，用户B监听房间修改消息，用户B尝试修改房间信息，由于用户B不是房主，所以修改信息失败", async () => {
    let rid = "";
    // 用户A监听用户B进入房间事件
    colaA.listen("onRoomAdd", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onRoomAdd]", JSON.stringify(event));
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
    });
    // 用户B监听用户A创建房间事件
    colaB.listen("onRoomCreate", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
        rid = event.rid;
        const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
        console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
        expect(roomInfo.playerList.length).toBe(2);
        expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
        expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
    });
    // 用户B监听房间信息变更事件
    colaB.listen("onChangeRoom", async (event) => {
        expect(event.name).toBe("room-2077");
        expect(event.isPrivate).toBeTruthy();
        expect(event.customProperties).toBe("1");
        expect(event.isForbidJoin).toBeTruthy();
        // 非房主（用户B）修改房间信息
        try {
            await colaA.changeRoom({
                name: "room-2177",
                isPrivate: false,
                customProperties: "2",
                isForbidJoin: false,
            });
        }
        catch (e) {
            expect(e.code).toBe(500);
            expect(e.message).toBe("非房主无法修改房间信息");
            expect(e.data).toBeNull();
        }
    });
    // 用户A、B进入游戏大厅，用户A创建房间
    await colaA.enterHall();
    await colaB.enterHall();
    await colaA.createRoom(myRoomA);
});
// test("用户A创建公开房间room-1977，用户B在大厅查询房间列表，可以查询到room-1977房间。用户A将其改为私有房间后，用户B再次查询，无法查询到该房间", async () => {
//   let rid = "";
//   // 用户B监听用户A创建房间事件
//   colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
//     console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
//     rid = event.rid;
//     const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
//     console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
//     expect(roomInfo.playerList.length).toBe(2);
//     expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
//     expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
//     // 房间列表接口未写
//   });
//   // 用户A、B进入游戏大厅，用户A创建房间
//   await colaA.enterHall();
//   await colaB.enterHall();
//   await colaA.createRoom(myRoomA);
// });
// test("用户A创建私有房间room-1977，用户B在大厅查询房间列表，无法查询到room-1977房间。用户A将其改为公共房间后，用户B再次查询，可以查询到该房间", async () => {});
test("用户A创建公共房间room-1977，并禁止其他用户进入房间，用户B尝试进入该房间，无法进入", async (done) => {
    let rid = "";
    // 用户B监听用户A创建房间事件
    colaB.listen("onRoomCreate", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
        rid = event.rid;
        // 在用户A禁止其他用户进入房间后，用户B尝试进入该房间
        setTimeout(async () => {
            try {
                const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
                console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
            }
            catch (e) {
                expect(e.code).toBe(500);
                expect(e.message).toBe("房主拒绝用户进入房间");
                expect(e.data).toBeNull();
                done();
            }
        }, 1000);
    });
    // 用户A、B进入游戏大厅，用户A创建房间
    await colaA.enterHall();
    await colaB.enterHall();
    await colaA.createRoom(myRoomA);
    await colaA.changeRoom({
        isForbidJoin: true,
    });
});
test("用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步, 用户A与用户B监听房间帧同步开启事件，随后用户A停止帧同步，用户A与用户B监听房间帧同步停止事件", async (done) => {
    let rid = "";
    let flag_1 = false;
    let flag_2 = false;
    // 用户A监听用户B进入房间事件
    colaA.listen("onRoomAdd", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onRoomAdd]", JSON.stringify(event));
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
    });
    // 用户B监听用户A创建房间事件
    colaB.listen("onRoomCreate", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
        rid = event.rid;
        const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
        console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
        expect(roomInfo.playerList.length).toBe(2);
        expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
        expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
    });
    // 用户A监听房间帧同步开启，随后停止帧同步
    colaA.listen("onStartFrameSync", async (event) => {
        expect(event).toBe("startFrame");
        const stopFrameRes = await colaA.stopFrameSync();
        expect(stopFrameRes.status).toBeTruthy();
    });
    // 用户B监听房间帧同步开启
    colaB.listen("onStartFrameSync", async (event) => {
        expect(event).toBe("startFrame");
    });
    // 用户A监听房间帧同步停止
    colaA.listen("onStopFrameSync", async (event) => {
        expect(event).toBe("stopFrame");
        flag_1 = true;
        if (flag_1 && flag_2)
            done();
    });
    // 用户B监听房间帧同步停止
    colaB.listen("onStopFrameSync", async (event) => {
        expect(event).toBe("stopFrame");
        flag_2 = true;
        if (flag_1 && flag_2)
            done();
    });
    // 用户A、B进入游戏大厅，用户A创建房间
    await colaA.enterHall();
    await colaB.enterHall();
    await colaA.createRoom(myRoomA);
});
test("用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步并发送帧消息(进度0, 10, 20, ...100)，用户B监听帧消息", async (done) => {
    let rid = "";
    // 用户A监听用户B进入房间事件
    colaA.listen("onRoomAdd", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onRoomAdd]", JSON.stringify(event));
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
                console.log(`sendFrameRes = ${JSON.stringify(sendFrameRes)}`);
                progress += 10;
                if (progress > 100) {
                    progress = 100;
                    clearInterval(interval);
                    interval = null;
                }
            }, 1000);
        }
    });
    // 用户B监听用户A创建房间事件
    colaB.listen("onRoomCreate", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
        rid = event.rid;
        const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
        console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
        expect(roomInfo.playerList.length).toBe(2);
        expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
        expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
    });
    // 用户B监听用户A发送的帧消息
    colaB.listen("onRecvFrame", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onRecvFrame]", JSON.stringify(event));
        console.log(`event=${JSON.stringify(event)}`);
        const { id, isReplay, items } = event;
        expect(items).toBeDefined();
        expect(isReplay).toBe(false);
        expect(id).toBeDefined();
        if (items.length > 0) {
            const jsonData = JSON.parse(items[0].direction);
            if (jsonData.progress === 100)
                done();
        }
    });
    // 用户A、B进入游戏大厅，用户A创建房间
    await colaA.enterHall();
    await colaB.enterHall();
    await colaA.createRoom(myRoomA);
});
test("用户A创建房间room-1977，用户B进入该房间，用户A根据房间id查询房间数据", async (done) => {
    let rid = "";
    // 用户A监听用户B进入房间事件
    colaA.listen("onRoomAdd", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onRoomAdd]", JSON.stringify(event));
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
        done();
    });
    // 用户B监听用户A创建房间事件
    colaB.listen("onRoomCreate", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
        rid = event.rid;
        const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
        console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
        expect(roomInfo.playerList.length).toBe(2);
        expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
        expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
    });
    // 用户A、B进入游戏大厅，用户A创建房间
    await colaA.enterHall();
    await colaB.enterHall();
    const room = await colaA.createRoom(myRoomA);
    rid = room.rid;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sYS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdHMvY29sYS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0NBQXVDO0FBR3ZDLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQztBQUM3QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFFdEIsTUFBTSxXQUFXLEdBQXdCO0lBQ3ZDLEdBQUcsRUFBRSxRQUFRO0lBQ2IsTUFBTSxFQUFFLEtBQUs7SUFDYixJQUFJLEVBQUUsUUFBUTtDQUNmLENBQUM7QUFDRixNQUFNLGdCQUFnQixHQUF5QjtJQUM3QyxNQUFNLEVBQUUsR0FBRztJQUNYLGtCQUFrQixFQUFFLENBQUM7SUFDckIsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUNsRCxlQUFlLEVBQUUsRUFBRTtDQUNwQixDQUFDO0FBQ0YsTUFBTSxXQUFXLEdBQXdCO0lBQ3ZDLEdBQUcsRUFBRSxRQUFRO0lBQ2IsTUFBTSxFQUFFLEtBQUs7SUFDYixJQUFJLEVBQUUsUUFBUTtDQUNmLENBQUM7QUFDRixNQUFNLGdCQUFnQixHQUF5QjtJQUM3QyxNQUFNLEVBQUUsR0FBRztJQUNYLGtCQUFrQixFQUFFLENBQUM7SUFDckIsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUNsRCxlQUFlLEVBQUUsRUFBRTtDQUNwQixDQUFDO0FBQ0YsTUFBTSxPQUFPLEdBQTJCO0lBQ3RDLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUksRUFBRSxHQUFHO0lBQ1QsVUFBVSxFQUFFLENBQUM7SUFDYixVQUFVLEVBQUUsQ0FBQztJQUNiLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLGdCQUFnQixFQUFFLEVBQUU7SUFDcEIsUUFBUSxF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