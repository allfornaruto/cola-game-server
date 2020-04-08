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
        const { uid, gameId, name, teamId, customPlayerStatus, customProfile, matchAttributes } = playerInfo;
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
        session.set('teamId', teamId);
        session.set('customPlayerStatus', customPlayerStatus);
        session.set('customProfile', customProfile);
        session.set('matchAttributes', matchAttributes);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29ubmVjdG9yL2hhbmRsZXIvZW50cnlIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHFEQUE4QztBQTJCOUMsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDNUIsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxPQUFPO0lBQ2hCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7SUFFcEMsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBMkIsRUFBRSxPQUF3QjtRQUM3RCxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsR0FBRyxVQUFVLENBQUM7UUFDckcsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtREFBbUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDN0YsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUVwRCw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNoQyxPQUFPO2dCQUNILElBQUksRUFBRSxHQUFHO2dCQUNULE9BQU8sRUFBRSxRQUFRLEdBQUcsZUFBZTtnQkFDbkMsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRTthQUMxQixDQUFDO1NBQ0w7UUFFRCxNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FB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