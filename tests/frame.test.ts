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

const log = TestUtils.getLog({});

beforeEach(async () => {
  // 测试用户A
  colaA = new ColaClient(init_A, options);
  // 心跳timeout
  colaA.listen("heartBeatTimeout", event => {
    colaA.log(`frame.test.ts heartBeatTimeout`, event);
  });
  colaA.listen("onHallAdd", (event: Cola.EventRes.OnHallAdd) => {
    colaA.log(`frame.test.ts onHallAdd`, event);
  });

  // 测试用户B
  colaB = new ColaClient(init_B, options);
  // 心跳timeout
  colaB.listen("heartBeatTimeout", event => {
    colaB.log(`frame.test.ts heartBeatTimeout`, event);
  });
  colaB.listen("onHallAdd", (event: Cola.EventRes.OnHallAdd) => {
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
  return new Promise<void>(async (resolve, reject) => {
    try {
      let rid = "";
      let flag_1 = false;
      let flag_2 = false;
      // 用户A监听用户B进入房间事件
      colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
        try {
          colaA.log(
            "frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步, 用户A与用户B监听房间帧同步开启事件，随后用户A停止帧同步，用户A与用户B监听房间帧同步停止事件 onRoomAdd",
            event
          );
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
        } catch (e) {
          reject(e);
        }
      });
      // 用户B监听用户A创建房间事件
      colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
        try {
          colaB.log(
            "frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步, 用户A与用户B监听房间帧同步开启事件，随后用户A停止帧同步，用户A与用户B监听房间帧同步停止事件 onRoomCreate",
            event
          );
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
      // 用户A监听房间帧同步开启，随后停止帧同步
      colaA.listen("onStartFrameSync", async (event: Cola.EventRes.onStartFrameSync) => {
        try {
          colaA.log(
            "frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步, 用户A与用户B监听房间帧同步开启事件，随后用户A停止帧同步，用户A与用户B监听房间帧同步停止事件 onStartFrameSync"
          );
          expect(event).toBe("startFrame");
          const stopFrameRes = await colaA.stopFrameSync();
          expect(stopFrameRes.status).toBeTruthy();
        } catch (e) {
          reject(e);
        }
      });
      // 用户B监听房间帧同步开启
      colaB.listen("onStartFrameSync", async (event: Cola.EventRes.onStartFrameSync) => {
        try {
          colaB.log(
            "frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步, 用户A与用户B监听房间帧同步开启事件，随后用户A停止帧同步，用户A与用户B监听房间帧同步停止事件 onStartFrameSync"
          );
          expect(event).toBe("startFrame");
        } catch (e) {
          reject(e);
        }
      });
      // 用户A监听房间帧同步停止
      colaA.listen("onStopFrameSync", async (event: Cola.EventRes.onStopFrameSync) => {
        try {
          colaA.log(
            "frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步, 用户A与用户B监听房间帧同步开启事件，随后用户A停止帧同步，用户A与用户B监听房间帧同步停止事件 onStopFrameSync"
          );
          expect(event).toBe("stopFrame");
          flag_1 = true;
          if (flag_1 && flag_2) resolve();
        } catch (e) {
          reject(e);
        }
      });
      // 用户B监听房间帧同步停止
      colaB.listen("onStopFrameSync", async (event: Cola.EventRes.onStopFrameSync) => {
        try {
          colaB.log(
            "frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步, 用户A与用户B监听房间帧同步开启事件，随后用户A停止帧同步，用户A与用户B监听房间帧同步停止事件 onStopFrameSync"
          );
          expect(event).toBe("stopFrame");
          flag_2 = true;
          if (flag_1 && flag_2) resolve();
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

test("用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步并发送帧消息(进度0, 10, 20, ...100)，用户B监听帧消息", () => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      let rid = "";
      // 用户A监听用户B进入房间事件
      colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
        try {
          colaA.log(
            "frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步并发送帧消息(进度0, 10, 20, ...100)，用户B监听帧消息 onRoomAdd",
            event
          );
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
              colaA.log(
                `frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步并发送帧消息(进度0, 10, 20, ...100)，用户B监听帧消息 sendFrameRes=`,
                sendFrameRes
              );
              progress += 10;
              if (progress > 100) {
                progress = 100;
                clearInterval(interval);
                interval = null;
              }
            }, 1000);
          }
        } catch (e) {
          reject(e);
        }
      });
      // 用户B监听用户A创建房间事件
      colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
        try {
          colaB.log(
            "frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步并发送帧消息(进度0, 10, 20, ...100)，用户B监听帧消息 onRoomCreate",
            event
          );
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
      // 用户B监听用户A发送的帧消息
      colaB.listen("onRecvFrame", async (event: Cola.EventRes.onRecvFrame) => {
        try {
          colaB.log(
            "frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步并发送帧消息(进度0, 10, 20, ...100)，用户B监听帧消息 onRecvFrame",
            event
          );

          const { id, isReplay, items } = event;

          expect(items).toBeDefined();
          expect(isReplay).toBe(false);
          expect(id).toBeDefined();

          if (items.length > 0) {
            const jsonData = JSON.parse(items[0].direction);
            if (jsonData.progress === 100) resolve();
          }
        } catch (e) {
          reject(e);
        }
      });
      colaB.listen("onDismissRoom", async (event: Cola.EventRes.onDismissRoom) => {
        colaB.log(
          "frame.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步并发送帧消息(进度0, 10, 20, ...100)，用户B监听帧消息 onDismissRoom"
        );
        expect(event).toBe("dismissRoom");
        colaB.leaveRoom(rid);
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
