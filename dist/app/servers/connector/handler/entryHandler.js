"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handler = void 0;
const Cola_1 = require("../../../../types/Cola");
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
    async onUserLeave(session) {
        if (!session || !session.uid)
            return;
        const hallRid = session.get("gameId");
        const uid = session.uid;
        const rid = session.get("room");
        const ownRid = session.get("ownRoom");
        // 将该用户从游戏大厅中移除
        if (hallRid) {
            console.log(`将该用户从游戏大厅中移除, uid=${uid}`);
            this.app.rpc.game.gameRemote.kick.route(session, true)(uid, this.app.get("serverId"), hallRid);
        }
        // 非房主, 将该用户从房间内移除
        if (rid && !ownRid) {
            console.log(`非房主，将该用户从房间内移除, uid=${uid}`);
            this.app.rpc.game.gameRemote.kick.route(session, true)(uid, this.app.get("serverId"), rid);
        }
        // 房主，游戏未开始则解散该房间
        else if (rid && ownRid) {
            const isStart = await this.app.rpc.game.gameRemote.checkRoomIsStartFrame.route(session, false)(rid);
            if (isStart === Cola_1.Cola.FrameSyncState.STOP) {
                console.log(`房主，游戏未开始则解散该房间`);
                this.app.rpc.game.gameRemote.dismissRoom.route(session, true)(rid);
            }
            console.log(`房主，将房主从房间中移除`);
            this.app.rpc.game.gameRemote.kick.route(session, true)(uid, this.app.get("serverId"), rid);
        }
    }
}
exports.Handler = Handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29ubmVjdG9yL2hhbmRsZXIvZW50cnlIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLGlEQUE4QztBQTJCOUMsbUJBQXlCLEdBQWdCO0lBQ3ZDLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxPQUFPO0lBQ2xCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7SUFBRyxDQUFDO0lBRXhDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBK0IsRUFBRSxPQUF3QjtRQUNuRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxVQUFVLENBQUM7UUFDekMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtREFBbUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0YsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUVwRCw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNsQyxPQUFPO2dCQUNMLElBQUksRUFBRSxHQUFHO2dCQUNULE9BQU8sRUFBRSxRQUFRLEdBQUcsZUFBZTtnQkFDbkMsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRTthQUN4QixDQUFDO1NBQ0g7UUFFRCxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFL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