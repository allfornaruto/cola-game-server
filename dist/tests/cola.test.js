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
test("用户A创建房间room-1977，用户B进入该房间，用户A解散该房间，用户A/B监听房间解散事件", async (done) => {
    let rid = "";
    let listenNum = 0;
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
        // 用户A解散该房间
        colaA.dismissRoom(rid);
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
    colaA.listen("onDismissRoom", async (event) => {
        expect(event).toBe("dismissRoom");
        listenNum++;
        if (listenNum === 2)
            done();
    });
    colaB.listen("onDismissRoom", async (event) => {
        expect(event).toBe("dismissRoom");
        listenNum++;
        if (listenNum === 2)
            done();
    });
    // 用户A、B进入游戏大厅，用户A创建房间
    await colaA.enterHall();
    await colaB.enterHall();
    const room = await colaA.createRoom(myRoomA);
    rid = room.rid;
});
test("用户A创建公开房间room-1977，用户B在大厅查询(不过滤私有房间)房间列表，可以查询到room-1977房间。用户A将其改为私有房间后，用户B再次查询(不过滤私有房间)，无法查询到该房间", async (done) => {
    let rid = "";
    // 用户B监听用户A创建房间事件
    colaB.listen("onRoomCreate", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
        rid = event.rid;
        const roomList = await colaB.getRoomList({
            gameId: "dnf",
            roomType: "0",
            pageSize: 1,
            pageNo: 1,
            filterPrivate: true,
        });
        expect(roomList.length).toBe(1);
        expect(roomList[0].rid).toBe(rid);
        expect(roomList[0].name).toBe("room-1977");
        expect(roomList[0].isPrivate).toBeFalsy();
        const newRoomInfo = await colaA.changeRoom({ isPrivate: true });
        expect(newRoomInfo.rid).toBe(rid);
        expect(newRoomInfo.name).toBe("room-1977");
        expect(newRoomInfo.isPrivate).toBeTruthy();
        const roomList2 = await colaB.getRoomList({
            gameId: "dnf",
            roomType: "0",
            pageSize: 1,
            pageNo: 1,
            filterPrivate: true,
        });
        expect(roomList2.length).toBe(0);
        done();
    });
    // 用户A、B进入游戏大厅，用户A创建房间
    await colaA.enterHall();
    await colaB.enterHall();
    await colaA.createRoom(myRoomA);
});
test("用户A创建私有房间room-1977，用户B在大厅查询(不过滤私有房间)房间列表，无法查询到room-1977房间。用户A将其改为公共房间后，用户B再次查询(不过滤私有房间)，可以查询到该房间", async (done) => {
    let rid = "";
    // 用户B监听用户A创建房间事件
    colaB.listen("onRoomCreate", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
        rid = event.rid;
        const roomList = await colaB.getRoomList({
            gameId: "dnf",
            roomType: "0",
            pageSize: 1,
            pageNo: 1,
            filterPrivate: true,
        });
        expect(roomList.length).toBe(0);
        const newRoomInfo = await colaA.changeRoom({ isPrivate: false });
        expect(newRoomInfo.rid).toBe(rid);
        expect(newRoomInfo.name).toBe("room-1977");
        expect(newRoomInfo.isPrivate).toBeFalsy();
        const roomList2 = await colaB.getRoomList({
            gameId: "dnf",
            roomType: "0",
            pageSize: 1,
            pageNo: 1,
            filterPrivate: true,
        });
        expect(roomList2.length).toBe(1);
        expect(roomList2[0].rid).toBe(rid);
        expect(roomList2[0].name).toBe("room-1977");
        expect(roomList2[0].isPrivate).toBeFalsy();
        done();
    });
    // 用户A、B进入游戏大厅，用户A创建房间
    await colaA.enterHall();
    await colaB.enterHall();
    await colaA.createRoom(Object.assign(myRoomA, { isPrivate: true }));
});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sYS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdHMvY29sYS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0NBQXVDO0FBR3ZDLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQztBQUM3QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFFdEIsTUFBTSxXQUFXLEdBQXdCO0lBQ3ZDLEdBQUcsRUFBRSxRQUFRO0lBQ2IsTUFBTSxFQUFFLEtBQUs7SUFDYixJQUFJLEVBQUUsUUFBUTtDQUNmLENBQUM7QUFDRixNQUFNLGdCQUFnQixHQUF5QjtJQUM3QyxNQUFNLEVBQUUsR0FBRztJQUNYLGtCQUFrQixFQUFFLENBQUM7SUFDckIsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUNsRCxlQUFlLEVBQUUsRUFBRTtDQUNwQixDQUFDO0FBQ0YsTUFBTSxXQUFXLEdBQXdCO0lBQ3ZDLEdBQUcsRUFBRSxRQUFRO0lBQ2IsTUFBTSxFQUFFLEtBQUs7SUFDYixJQUFJLEVBQUUsUUFBUTtDQUNmLENBQUM7QUFDRixNQUFNLGdCQUFnQixHQUF5QjtJQUM3QyxNQUFNLEVBQUUsR0FBRztJQUNYLGtCQUFrQixFQUFFLENBQUM7SUFDckIsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUNsRCxlQUFlLEVBQUUsRUFBRTtDQUNwQixDQUFDO0FBQ0YsTUFBTSxPQUFPLEdBQTJCO0lBQ3RDLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUksRUFBRSxHQUFHO0lBQ1QsVUFBVSxFQUFFLENBQUM7SUFDYixVQUFVLEVBQUUsQ0FBQztJQUNiLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLGdCQUFnQixFQUFFLEVBQUU7SUFDcEIsUUFBUSxF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