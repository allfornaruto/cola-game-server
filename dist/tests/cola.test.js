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
    colaA.listen("io-error", event => console.log(">>>>>>>>>>>>>>>ColaEvent[error]", event.message));
    // 关闭处理
    colaA.listen("close", event => console.log(">>>>>>>>>>>>>>>ColaEvent[close]", event.message));
    // 心跳timeout
    colaA.listen("heartbeat timeout", event => console.log(">>>>>>>>>>>>>>>ColaEvent[heartBeatTimeout]", event));
    colaA.listen("onHallAdd", async (event) => {
        console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onHallAdd]", JSON.stringify(event));
    });
    // 测试用户B
    colaB = new Cola_1.default(init_B, options);
    // 错误处理
    colaB.listen("io-error", event => console.log(">>>>>>>>>>>>>>>ColaEvent[error]", event.message));
    // 关闭处理
    colaB.listen("close", event => console.log(">>>>>>>>>>>>>>>ColaEvent[close]", event.message));
    // 心跳timeout
    colaB.listen("heartbeat timeout", event => console.log(">>>>>>>>>>>>>>>ColaEvent[heartBeatTimeout]", event));
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
// test("用户A创建房间room-1977，用户B在大厅监听该房间的创建", () => {
//   return new Promise<void>(async (resolve, reject) => {
//     try {
//       // 用户B监听用户A创建房间事件
//       colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
//         try {
//           console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
//           expect(event.gameId).toBe(playerInfoA.gameId);
//           expect(event.name).toBe(myRoomA.name);
//           expect(event.type).toBe(myRoomA.type);
//           expect(event.createType).toBe(myRoomA.createType);
//           expect(event.maxPlayers).toBe(myRoomA.maxPlayers);
//           expect(event.owner).toBe(playerInfoA.uid);
//           expect(event.isPrivate).toBe(myRoomA.isPrivate);
//           expect(event.customProperties).toBe(myRoomA.customProperties);
//           expect(event.teamList).toStrictEqual(myRoomA.teamList);
//           expect(event.maxPlayers).toBe(myRoomA.maxPlayers);
//           expect(event.playerList[0].uid).toBe(playerInfoA.uid);
//           expect(event.playerList[0].gameId).toBe(playerInfoA.gameId);
//           expect(event.playerList[0].name).toBe(playerInfoA.name);
//           setTimeout(() => resolve(), 5000);
//         } catch (e) {
//           reject(e);
//         }
//       });
//       // 用户A、B进入游戏大厅，用户A创建房间
//       await colaA.enterHall();
//       await colaB.enterHall();
//       const roomInfo: Cola.Room = await colaA.createRoom(myRoomA);
//       console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
//       expect(roomInfo.gameId).toBe(playerInfoA.gameId);
//       expect(roomInfo.name).toBe(myRoomA.name);
//       expect(roomInfo.type).toBe(myRoomA.type);
//       expect(roomInfo.createType).toBe(myRoomA.createType);
//       expect(roomInfo.maxPlayers).toBe(myRoomA.maxPlayers);
//       expect(roomInfo.owner).toBe(playerInfoA.uid);
//       expect(roomInfo.isPrivate).toBe(myRoomA.isPrivate);
//       expect(roomInfo.customProperties).toBe(myRoomA.customProperties);
//       expect(roomInfo.teamList).toStrictEqual(myRoomA.teamList);
//       expect(roomInfo.maxPlayers).toBe(myRoomA.maxPlayers);
//       expect(roomInfo.playerList[0].uid).toBe(playerInfoA.uid);
//       expect(roomInfo.playerList[0].gameId).toBe(playerInfoA.gameId);
//       expect(roomInfo.playerList[0].name).toBe(playerInfoA.name);
//     } catch (e) {
//       reject(e);
//     }
//   });
// });
// test("用户A创建房间room-1977，用户B进入该房间，用户A监听用户B进入/离开房间的事件", () => {
//   return new Promise<void>(async (resolve, reject) => {
//     try {
//       let rid = "";
//       // 用户A监听用户B进入房间事件
//       colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
//         try {
//           console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onRoomAdd]", JSON.stringify(event));
//           expect(event.uid).toBe(playerInfoB.uid);
//           expect(event.gameId).toBe(playerInfoB.gameId);
//           expect(event.name).toBe(playerInfoB.name);
//           expect(event.teamId).toBe(playerInfoExtraB.teamId);
//           expect(event.customPlayerStatus).toBe(playerInfoExtraB.customPlayerStatus);
//           expect(event.customProfile).toBe(playerInfoExtraB.customProfile);
//           expect(event.matchAttributes).toStrictEqual(playerInfoExtraB.matchAttributes);
//         } catch (e) {
//           reject(e);
//         }
//       });
//       // 用户A监听用户B离开房间事件
//       colaA.listen("onKick", (event: Cola.EventRes.OnKick) => {
//         try {
//           console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onKick]", event);
//           expect(event.uid).toBe(playerInfoB.uid);
//           expect(event.rid).toBe(rid);
//           setTimeout(() => resolve(), 1000);
//         } catch (e) {
//           reject(e);
//         }
//       });
//       // 用户B监听用户A创建房间事件
//       colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
//         try {
//           console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
//           rid = event.rid;
//           const roomInfo: Cola.Room = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
//           console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
//           expect(roomInfo.playerList.length).toBe(2);
//           expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
//           expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
//           await colaB.leaveRoom(rid);
//         } catch (e) {
//           reject(e);
//         }
//       });
//       // 用户A、B进入游戏大厅，用户A创建房间
//       await colaA.enterHall();
//       await colaB.enterHall();
//       await colaA.createRoom(myRoomA);
//     } catch (e) {
//       reject(e);
//     }
//   });
// });
// test("用户A创建房间room-1977，用户B进入该房间，用户A发送消息，用户B监听消息", () => {
//   return new Promise<void>(async (resolve, reject) => {
//     try {
//       let rid = "";
//       // 用户A监听用户B进入房间事件
//       colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
//         try {
//           console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onRoomAdd]", JSON.stringify(event));
//           expect(event.uid).toBe(playerInfoB.uid);
//           expect(event.gameId).toBe(playerInfoB.gameId);
//           expect(event.name).toBe(playerInfoB.name);
//           expect(event.teamId).toStrictEqual(playerInfoExtraB.teamId);
//           expect(event.customPlayerStatus).toBe(playerInfoExtraB.customPlayerStatus);
//           expect(event.customProfile).toBe(playerInfoExtraB.customProfile);
//           expect(event.matchAttributes).toStrictEqual(playerInfoExtraB.matchAttributes);
//           // 用户A发送消息
//           const sendResult: Cola.Status = await colaA.sendMsg(["222222"], "Hello colaB");
//           expect(sendResult.status).toBeTruthy();
//         } catch (e) {
//           reject(e);
//         }
//       });
//       // 用户B监听用户A创建房间事件
//       colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
//         try {
//           console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
//           rid = event.rid;
//           const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
//           console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
//           expect(roomInfo.playerList.length).toBe(2);
//           expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
//           expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
//         } catch (e) {
//           reject(e);
//         }
//       });
//       // 用户B监听用户A发送的消息
//       colaB.listen("onChat", async (event: Cola.EventRes.OnChat) => {
//         try {
//           console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onChat]", JSON.stringify(event));
//           expect(event.msg).toBe("Hello colaB");
//           expect(event.from).toBe(playerInfoA.uid);
//           expect(event.target).toStrictEqual([playerInfoB.uid]);
//           setTimeout(() => resolve(), 1000);
//         } catch (e) {
//           reject(e);
//         }
//       });
//       // 用户A、B进入游戏大厅，用户A创建房间
//       await colaA.enterHall();
//       await colaB.enterHall();
//       await colaA.createRoom(myRoomA);
//     } catch (e) {
//       reject(e);
//     }
//   });
// });
// test("用户A创建房间room-1977，用户B进入该房间，房主（用户A）修改房间信息，用户B监听房间修改消息，用户B尝试修改房间信息，由于用户B不是房主，所以修改信息失败", () => {
//   return new Promise<void>(async (resolve, reject) => {
//     try {
//       let rid = "";
//       // 用户A监听用户B进入房间事件
//       colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
//         try {
//           console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onRoomAdd]", JSON.stringify(event));
//           expect(event.uid).toBe(playerInfoB.uid);
//           expect(event.gameId).toBe(playerInfoB.gameId);
//           expect(event.name).toBe(playerInfoB.name);
//           expect(event.teamId).toStrictEqual(playerInfoExtraB.teamId);
//           expect(event.customPlayerStatus).toBe(playerInfoExtraB.customPlayerStatus);
//           expect(event.customProfile).toBe(playerInfoExtraB.customProfile);
//           expect(event.matchAttributes).toStrictEqual(playerInfoExtraB.matchAttributes);
//           // 房主（用户A）修改房间信息
//           const changeRoomRes = await colaA.changeRoom({
//             name: "room-2077",
//             isPrivate: true,
//             customProperties: "1",
//             isForbidJoin: true,
//           });
//           expect(changeRoomRes.name).toBe("room-2077");
//           expect(changeRoomRes.isPrivate).toBeTruthy();
//           expect(changeRoomRes.customProperties).toBe("1");
//           expect(changeRoomRes.isForbidJoin).toBeTruthy();
//         } catch (e) {
//           reject(e);
//         }
//       });
//       // 用户B监听用户A创建房间事件
//       colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
//         try {
//           console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
//           rid = event.rid;
//           const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
//           console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
//           expect(roomInfo.playerList.length).toBe(2);
//           expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
//           expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
//         } catch (e) {
//           reject(e);
//         }
//       });
//       // 用户B监听房间信息变更事件
//       colaB.listen("onChangeRoom", async (event: Cola.EventRes.OnChangeRoom) => {
//         // 非房主（用户B）修改房间信息
//         try {
//           expect(event.name).toBe("room-2077");
//           expect(event.isPrivate).toBeTruthy();
//           expect(event.customProperties).toBe("1");
//           expect(event.isForbidJoin).toBeTruthy();
//           await colaB.changeRoom({
//             name: "room-2177",
//             isPrivate: false,
//             customProperties: "2",
//             isForbidJoin: false,
//           });
//         } catch (e) {
//           console.log(e);
//           expect(e.code).toBe(500);
//           expect(e.message).toBe("非房主无法修改房间信息");
//           expect(e.data).toBeNull();
//           resolve();
//         }
//       });
//       // 用户A、B进入游戏大厅，用户A创建房间
//       await colaA.enterHall();
//       await colaB.enterHall();
//       await colaA.createRoom(myRoomA);
//     } catch (e) {
//       reject(e);
//     }
//   });
// });
// test("用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步, 用户A与用户B监听房间帧同步开启事件，随后用户A停止帧同步，用户A与用户B监听房间帧同步停止事件", () => {
//   return new Promise<void>(async (resolve, reject) => {
//     try {
//       let rid = "";
//       let flag_1 = false;
//       let flag_2 = false;
//       // 用户A监听用户B进入房间事件
//       colaA.listen("onRoomAdd", async (event: Cola.EventRes.OnRoomAdd) => {
//         try {
//           console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onRoomAdd]", JSON.stringify(event));
//           expect(event.uid).toBe(playerInfoB.uid);
//           expect(event.gameId).toBe(playerInfoB.gameId);
//           expect(event.name).toBe(playerInfoB.name);
//           expect(event.teamId).toStrictEqual(playerInfoExtraB.teamId);
//           expect(event.customPlayerStatus).toBe(playerInfoExtraB.customPlayerStatus);
//           expect(event.customProfile).toBe(playerInfoExtraB.customProfile);
//           expect(event.matchAttributes).toStrictEqual(playerInfoExtraB.matchAttributes);
//           // 用户A开启帧同步
//           const res = await colaA.startFrameSync();
//           expect(res.status).toBe(true);
//         } catch (e) {
//           reject(e);
//         }
//       });
//       // 用户B监听用户A创建房间事件
//       colaB.listen("onRoomCreate", async (event: Cola.EventRes.OnRoomCreate) => {
//         try {
//           console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
//           rid = event.rid;
//           const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
//           console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
//           expect(roomInfo.playerList.length).toBe(2);
//           expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
//           expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
//         } catch (e) {
//           reject(e);
//         }
//       });
//       // 用户A监听房间帧同步开启，随后停止帧同步
//       colaA.listen("onStartFrameSync", async (event: Cola.EventRes.onStartFrameSync) => {
//         try {
//           expect(event).toBe("startFrame");
//           const stopFrameRes = await colaA.stopFrameSync();
//           expect(stopFrameRes.status).toBeTruthy();
//         } catch (e) {
//           reject(e);
//         }
//       });
//       // 用户B监听房间帧同步开启
//       colaB.listen("onStartFrameSync", async (event: Cola.EventRes.onStartFrameSync) => {
//         try {
//           expect(event).toBe("startFrame");
//         } catch (e) {
//           reject(e);
//         }
//       });
//       // 用户A监听房间帧同步停止
//       colaA.listen("onStopFrameSync", async (event: Cola.EventRes.onStopFrameSync) => {
//         try {
//           expect(event).toBe("stopFrame");
//           flag_1 = true;
//           if (flag_1 && flag_2) resolve();
//         } catch (e) {
//           reject(e);
//         }
//       });
//       // 用户B监听房间帧同步停止
//       colaB.listen("onStopFrameSync", async (event: Cola.EventRes.onStopFrameSync) => {
//         try {
//           expect(event).toBe("stopFrame");
//           flag_2 = true;
//           if (flag_1 && flag_2) resolve();
//         } catch (e) {
//           reject(e);
//         }
//       });
//       // 用户A、B进入游戏大厅，用户A创建房间
//       await colaA.enterHall();
//       await colaB.enterHall();
//       await colaA.createRoom(myRoomA);
//     } catch (e) {
//       reject(e);
//     }
//   });
// });
test("用户A创建房间room-1977，用户B进入该房间，用户A开启帧同步并发送帧消息(进度0, 10, 20, ...100)，用户B监听帧消息", () => {
    return new Promise(async (resolve, reject) => {
        try {
            let rid = "";
            // 用户A监听用户B进入房间事件
            colaA.listen("onRoomAdd", async (event) => {
                try {
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
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户B监听用户A创建房间事件
            colaB.listen("onRoomCreate", async (event) => {
                try {
                    console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
                    rid = event.rid;
                    const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
                    console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
                    expect(roomInfo.playerList.length).toBe(2);
                    expect(roomInfo.playerList[0]).toMatchObject(playerInfoA);
                    expect(roomInfo.playerList[1]).toMatchObject(playerInfoB);
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户B监听用户A发送的帧消息
            colaB.listen("onRecvFrame", async (event) => {
                try {
                    console.log(">>>>>>>>>>>>>>>colaA ColaEvent[onRecvFrame]", JSON.stringify(event));
                    console.log(`event=${JSON.stringify(event)}`);
                    const { id, isReplay, items } = event;
                    expect(items).toBeDefined();
                    expect(isReplay).toBe(false);
                    expect(id).toBeDefined();
                    if (items.length > 0) {
                        const jsonData = JSON.parse(items[0].direction);
                        if (jsonData.progress === 100)
                            resolve();
                    }
                }
                catch (e) {
                    reject(e);
                }
            });
            colaB.listen("onDismissRoom", async (event) => {
                expect(event).toBe("dismissRoom");
                colaB.leaveRoom(rid);
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
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户B监听用户A创建房间事件
            colaB.listen("onRoomCreate", async (event) => {
                try {
                    console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
                    rid = event.rid;
                    const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
                    console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
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
                }
                catch (e) {
                    reject(e);
                }
            });
            // 用户B监听用户A创建房间事件
            colaB.listen("onRoomCreate", async (event) => {
                try {
                    console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
                    rid = event.rid;
                    const roomInfo = await colaB.enterRoom({ rid, playerInfoExtra: playerInfoExtraB });
                    console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
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
test("用户A创建公开房间room-1977，用户B在大厅查询(不过滤私有房间)房间列表，可以查询到room-1977房间; 用户B在大厅查询(过滤私有房间)房间列表，可以查询到room-1977房间。用户A将其改为私有房间后，用户B再次查询(过滤私有房间)，无法查询到该房间; 用户B再次查询(不过滤私有房间)，可以查询到该房间", () => {
    return new Promise(async (resolve, reject) => {
        try {
            let rid = "";
            // 用户B监听用户A创建房间事件
            colaB.listen("onRoomCreate", async (event) => {
                try {
                    console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
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
                    console.log(">>>>>>>>>>>>>>>colaB ColaEvent[onRoomCreate]", JSON.stringify(event));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sYS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdHMvY29sYS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0NBQXVDO0FBR3ZDLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQztBQUM3QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFFdEIsTUFBTSxXQUFXLEdBQXdCO0lBQ3ZDLEdBQUcsRUFBRSxRQUFRO0lBQ2IsTUFBTSxFQUFFLEtBQUs7SUFDYixJQUFJLEVBQUUsUUFBUTtDQUNmLENBQUM7QUFDRixNQUFNLGdCQUFnQixHQUF5QjtJQUM3QyxNQUFNLEVBQUUsR0FBRztJQUNYLGtCQUFrQixFQUFFLENBQUM7SUFDckIsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUNsRCxlQUFlLEVBQUUsRUFBRTtDQUNwQixDQUFDO0FBQ0YsTUFBTSxXQUFXLEdBQXdCO0lBQ3ZDLEdBQUcsRUFBRSxRQUFRO0lBQ2IsTUFBTSxFQUFFLEtBQUs7SUFDYixJQUFJLEVBQUUsUUFBUTtDQUNmLENBQUM7QUFDRixNQUFNLGdCQUFnQixHQUF5QjtJQUM3QyxNQUFNLEVBQUUsR0FBRztJQUNYLGtCQUFrQixFQUFFLENBQUM7SUFDckIsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUNsRCxlQUFlLEVBQUUsRUFBRTtDQUNwQixDQUFDO0FBQ0YsTUFBTSxPQUFPLEdBQTJCO0lBQ3RDLElBQUksRUFBRSxXQUFXO0lBQ2pCLElBQUksRUFBRSxHQUFHO0lBQ1QsVUFBVSxFQUFFLENBQUM7SUFDYixVQUFVLEVBQUUsQ0FBQztJQUNiLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLGdCQUFnQixFQUFFLEVBQUU7SUFDcEIsUUFBUSxF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