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
        const serverId = this.app.get('serverId');
        console.log(`[begin] connector.entryHandler.enter playerInfo=${JSON.stringify(playerInfo)}`);
        let sessionService = this.app.get('sessionService');
        // uid对应的session已存在,保证一位用户一个连接
        if (!!sessionService.getByUid(uid)) {
            return {
                code: 500,
                message: `该uid（${uid}）已建立连接，不要重复连接`,
                data: { status: false }
            };
        }
        await session.abind(uid);
        session.set('uid', uid);
        session.set('serverId', serverId);
        session.set('gameId', gameId);
        session.set('name', name);
        // session.set('teamId', teamId);
        // session.set('customPlayerStatus', customPlayerStatus);
        // session.set('customProfile', customProfile);
        // session.set('matchAttributes', matchAttributes);
        const sessionPushResult = await session.apushAll();
        if (sessionPushResult)
            console.error('connector.entryHandler.enter session.apushAll for session service failed! error is : %j', sessionPushResult.stack);
        // 监听到用户断开连接时，通知后端服务器把用户从房间里移除
        session.on('closed', this.onUserLeave.bind(this));
        // 将用户加入大厅
        const addToHall = this.app.rpc.game.gameRemote.addToHall.route(session);
        const addResult = await addToHall(playerInfo, gameId, serverId);
        console.log(`[end] connector.entryHandler.enter playerInfo=${JSON.stringify(playerInfo)}`);
        return {
            code: 200,
            message: '',
            data: addResult,
        };
    }
    // 通知后端服务器把用户从大厅channel、房间channel里移除，游戏未开始时，如果房主退出了房间channel，则销毁该房间
    onUserLeave(session) {
        if (!session || !session.uid)
            return;
        const hallRid = session.get('gameId');
        const uid = session.uid;
        const rid = session.get('room');
        const ownRid = session.get('ownRoom');
        // 将该用户从游戏大厅中移除
        if (hallRid)
            this.app.rpc.game.gameRemote.kick.route(session, true)(uid, this.app.get("serverId"), hallRid);
        // 将该用户从房间内移除
        if (rid)
            this.app.rpc.game.gameRemote.kick.route(session, true)(uid, this.app.get("serverId"), rid);
        // 该用户是房主，游戏未开始则解散该房间
        if (!!ownRid) {
            // todo 不确定是否需要踢出所有房间内用户
            this.app.get('channelService').destroyChannel(ownRid);
            Updater_1.default.removeRoom(ownRid);
            console.log(`房主离开房间，房间已解散，rid = ${ownRid}`);
        }
    }
}
exports.Handler = Handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29ubmVjdG9yL2hhbmRsZXIvZW50cnlIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHFEQUE4QztBQTJCOUMsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDNUIsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxPQUFPO0lBQ2hCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7SUFFcEMsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBK0IsRUFBRSxPQUF3QjtRQUNqRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxVQUFVLENBQUM7UUFDekMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtREFBbUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0YsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUVwRCw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNoQyxPQUFPO2dCQUNILElBQUksRUFBRSxHQUFHO2dCQUNULE9BQU8sRUFBRSxRQUFRLEdBQUcsZUFBZTtnQkFDbkMsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRTthQUMxQixDQUFDO1NBQ0w7UUFFRCxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFL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