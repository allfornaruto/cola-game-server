import ColaClient from "./client/Cola";
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
  // 错误处理
  colaA.listen("io-error", event => console.error(">>>>>>>>>>>>>>>ColaEvent[error]", event.message));
  // 关闭处理
  colaA.listen("close", event => console.error(">>>>>>>>>>>>>>>ColaEvent[close]", event.message));
  // 心跳timeout
  colaA.listen("heartbeat timeout", event => console.error(">>>>>>>>>>>>>>>ColaEvent[heartBeatTimeout]", event));
  colaA.listen("onHallAdd", async (event: Cola.EventRes.OnHallAdd) => {
    console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onHallAdd]", JSON.stringify(event));
  });

  // 测试用户B
  colaB = new ColaClient(init_B, options);
  // 错误处理
  colaB.listen("io-error", event => console.error(">>>>>>>>>>>>>>>ColaEvent[error]", event.message));
  // 关闭处理
  colaB.listen("close", event => console.error(">>>>>>>>>>>>>>>ColaEvent[close]", event.message));
  // 心跳timeout
  colaB.listen("heartbeat timeout", event => console.error(">>>>>>>>>>>>>>>ColaEvent[heartBeatTimeout]", event));
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

test("用户A创建房间room-1977，用户B在大厅监听该房间的创建", async done => {
  // 用户B监听用户A创建房间事件
  colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
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
  const roomInfo: Cola.Room = await colaA.createRoom(myRoomA);
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

test("用户A创建房间room-1977，用户B进入该房间，用户A监听用户B进入/离开房间的事件", async done => {
  let rid = "";
  // 用户A监听用户B进入房间事件
  colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
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
  colaA.listen("onKick", (event: Cola.EventRes.OnKick) => {
    console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onKick]", event);
    expect(event.uid).toBe(playerInfoB.uid);
    expect(event.rid).toBe(rid);
    setTimeout(() => done(), 1000);
  });
  // 用户B监听用户A创建房间事件
  colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
    console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
    rid = event.rid;
    const roomInfo: Cola.Room = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
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

test("用户A创建房间room-1977，用户B进入该房间，用户A发送消息，用户B监听消息", async done => {
  let rid = "";
  // 用户A监听用户B进入房间事件
  colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
    console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onRoomAdd]", JSON.stringify(event));
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
  });
  // 用户B监听用户A创建房间事件
  colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
    console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
    rid = event.rid;
    const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
    console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
    expect(roomInfo.playerList.length).toBe(2);
    expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
    expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
  });
  // 用户B监听用户A发送的消息
  colaB.listen("onChat", async (event: Cola.EventRes.OnChat) => {
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
  colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
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
  colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
    console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
    rid = event.rid;
    const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
    console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
    expect(roomInfo.playerList.length).toBe(2);
    expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
    expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
  });
  // 用户B监听房间信息变更事件
  colaB.listen("onChangeRoom", async (event: Cola.EventRes.OnChangeRoom) => {
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
    } catch (e) {
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

test("用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步, 用户A与用户B监听房间帧同步开启事件，随后用户A停止帧同步，用户A与用户B监听房间帧同步停止事件", async done => {
  let rid = "";
  let flag_1 = false;
  let flag_2 = false;
  // 用户A监听用户B进入房间事件
  colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
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
  colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
    console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
    rid = event.rid;
    const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
    console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
    expect(roomInfo.playerList.length).toBe(2);
    expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
    expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
  });
  // 用户A监听房间帧同步开启，随后停止帧同步
  colaA.listen("onStartFrameSync", async (event: Cola.EventRes.onStartFrameSync) => {
    expect(event).toBe("startFrame");
    const stopFrameRes = await colaA.stopFrameSync();
    expect(stopFrameRes.status).toBeTruthy();
  });
  // 用户B监听房间帧同步开启
  colaB.listen("onStartFrameSync", async (event: Cola.EventRes.onStartFrameSync) => {
    expect(event).toBe("startFrame");
  });
  // 用户A监听房间帧同步停止
  colaA.listen("onStopFrameSync", async (event: Cola.EventRes.onStopFrameSync) => {
    expect(event).toBe("stopFrame");
    flag_1 = true;
    if (flag_1 && flag_2) done();
  });
  // 用户B监听房间帧同步停止
  colaB.listen("onStopFrameSync", async (event: Cola.EventRes.onStopFrameSync) => {
    expect(event).toBe("stopFrame");
    flag_2 = true;
    if (flag_1 && flag_2) done();
  });

  // 用户A、B进入游戏大厅，用户A创建房间
  await colaA.enterHall();
  await colaB.enterHall();
  await colaA.createRoom(myRoomA);
});

test("用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步并发送帧消息(进度0, 10, 20, ...100)，用户B监听帧消息", async done => {
  let rid = "";
  // 用户A监听用户B进入房间事件
  colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
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
  colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
    console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
    rid = event.rid;
    const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
    console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
    expect(roomInfo.playerList.length).toBe(2);
    expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
    expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
  });
  // 用户B监听用户A发送的帧消息
  colaB.listen("onRecvFrame", async (event: Cola.EventRes.onRecvFrame) => {
    console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onRecvFrame]", JSON.stringify(event));
    console.log(`event=${JSON.stringify(event)}`);

    const { id, isReplay, items } = event;

    expect(items).toBeDefined();
    expect(isReplay).toBe(false);
    expect(id).toBeDefined();

    if (items.length > 0) {
      const jsonData = JSON.parse(items[0].direction);
      if (jsonData.progress === 100) done();
    }
  });

  // 用户A、B进入游戏大厅，用户A创建房间
  await colaA.enterHall();
  await colaB.enterHall();
  await colaA.createRoom(myRoomA);
});

test("用户A创建房间room-1977，用户B进入该房间，用户A根据房间id查询房间数据", async done => {
  let rid = "";
  // 用户A监听用户B进入房间事件
  colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
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
  colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
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

test("用户A创建房间room-1977，用户B进入该房间，用户A解散该房间，用户A/B监听房间解散事件", async done => {
  let rid = "";
  let listenNum = 0;
  // 用户A监听用户B进入房间事件
  colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
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
  colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
    console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
    rid = event.rid;
    const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
    console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
    expect(roomInfo.playerList.length).toBe(2);
    expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
    expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
  });
  colaA.listen("onDismissRoom", async (event: Cola.EventRes.onDismissRoom) => {
    expect(event).toBe("dismissRoom");
    listenNum++;
    if (listenNum === 2) done();
  });
  colaB.listen("onDismissRoom", async (event: Cola.EventRes.onDismissRoom) => {
    expect(event).toBe("dismissRoom");
    listenNum++;
    if (listenNum === 2) done();
  });

  // 用户A、B进入游戏大厅，用户A创建房间
  await colaA.enterHall();
  await colaB.enterHall();
  const room = await colaA.createRoom(myRoomA);
  rid = room.rid;
});

test("用户A创建公开房间room-1977，用户B在大厅查询(不过滤私有房间)房间列表，可以查询到room-1977房间。用户A将其改为私有房间后，用户B再次查询(不过滤私有房间)，无法查询到该房间", async done => {
  let rid = "";
  // 用户B监听用户A创建房间事件
  colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
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

test("用户A创建私有房间room-1977，用户B在大厅查询(不过滤私有房间)房间列表，无法查询到room-1977房间。用户A将其改为公共房间后，用户B再次查询(不过滤私有房间)，可以查询到该房间", async done => {
  let rid = "";
  // 用户B监听用户A创建房间事件
  colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
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

test("用户A创建公共房间room-1977，并禁止其他用户进入房间，用户B尝试进入该房间，无法进入", async done => {
  let rid = "";
  // 用户B监听用户A创建房间事件
  colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
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
