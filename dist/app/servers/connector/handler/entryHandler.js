"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handler = void 0;
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
        if (hallRid) {
            console.log(`将该用户从游戏大厅中移除, uid=${uid}`);
            this.app.rpc.game.gameRemote.kick.route(session, true)(uid, this.app.get("serverId"), hallRid);
        }
        // 将该用户从房间内移除
        if (rid) {
            console.log(`将该用户从房间内移除, uid=${uid}`);
            this.app.rpc.game.gameRemote.kick.route(session, true)(uid, this.app.get("serverId"), rid);
        }
        // 该用户是房主，游戏未开始则解散该房间
        if (!!ownRid) {
            // todo 不确定是否需要踢出所有房间内用户
            this.app.get("channelService").destroyChannel(ownRid);
            this.app.rpc.game.gameRemote.destroyRoom.route(session, true)(rid);
            console.log(`房主(${uid})离开房间，房间已解散，rid = ${ownRid}`);
        }
    }
}
exports.Handler = Handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29ubmVjdG9yL2hhbmRsZXIvZW50cnlIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQTRCQSxtQkFBeUIsR0FBZ0I7SUFDdkMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMxQixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFhLE9BQU87SUFDbEIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtJQUFHLENBQUM7SUFFeEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUErQixFQUFFLE9BQXdCO1FBQ25FLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLFVBQVUsQ0FBQztRQUN6QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLG1EQUFtRCxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3RixJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRXBELDhCQUE4QjtRQUM5QixJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2xDLE9BQU87Z0JBQ0wsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsT0FBTyxFQUFFLFFBQVEsR0FBRyxlQUFlO2dCQUNuQyxJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFO2FBQ3hCLENBQUM7U0FDSDtRQUVELE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENB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