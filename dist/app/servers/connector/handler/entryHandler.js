"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handler = void 0;
const Updater_1 = require("../../../domain/Updater");
function default_1(app) {
    return new Handler(app);
}
exports.default = default_1;
class Handler {
    constructor(app) {
        this.app = app;
    }
    async enter(playerInfo, session) {
        const { uid, gameId, name } = playerInfo;
        const serverId = this.app.get("serverId");
        console.log(`[begin] connector.entryHandler.enter playerInfo=${JSON.stringify(playerInfo)}`);
        let sessionService = this.app.get("sessionService");
        // uid对应的session已存在,保证一位用户一个连接
        if (!!sessionService.getByUid(uid)) {
            return {
                code: 500,
                message: `该uid（${uid}）已建立连接，不要重复连接`,
                data: { status: false },
            };
        }
        await session.abind(uid);
        session.set("uid", uid);
        session.set("serverId", serverId);
        session.set("gameId", gameId);
        session.set("name", name);
        // session.set('teamId', teamId);
        // session.set('customPlayerStatus', customPlayerStatus);
        // session.set('customProfile', customProfile);
        // session.set('matchAttributes', matchAttributes);
        const sessionPushResult = await session.apushAll();
        if (sessionPushResult)
            console.error("connector.entryHandler.enter session.apushAll for session service failed! error is : %j", sessionPushResult.stack);
        // 监听到用户断开连接时，通知后端服务器把用户从房间里移除
        session.on("closed", this.onUserLeave.bind(this));
        // 将用户加入大厅
        const addToHall = this.app.rpc.game.gameRemote.addToHall.route(session);
        const addResult = await addToHall(playerInfo, gameId, serverId);
        console.log(`[end] connector.entryHandler.enter playerInfo=${JSON.stringify(playerInfo)}`);
        return {
            code: 200,
            message: "",
            data: addResult,
        };
    }
    // 通知后端服务器把用户从大厅channel、房间channel里移除，游戏未开始时，如果房主退出了房间channel，则销毁该房间
    onUserLeave(session) {
        if (!session || !session.uid)
            return;
        const hallRid = session.get("gameId");
        const uid = session.uid;
        const rid = session.get("room");
        const ownRid = session.get("ownRoom");
        // 将该用户从游戏大厅中移除
        if (hallRid)
            this.app.rpc.game.gameRemote.kick.route(session, true)(uid, this.app.get("serverId"), hallRid);
        // 将该用户从房间内移除
        if (rid)
            this.app.rpc.game.gameRemote.kick.route(session, true)(uid, this.app.get("serverId"), rid);
        // 该用户是房主，游戏未开始则解散该房间
        if (!!ownRid) {
            // todo 不确定是否需要踢出所有房间内用户
            this.app.get("channelService").destroyChannel(ownRid);
            Updater_1.default.removeRoom(ownRid);
            console.log(`房主离开房间，房间已解散，rid = ${ownRid}`);
        }
    }
}
exports.Handler = Handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29ubmVjdG9yL2hhbmRsZXIvZW50cnlIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHFEQUE4QztBQTJCOUMsbUJBQXlCLEdBQWdCO0lBQ3ZDLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxPQUFPO0lBQ2xCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7SUFBRyxDQUFDO0lBRXhDLEtBQUssQ0FBQyxLQUFLLENBQ1QsVUFBK0IsRUFDL0IsT0FBd0I7UUFFeEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsVUFBVSxDQUFDO1FBQ3pDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQ1QsbURBQW1ELElBQUksQ0FBQyxTQUFTLENBQy9ELFVBQVUsQ0FDWCxFQUFFLENBQ0osQ0FBQztRQUNGLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFcEQsOEJBQThCO1FBQzlCLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDbEMsT0FBTztnQkFDTCxJQUFJLEVBQUUsR0FBRztnQkFDVCxPQUFPLEVBQUUsUUFBUSxHQUFHLGVBQWU7Z0JBQ25DLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUU7YUFDeEIsQ0FBQztTQUNIO1FBRUQsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FB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