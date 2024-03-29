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
    colaA.log(`chat.test.ts heartBeatTimeout`, event);
  });
  colaA.listen("onHallAdd", (event: Cola.EventRes.OnHallAdd) => {
    colaA.log(`chat.test.ts onHallAdd`, event);
  });

  // 测试用户B
  colaB = new ColaClient(init_B, options);
  // 心跳timeout
  colaB.listen("heartBeatTimeout", event => {
    colaB.log(`chat.test.ts heartBeatTimeout`, event);
  });
  colaB.listen("onHallAdd", (event: Cola.EventRes.OnHallAdd) => {
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
  return new Promise<void>(async (resolve, reject) => {
    try {
      let rid = "";
      // 用户A监听用户B进入房间事件
      colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
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
          const sendResult: Cola.Status = await colaA.sendMsg(["222222"], "Hello colaB");
          expect(sendResult.status).toBeTruthy();
        } catch (e) {
          reject(e);
        }
      });
      // 用户B监听用户A创建房间事件
      colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
        try {
          colaB.log("chat.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A发送消息，用户B监听消息 onRoomCreate", event);
          rid = event.rid;
          const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
          colaB.log("chat.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A发送消息，用户B监听消息 roomInfo=", roomInfo);
          expect(roomInfo.playerList.length).toBe(2);
          expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
          expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
        } catch (e) {
          reject(e);
        }
      });
      // 用户B监听用户A发送的消息
      colaB.listen("onChat", async (event: Cola.EventRes.OnChat) => {
        try {
          colaB.log("chat.test.ts 用户A创建房间room-1977，用户B进入该房间，用户A发送消息，用户B监听消息 onChat", event);
          expect(event.msg).toBe("Hello colaB");
          expect(event.from).toBe(playerInfoA.uid);
          expect(event.target).toStrictEqual([playerInfoB.uid]);
          setTimeout(() => resolve(), 1000);
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
