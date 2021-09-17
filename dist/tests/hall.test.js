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
        colaA.log(`hall.test.ts heartBeatTimeout`, event);
    });
    colaA.listen("onHallAdd", (event) => {
        colaA.log(`hall.test.ts onHallAdd`, event);
    });
    // 测试用户B
    colaB = new Cola_1.default(init_B, options);
    // 心跳timeout
    colaB.listen("heartBeatTimeout", event => {
        colaB.log(`hall.test.ts heartBeatTimeout`, event);
    });
    colaB.listen("onHallAdd", (event) => {
        colaB.log(`hall.test.ts onHallAdd`, event);
    });
});
afterEach(async () => {
    await colaA.close();
    colaA = null;
    await colaB.close();
    colaB = null;
});
test("用户A创建房间room-1977，用户B在大厅监听该房间的创建", () => {
    return new Promise(async (resolve, reject) => {
        try {
            // 用户B监听用户A创建房间事件
            colaB.listen("onRoomCreate", async (event) => {
                try {
                    colaB.log("hall.test.ts 用户A创建房间room-1977，用户B在大厅监听该房间的创建 onRoomCreate", event);
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
                    setTimeout(() => resolve(), 5000);
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户A、B进入游戏大厅，用户A创建房间
            await colaA.enterHall();
            await colaB.enterHall();
            const roomInfo = await colaA.createRoom(myRoomA);
            log(`hall.test.ts 用户A创建房间room-1977，用户B在大厅监听该房间的创建 roomInfo:`, roomInfo);
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
        }
        catch (e) {
            reject(e);
        }
    });
});
test("用户A创建公开房间room-1977，用户B在大厅查询(不过滤私有房间)房间列表，可以查询到room-1977房间; 用户B在大厅查询(过滤私有房间)房间列表，可以查询到room-1977房间。用户A将其改为私有房间后，用户B再次查询(过滤私有房间)，无法查询到该房间; 用户B再次查询(不过滤私有房间)，可以查询到该房间", () => {
    return new Promise(async (resolve, reject) => {
        try {
            let rid = "";
            // 用户B监听用户A创建房间事件
            colaB.listen("onRoomCreate", async (event) => {
                try {
                    colaB.log(`hall.test.ts 用户A创建公开房间room-1977，用户B在大厅查询(不过滤私有房间)房间列表，可以查询到room-1977房间; 用户B在大厅查询(过滤私有房间)房间列表，可以查询到room-1977房间。用户A将其改为私有房间后，用户B再次查询(过滤私有房间)，无法查询到该房间; 用户B再次查询(不过滤私有房间)，可以查询到该房间 event:`, event);
                    rid = event.rid;
                    const roomList1 = await colaB.getRoomList({
                        gameId: "dnf",
                        roomType: "0",
                        pageNo: 1,
                        pageSize: 10,
                        filterPrivate: false,
                    });
                    console.log(roomList1);
                    expect(roomList1).toBeTruthy();
                    expect(roomList1.length).toBe(1);
                    expect(roomList1[0].rid).toBe(rid);
                    expect(roomList1[0].name).toBe("room-1977");
                    expect(roomList1[0].isPrivate).toBeFalsy();
                    const roomList2 = await colaB.getRoomList({
                        gameId: "dnf",
                        roomType: "0",
                        pageNo: 1,
                        pageSize: 10,
                        filterPrivate: true,
                    });
                    expect(roomList2.length).toBe(1);
                    expect(roomList2[0].rid).toBe(rid);
                    expect(roomList2[0].name).toBe("room-1977");
                    expect(roomList2[0].isPrivate).toBeFalsy();
                    const newRoomInfo = await colaA.changeRoom({ isPrivate: true });
                    expect(newRoomInfo.rid).toBe(rid);
                    expect(newRoomInfo.name).toBe("room-1977");
                    expect(newRoomInfo.isPrivate).toBeTruthy();
                    const roomList3 = await colaB.getRoomList({
                        gameId: "dnf",
                        roomType: "0",
                        pageNo: 1,
                        pageSize: 10,
                        filterPrivate: true,
                    });
                    expect(roomList3.length).toBe(0);
                    const roomList4 = await colaB.getRoomList({
                        gameId: "dnf",
                        roomType: "0",
                        pageNo: 1,
                        pageSize: 10,
                        filterPrivate: false,
                    });
                    expect(roomList4.length).toBe(1);
                    expect(roomList4[0].rid).toBe(rid);
                    expect(roomList4[0].name).toBe("room-1977");
                    expect(roomList4[0].isPrivate).toBeTruthy();
                    const roomList5 = await colaB.getRoomList({
                        gameId: "dnf",
                        roomType: "0",
                        pageNo: 1,
                        pageSize: 10,
                    });
                    expect(roomList5.length).toBe(1);
                    expect(roomList5[0].rid).toBe(rid);
                    expect(roomList5[0].name).toBe("room-1977");
                    expect(roomList5[0].isPrivate).toBeTruthy();
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
test("用户A创建私有房间room-1977，用户B在大厅查询(不过滤私有房间)房间列表，可以查询到room-1977房间; 用户B在大厅查询(过滤私有房间)房间列表，无法查询到room-1977房间。用户A将其改为公共房间后，用户B再次查询(不过滤私有房间)，可以查询到该房间", () => {
    return new Promise(async (resolve, reject) => {
        try {
            let rid = "";
            // 用户B监听用户A创建房间事件
            colaB.listen("onRoomCreate", async (event) => {
                try {
                    colaB.log(`hall.test.ts 用户A创建私有房间room-1977，用户B在大厅查询(不过滤私有房间)房间列表，可以查询到room-1977房间; 用户B在大厅查询(过滤私有房间)房间列表，无法查询到room-1977房间。用户A将其改为公共房间后，用户B再次查询(不过滤私有房间)，可以查询到该房间 event:`, event);
                    rid = event.rid;
                    const roomList1 = await colaB.getRoomList({
                        gameId: "dnf",
                        roomType: "0",
                        pageSize: 1,
                        pageNo: 1,
                        filterPrivate: false,
                    });
                    expect(roomList1.length).toBe(1);
                    expect(roomList1[0].name).toBe("room-1977");
                    expect(roomList1[0].isPrivate).toBeTruthy();
                    const roomList2 = await colaB.getRoomList({
                        gameId: "dnf",
                        roomType: "0",
                        pageSize: 1,
                        pageNo: 1,
                        filterPrivate: true,
                    });
                    expect(roomList2.length).toBe(0);
                    const newRoomInfo = await colaA.changeRoom({ isPrivate: false });
                    expect(newRoomInfo.rid).toBe(rid);
                    expect(newRoomInfo.name).toBe("room-1977");
                    expect(newRoomInfo.isPrivate).toBeFalsy();
                    const roomList3 = await colaB.getRoomList({
                        gameId: "dnf",
                        roomType: "0",
                        pageSize: 1,
                        pageNo: 1,
                        filterPrivate: true,
                    });
                    expect(roomList3.length).toBe(1);
                    expect(roomList3[0].rid).toBe(rid);
                    expect(roomList3[0].name).toBe("room-1977");
                    expect(roomList3[0].isPrivate).toBeFalsy();
                    const roomList4 = await colaB.getRoomList({
                        gameId: "dnf",
                        roomType: "0",
                        pageSize: 1,
                        pageNo: 1,
                        filterPrivate: false,
                    });
                    expect(roomList4.length).toBe(1);
                    expect(roomList4[0].rid).toBe(rid);
                    expect(roomList4[0].name).toBe("room-1977");
                    expect(roomList4[0].isPrivate).toBeFalsy();
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户A、B进入游戏大厅，用户A创建房间
            await colaA.enterHall();
            await colaB.enterHall();
            await colaA.createRoom(Object.assign(myRoomA, {
                isPrivate: true,
            }));
        }
        catch (e) {
            reject(e);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFsbC50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdHMvaGFsbC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUNBQXdDO0FBRXhDLDJDQUFvQztBQUVwQyxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUM7QUFDN0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBRXRCLE1BQU0sV0FBVyxHQUF3QjtJQUN2QyxHQUFHLEVBQUUsUUFBUTtJQUNiLE1BQU0sRUFBRSxLQUFLO0lBQ2IsSUFBSSxFQUFFLFFBQVE7Q0FDZixDQUFDO0FBQ0YsTUFBTSxnQkFBZ0IsR0FBeUI7SUFDN0MsTUFBTSxFQUFFLEdBQUc7SUFDWCxrQkFBa0IsRUFBRSxDQUFDO0lBQ3JCLGFBQWEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFDbEQsZUFBZSxFQUFFLEVBQUU7Q0FDcEIsQ0FBQztBQUNGLE1BQU0sV0FBVyxHQUF3QjtJQUN2QyxHQUFHLEVBQUUsUUFBUTtJQUNiLE1BQU0sRUFBRSxLQUFLO0lBQ2IsSUFBSSxFQUFFLFFBQVE7Q0FDZixDQUFDO0FBQ0YsTUFBTSxPQUFPLEdBQTJCO0lBQ3RDLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUksRUFBRSxHQUFHO0lBQ1QsVUFBVSxFQUFFLENBQUM7SUFDYixVQUFVLEVBQUUsQ0FBQztJQUNiLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLGdCQUFnQixFQUFFLEVBQUU7SUFDcEIsUUFBUSxFQUFFLEVBQUU7SUFDWixlQUFlLEVBQUUsZ0JBQWdCO0NBQ2xDLENBQUM7QUFFRixNQUFNLE1BQU0sR0FBYztJQUN4QixRQUFRO0lBQ1IsUUFBUTtJQUNSLE1BQU0sRUFBRSxLQUFLO0lBQ2IsY0FBYyxFQUFFLFdBQVc7Q0FDNUIsQ0FBQztBQUNGLE1BQU0sTUFBTSxHQUFjO0lBQ3hCLFFBQVE7SUFDUixR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