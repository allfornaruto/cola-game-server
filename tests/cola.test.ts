import ColaClient from "../client/Cola";
import { Cola } from "../types/Cola";

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
const playerInfoExtraB: Cola.PlayerInfoExtra = {
  teamId: "2",
  customPlayerStatus: 0,
  customProfile: JSON.stringify({ hp: 120, mp: 60 }),
  matchAttributes: [],
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

beforeEach(async () => {
  // 测试用户A
  colaA = new ColaClient(init_A, options);
  colaA.listen("onHallAdd", async (event: Cola.EventRes.OnHallAdd) => {
    console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onHallAdd]", JSON.stringify(event));
  });

  // 测试用户B
  colaB = new ColaClient(init_B, options);
  // 离开房间
  colaB.listen("onKick", (event: Cola.EventRes.OnKick) => {
    console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onKick]", event);
  });
  colaB.listen("onHallAdd", async (event: Cola.EventRes.OnHallAdd) => {
    console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onHallAdd]", JSON.stringify(event));
  });
});

afterEach(async () => {
  await colaA.close();
  colaA = null;
  await colaB.close();
  colaB = null;
});

test("用户A创建房间room-1977，用户B进入该房间，房主（用户A）修改房间信息，用户B监听房间修改消息，用户B尝试修改房间信息，由于用户B不是房主，所以修改信息失败", () => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      let rid = "";
      // 用户A监听用户B进入房间事件
      colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
        try {
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
        } catch (e) {
          reject(e);
        }
      });
      // 用户B监听用户A创建房间事件
      colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
        try {
          console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
          rid = event.rid;
          const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
          console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
          expect(roomInfo.playerList.length).toBe(2);
          expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
          expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
        } catch (e) {
          reject(e);
        }
      });
      // 用户B监听房间信息变更事件
      colaB.listen("onChangeRoom", async (event: Cola.EventRes.OnChangeRoom) => {
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
        } catch (e) {
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
    } catch (e) {
      reject(e);
    }
  });
});

test("用户A创建房间room-1977，用户B进入该房间，用户A根据房间id查询房间数据", () => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      let rid = "";
      // 用户A监听用户B进入房间事件
      colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
        try {
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

          resolve();
        } catch (e) {
          reject(e);
        }
      });
      // 用户B监听用户A创建房间事件
      colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
        try {
          console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
          rid = event.rid;
          const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
          console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
          expect(roomInfo.playerList.length).toBe(2);
          expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
          expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
        } catch (e) {
          reject(e);
        }
      });

      // 用户A、B进入游戏大厅，用户A创建房间
      await colaA.enterHall();
      await colaB.enterHall();
      const room = await colaA.createRoom(myRoomA);
      rid = room.rid;
    } catch (e) {
      reject(e);
    }
  });
});

test("用户A创建房间room-1977，用户B进入该房间，用户A解散该房间，用户A/B监听房间解散事件", () => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      let rid = "";
      let listenNum = 0;
      // 用户A监听用户B进入房间事件
      colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
        try {
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
        } catch (e) {
          reject(e);
        }
      });
      // 用户B监听用户A创建房间事件
      colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
        try {
          console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
          rid = event.rid;
          const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
          console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
          expect(roomInfo.playerList.length).toBe(2);
          expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
          expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
        } catch (e) {
          reject(e);
        }
      });
      colaA.listen("onDismissRoom", async (event: Cola.EventRes.onDismissRoom) => {
        try {
          expect(event).toBe("dismissRoom");
          listenNum++;
          if (listenNum === 2) resolve();
        } catch (e) {
          reject(e);
        }
      });
      colaB.listen("onDismissRoom", async (event: Cola.EventRes.onDismissRoom) => {
        try {
          expect(event).toBe("dismissRoom");
          listenNum++;
          if (listenNum === 2) resolve();
        } catch (e) {
          reject(e);
        }
      });

      // 用户A、B进入游戏大厅，用户A创建房间
      await colaA.enterHall();
      await colaB.enterHall();
      const room = await colaA.createRoom(myRoomA);
      rid = room.rid;
    } catch (e) {
      reject(e);
    }
  });
});

test("用户A创建公共房间room-1977，并禁止其他用户进入房间，用户B尝试进入该房间，无法进入", () => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      let rid = "";
      // 用户B监听用户A创建房间事件
      colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
        try {
          console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
          rid = event.rid;

          // 在用户A禁止其他用户进入房间后，用户B尝试进入该房间
          setTimeout(async () => {
            try {
              const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
              console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
            } catch (e) {
              expect(e.code).toBe(500);
              expect(e.message).toBe("房主拒绝用户进入房间");
              expect(e.data).toBeNull();
              resolve();
            }
          }, 1000);
        } catch (e) {
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
    } catch (e) {
      reject(e);
    }
  });
});
