import ColaClient from "../client/Cola";
import { Cola } from "../types/Cola";
import TestUtils from "./testUtils";

const gateHost = "127.0.0.1";
const gatePort = 3100;

const playerInfoA: Cola.PlayerInitInfo = {
  uid: "111111",
  gameId: "dnf",
  name: "测试用户-A",
};
const playerInfoExtraA: Cola.PlayerInfoExtra = {
  teamId: "1",
  customPlayerStatus: 0,
  customProfile: JSON.stringify({ hp: 100, mp: 80 }),
  matchAttributes: [],
};
const playerInfoB: Cola.PlayerInitInfo = {
  uid: "222222",
  gameId: "dnf",
  name: "测试用户-B",
};
const myRoomA: Cola.Params.CreateRoom = {
  name: "room-1977",
  type: "0",
  createType: 0,
  maxPlayers: 2,
  isPrivate: false,
  customProperties: "",
  teamList: [],
  playerInfoExtra: playerInfoExtraA,
};

const init_A: Cola.Init = {
  gateHost,
  gatePort,
  gameId: "dnf",
  playerInitInfo: playerInfoA,
};
const init_B: Cola.Init = {
  gateHost,
  gatePort,
  gameId: "dnf",
  playerInitInfo: playerInfoB,
};
const options: Cola.ColaOptions = {
  debug: true,
};

let colaA: ColaClient = null;
let colaB: ColaClient = null;

const log = TestUtils.getLog({});

beforeEach(async () => {
  // 测试用户A
  colaA = new ColaClient(init_A, options);
  // 心跳timeout
  colaA.listen("heartBeatTimeout", event => {
    colaA.log(`hall.test.ts heartBeatTimeout`, event);
  });
  colaA.listen("onHallAdd", (event: Cola.EventRes.OnHallAdd) => {
    colaA.log(`hall.test.ts onHallAdd`, event);
  });

  // 测试用户B
  colaB = new ColaClient(init_B, options);
  // 心跳timeout
  colaB.listen("heartBeatTimeout", event => {
    colaB.log(`hall.test.ts heartBeatTimeout`, event);
  });
  colaB.listen("onHallAdd", (event: Cola.EventRes.OnHallAdd) => {
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
  return new Promise<void>(async (resolve, reject) => {
    try {
      // 用户B监听用户A创建房间事件
      colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
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
        } catch (e) {
          reject(e);
        }
      });

      // 用户A、B进入游戏大厅，用户A创建房间
      await colaA.enterHall();
      await colaB.enterHall();
      const roomInfo: Cola.Room = await colaA.createRoom(myRoomA);
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
    } catch (e) {
      reject(e);
    }
  });
});

test("用户A创建公开房间room-1977，用户B在大厅查询(不过滤私有房间)房间列表，可以查询到room-1977房间; 用户B在大厅查询(过滤私有房间)房间列表，可以查询到room-1977房间。用户A将其改为私有房间后，用户B再次查询(过滤私有房间)，无法查询到该房间; 用户B再次查询(不过滤私有房间)，可以查询到该房间", () => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      let rid = "";
      // 用户B监听用户A创建房间事件
      colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
        try {
          colaB.log(
            `hall.test.ts 用户A创建公开房间room-1977，用户B在大厅查询(不过滤私有房间)房间列表，可以查询到room-1977房间; 用户B在大厅查询(过滤私有房间)房间列表，可以查询到room-1977房间。用户A将其改为私有房间后，用户B再次查询(过滤私有房间)，无法查询到该房间; 用户B再次查询(不过滤私有房间)，可以查询到该房间 event:`,
            event
          );
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
        } catch (e) {
          reject(e);
        }
      });

      // 用户A、B进入游戏大厅，用户A创建房间
      await colaA.enterHall();
      await colaB.enterHall();
      await colaA.createRoom(myRoomA);
    } catch (e) {
      reject(e);
    }
  });
});

test("用户A创建私有房间room-1977，用户B在大厅查询(不过滤私有房间)房间列表，可以查询到room-1977房间; 用户B在大厅查询(过滤私有房间)房间列表，无法查询到room-1977房间。用户A将其改为公共房间后，用户B再次查询(不过滤私有房间)，可以查询到该房间", () => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      let rid = "";
      // 用户B监听用户A创建房间事件
      colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
        try {
          colaB.log(
            `hall.test.ts 用户A创建私有房间room-1977，用户B在大厅查询(不过滤私有房间)房间列表，可以查询到room-1977房间; 用户B在大厅查询(过滤私有房间)房间列表，无法查询到room-1977房间。用户A将其改为公共房间后，用户B再次查询(不过滤私有房间)，可以查询到该房间 event:`,
            event
          );
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
        } catch (e) {
          reject(e);
        }
      });

      // 用户A、B进入游戏大厅，用户A创建房间
      await colaA.enterHall();
      await colaB.enterHall();
      await colaA.createRoom(
        Object.assign(myRoomA, {
          isPrivate: true,
        })
      );
    } catch (e) {
      reject(e);
    }
  });
});
