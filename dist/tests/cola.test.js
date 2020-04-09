"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Cola_1 = require("./client/Cola");
const myRoomName = "room-1977";
const playerInfo = {
    uid: "123456789",
    gameId: "dnf",
    name: "测试用户-1",
    // 自定义玩家状态
    customPlayerStatus: 0,
    // 自定义玩家信息
    customProfile: JSON.stringify({ hp: 100, mp: 80 })
};
const gateHost = "127.0.0.1";
const gatePort = 3100;
const options = {
    debug: true
};
let cola = null;
beforeAll(async () => {
    cola = new Cola_1.default(playerInfo, gateHost, gatePort, options);
});
afterAll(async () => {
    await cola.close();
});
test("创建房间room-1977成功", async () => {
    await cola.enterHall();
    const roomInfo = await cola.createRoom(myRoomName);
    //  {"roomName":"dnf:room-1977","creator":"123456789","players":[{"uid":"123456789","gameId":"dnf","name":"测试用户-1","customPlayerStatus":0,"customProfile":"{\"hp\":100,\"mp\":80}"}]}
    console.log(`roomInfo = ${JSON.stringify(roomInfo)}`);
    expect(roomInfo.roomName).toBe(`${playerInfo.gameId}:${myRoomName}`);
    expect(roomInfo.creator).toBe(playerInfo.uid);
    expect(roomInfo.players[0].uid).toBe(playerInfo.uid);
    expect(roomInfo.players[0].gameId).toBe(playerInfo.gameId);
    expect(roomInfo.players[0].name).toBe(playerInfo.name);
    expect(roomInfo.players[0].customPlayerStatus).toBe(playerInfo.customPlayerStatus);
    expect(roomInfo.players[0].customProfile).toBe(playerInfo.customProfile);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sYS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdHMvY29sYS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0NBQXVDO0FBR3ZDLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQztBQUMvQixNQUFNLFVBQVUsR0FBb0I7SUFDbEMsR0FBRyxFQUFFLFdBQVc7SUFDaEIsTUFBTSxFQUFFLEtBQUs7SUFDYixJQUFJLEVBQUUsUUFBUTtJQUNkLFVBQVU7SUFDVixrQkFBa0IsRUFBRSxDQUFDO0lBQ3JCLFVBQVU7SUFDVixhQUFhLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0NBQ25ELENBQUM7QUFDRixNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUM7QUFDN0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLE1BQU0sT0FBTyxHQUFxQjtJQUNoQyxLQUFLLEVBQUUsSUFBSTtDQUNaLENBQUM7QUFDRixJQUFJLElBQUksR0FBUSxJQUFJLENBQUM7QUFFckIsU0FBUyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ25CLElBQUksR0FBRyxJQUFJLGNBQVUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNqRSxDQUFDLENBQUMsQ0FBQztBQUVILFFBQVEsQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNuQixNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNwQixDQUFDLENBQUMsQ0FBQztBQUVILElBQUksQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLElBQUcsRUFBRTtJQUM5QixNQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN2QixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkQscUxBQXFMO0lBQ3JMLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN0RCxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLElBQUksVUFBVSxFQUFFLENBQUMsQ0FBQztJQUNyRSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyRCxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNELE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDbkYsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM3RSxDQUFDLENBQUMsQ0FBQyJ9