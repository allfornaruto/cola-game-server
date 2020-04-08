import ColaClient from "./client/Cola";
import { Cola } from "../types/Cola";
// import { appStart } from "../appStart";

const gateHost = "127.0.0.1";
const gatePort = 3100;

const playerInfoA: Cola.PlayerInfo = {
  uid: "111111",
  gameId: "dnf",
  name: "测试用户-A",
  teamId: "1",
  customPlayerStatus: 0,
  customProfile: JSON.stringify({ hp: 100, mp: 80 }),
  matchAttributes: []
};
const playerInfoB: Cola.PlayerInfo = {
  uid: "222222",
  gameId: "dnf",
  name: "测试用户-B",
  teamId: "2",
  customPlayerStatus: 0,
  customProfile: JSON.stringify({ hp: 120, mp: 60 }),
  matchAttributes: []
};
const myRoom: Cola.Params.CreateRoom = {
  name: "room-1977",
  type: "0",
  createType: 0,
  maxPlayers: 2,
  isPrivate: false,
  customProperties: "",
  teamList: [],
};

const init_A: Cola.Init = {
  gateHost,
  gatePort,
  gameId: "dnf",
  playerInfo: playerInfoA
};
const init_B: Cola.Init = {
  gateHost,
  gatePort,
  gameId: "dnf",
  playerInfo: playerInfoB
};
const options: Cola.ColaOptions = {
  debug: true
};
let colaA: ColaClient = null;
let colaB: ColaClient = null;

beforeEach(async () => {
  // await appStart();
  // 测试用户A
  colaA = new ColaClient(init_A, options);
  // 错误处理
  colaA.listen("io-error", event => console.error('>>>>>>>>>>>>>>>ColaEvent[error]', event.message));
  // 关闭处理
  colaA.listen("close", event => console.error('>>>>>>>>>>>>>>>ColaEvent[close]', event.message));
  // 心跳timeout
  colaA.listen("heartbeat timeout", event => console.error('>>>>>>>>>>>>>>>ColaEvent[heartBeatTimeout]', event));
  colaA.listen("onHallAdd", async (event: Cola.EventRes.OnHallAdd) => {
    console.log('>>>>>>>>>>>>>>>colaA ColaEvent[onHallAdd]', JSON.stringify(event));
  });

  // 测试用户B
  colaB = new ColaClient(init_B, options);
  // 错误处理
  colaB.listen("io-error", event => console.error('>>>>>>>>>>>>>>>ColaEvent[error]', event.message));
  // 关闭处理
  colaB.listen("close", event => console.error('>>>>>>>>>>>>>>>ColaEvent[close]', event.message));
  // 心跳timeout
  colaB.listen("heartbeat timeout", event => console.error('>>>>>>>>>>>>>>>ColaEvent[heartBeatTimeout]', event));
  // 离开房间
  colaB.listen("onKick", (event: Cola.EventRes.OnKick) => {
    console.log('>>>>>>>>>>>>>>>colaB ColaEvent[onKick]', event);
  });
  colaB.listen("onHallAdd", async (event: Cola.EventRes.OnHallAdd) => {
    console.log('>>>>>>>>>>>>>>>colaA ColaEvent[onHallAdd]', JSON.stringify(event));
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
  colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
    console.log('>>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]', JSON.stringify(event));
    expect(event.gameId).toBe(playerInfoA.gameId);
    expect(event.name).toBe(myRoom.name);
    expect(event.type).toBe(myRoom.type);
    expect(event.createType).toBe(myRoom.createType);
    expect(event.maxPlayers).toBe(myRoom.maxPlayers);
    expect(event.owner).toBe(playerInfoA.uid);
    expect(event.isPrivate).toBe(myRoom.isPrivate);
    expect(event.customProperties).toBe(myRoom.customProperties);
    expect(event.teamList).toStrictEqual(myRoom.teamList);
    expect(event.maxPlayers).toBe(myRoom.maxPlayers);
    expect(event.playerList[0].uid).toBe(playerInfoA.uid);
    expect(event.playerList[0].gameId).toBe(playerInfoA.gameId);
    expect(event.playerList[0].name).toBe(playerInfoA.name);
    expect(event.playerList[0].teamId).toBe(playerInfoA.teamId);
    expect(event.playerList[0].customPlayerStatus).toBe(playerInfoA.customPlayerStatus);
    expect(event.playerList[0].customProfile).toBe(playerInfoA.customProfile);
    expect(event.playerList[0].matchAttributes).toStrictEqual(playerInfoA.matchAttributes);
    setTimeout(() => done(), 5000);
  });

  // 用户A、B进入游戏大厅，用户A创建房间
  await colaA.enterHall();
  await colaB.enterHall();
  const roomInfo: Cola.Room = await colaA.createRoom(myRoom);
  console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
  expect(roomInfo.gameId).toBe(playerInfoA.gameId);
  expect(roomInfo.name).toBe(myRoom.name);
  expect(roomInfo.type).toBe(myRoom.type);
  expect(roomInfo.createType).toBe(myRoom.createType);
  expect(roomInfo.maxPlayers).toBe(myRoom.maxPlayers);
  expect(roomInfo.owner).toBe(playerInfoA.uid);
  expect(roomInfo.isPrivate).toBe(myRoom.isPrivate);
  expect(roomInfo.customProperties).toBe(myRoom.customProperties);
  expect(roomInfo.teamList).toStrictEqual(myRoom.teamList);
  expect(roomInfo.maxPlayers).toBe(myRoom.maxPlayers);
  expect(roomInfo.playerList[0].uid).toBe(playerInfoA.uid);
  expect(roomInfo.playerList[0].gameId).toBe(playerInfoA.gameId);
  expect(roomInfo.playerList[0].name).toBe(playerInfoA.name);
  expect(roomInfo.playerList[0].teamId).toBe(playerInfoA.teamId);
  expect(roomInfo.playerList[0].customPlayerStatus).toBe(playerInfoA.customPlayerStatus);
  expect(roomInfo.playerList[0].customProfile).toBe(playerInfoA.customProfile);
  expect(roomInfo.playerList[0].matchAttributes).toStrictEqual(playerInfoA.matchAttributes);
});

test("用户A创建房间room-1977，用户B进入该房间，用户A监听用户B进入/离开房间的事件", async (done) => {
  let rid = "";
  // 用户A监听用户B进入房间事件
  colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
    console.log('>>>>>>>>>>>>>>>colaA ColaEvent[onRoomAdd]', JSON.stringify(event));
    expect(event.uid).toBe(playerInfoB.uid);
    expect(event.gameId).toBe(playerInfoB.gameId);
    expect(event.name).toBe(playerInfoB.name);
    expect(event.teamId).toBe(playerInfoB.teamId);
    expect(event.customPlayerStatus).toBe(playerInfoB.customPlayerStatus);
    expect(event.customProfile).toBe(playerInfoB.customProfile);
    expect(event.matchAttributes).toStrictEqual(playerInfoB.matchAttributes);
  });
  // 用户A监听用户B离开房间事件
  colaA.listen("onKick", (event: Cola.EventRes.OnKick) => {
    console.log('>>>>>>>>>>>>>>>colaA ColaEvent[onKick]', event);
    expect(event.uid).toBe(playerInfoB.uid);
    expect(event.rid).toBe(rid);
    setTimeout(() => done(), 1000);
  });
  // 用户B监听用户A创建房间事件
  colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
    console.log('>>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]', JSON.stringify(event));
    rid = event.rid;
    const roomInfo: Cola.Room = await colaB.enterRoom(rid);
    console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
    expect(roomInfo.playerList.length).toBe(2);
    expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
    expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
    await colaB.leaveRoom(rid);
  });

  // 用户A、B进入游戏大厅，用户A创建房间
  await colaA.enterHall();
  await colaB.enterHall();
  await colaA.createRoom(myRoom);
});

test("用户A创建房间room-1977，用户B进入该房间，用户A发送消息，用户B监听消息", async (done) => {
  let rid = "";
  // 用户A监听用户B进入房间事件
  colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
    console.log('>>>>>>>>>>>>>>>colaA ColaEvent[onRoomAdd]', JSON.stringify(event));
    expect(event.uid).toBe(playerInfoB.uid);
    expect(event.gameId).toBe(playerInfoB.gameId);
    expect(event.name).toBe(playerInfoB.name);
    expect(event.teamId).toStrictEqual(playerInfoB.teamId);
    expect(event.customPlayerStatus).toBe(playerInfoB.customPlayerStatus);
    expect(event.customProfile).toBe(playerInfoB.customProfile);
    expect(event.matchAttributes).toStrictEqual(playerInfoB.matchAttributes);
    // 用户A发送消息
    const sendResult: Cola.Status = await colaA.sendMsg(["222222"], "Hello colaB");
    expect(sendResult.status).toBeTruthy();
  });
  // 用户B监听用户A创建房间事件
  colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
    console.log('>>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]', JSON.stringify(event));
    rid = event.rid;
    const roomInfo = await colaB.enterRoom(rid);
    console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
    expect(roomInfo.playerList.length).toBe(2);
    expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
    expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
  });
  // 用户B监听用户A发送的消息
  colaB.listen("onChat", async (event: Cola.EventRes.OnChat) => {
    console.log('>>>>>>>>>>>>>>>colaA ColaEvent[onChat]', JSON.stringify(event));
    expect(event.msg).toBe("Hello colaB");
    expect(event.from).toBe(playerInfoA.uid);
    expect(event.target).toStrictEqual([playerInfoB.uid]);
    setTimeout(() => done(), 1000);
  });

  // 用户A、B进入游戏大厅，用户A创建房间
  await colaA.enterHall();
  await colaB.enterHall();
  await colaA.createRoom(myRoom);
});

test("用户A创建房间room-1977，用户B进入该房间，房主（用户A）修改房间信息，用户B监听房间修改消息，用户B尝试修改房间信息，由于用户B不是房主，所以修改信息失败", async () => {

});

test("用户A创建公开房间room-1977，用户B在大厅查询房间列表，可以查询到room-1977房间。用户A将其改为私有房间后，用户B再次查询，无法查询到该房间", async () => {

});

test("用户A创建私有房间room-1977，用户B在大厅查询房间列表，无法查询到room-1977房间。用户A将其改为公共房间后，用户B再次查询，可以查询到该房间", async () => {

});

test("用户A创建公共房间room-1977，并禁止其他用户进入房间，用户B尝试进入该房间，无法进入", async () => {

});
