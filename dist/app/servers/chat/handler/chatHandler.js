"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatHandler = void 0;
function default_1(app) {
    return new ChatHandler(app);
}
exports.default = default_1;
class ChatHandler {
    constructor(app) {
        this.app = app;
        this.channelService = app.get('channelService');
    }
    /**
     * 向用户发送消息
     *
     * @param {ChatSendMsg} msg 消息发送对象
     * @param {Object} session
     *
     */
    async sendToClient(msg, session) {
        const { content, uidList } = msg;
        const room = session.get('room');
        const fromUid = session.uid;
        const fromName = session.get('name');
        console.log(`sendToClient room=${room} fromName=${fromName}[${fromUid}] content=${content} uidList=${JSON.stringify(uidList)} `);
        if (!uidList || (uidList.length === 0))
            return;
        const channelService = this.app.get('channelService');
        const channel = channelService.getChannel(room, false);
        const param = {
            msg: content,
            from: fromUid,
            target: uidList
        };
        const pushArr = [];
        uidList.forEach(uid => {
            const targetUid = uid;
            const targetServerId = channel.getMember(targetUid)['sid'];
            pushArr.push({ uid: targetUid, sid: targetServerId });
        });
        console.log(`sendToClient pushMessageByUids onChat param = ${JSON.stringify(param)} pushArr = ${JSON.stringify(uidList)}`);
        channelService.pushMessageByUids('onChat', param, pushArr);
        return {
            code: 200,
            message: "",
            data: {
                status: true
            }
        };
    }
    /**
     * 创建房间
     * @param roomName 房间名
     * @param session
     */
    async createRoom(msg, session) {
        let { roomName } = msg;
        const uid = session.uid;
        const name = session.get('name');
        const customPlayerStatus = session.get('customPlayerStatus');
        const customProfile = session.get('customProfile');
        const gameId = session.get('gameId');
        const serverId = session.get('serverId');
        // 房间名格式：gameId:roomName
        roomName = `${gameId}:${roomName}`;
        session.set('room', roomName);
        session.set('ownRoom', roomName);
        const sessionPushResult = await session.apushAll();
        if (sessionPushResult)
            console.error('session.apushAll for session service failed! error is : %j', sessionPushResult.stack);
        const player = {
            uid,
            gameId,
            name,
            customPlayerStatus,
            customProfile,
        };
        // 将用户加入指定房间
        await this.app.rpc.chat.chatRemote.add.route(session)(player, serverId, roomName);
        const param = {
            roomName,
            creator: uid,
            players: [
                player
            ]
        };
        // 向指定游戏大厅频道广播房间创建的消息
        const hallChannel = this.channelService.getChannel(gameId);
        hallChannel.pushMessage('onRoomCreate', param);
        return {
            code: 200,
            message: '',
            data: param
        };
    }
    /**
     * 进入房间，返回房间内的用户信息
     * @param msg
     * @param session
     */
    async enterRoom(msg, session) {
        let { roomName } = msg;
        const uid = session.uid;
        const name = session.get('name');
        const customPlayerStatus = session.get('customPlayerStatus');
        const customProfile = session.get('customProfile');
        const gameId = session.get('gameId');
        const serverId = session.get('serverId');
        // 房间名格式：gameId:roomName
        roomName = `${gameId}:${roomName}`;
        session.set('room', roomName);
        session.set('ownRoom', null);
        const sessionPushResult = await session.apushAll();
        if (sessionPushResult)
            console.error('session.apushAll for session service failed! error is : %j', sessionPushResult.stack);
        const playerInfo = {
            uid,
            gameId,
            name,
            customPlayerStatus,
            customProfile,
        };
        console.log(`准备查询指定房间内的用户列表...`);
        // 查询指定房间内的用户列表
        const roomUserListOld = await this.app.rpc.chat.chatRemote.get.route(session)(serverId, roomName);
        console.log(`查询指定房间内的用户列表 roomUserList = ${JSON.stringify(roomUserListOld)}`);
        const isInRoom = roomUserListOld.some(user => user.uid === uid);
        if (isInRoom) {
            return {
                code: 500,
                message: `用户已加入该房间(${roomName})`,
                data: roomUserListOld
            };
        }
        // 将用户加入指定房间
        await this.app.rpc.chat.chatRemote.add.route(session)(playerInfo, serverId, roomName);
        console.log(`已将用户加入指定房间`);
        // 查询指定房间内的用户列表
        const roomUserListNew = await this.app.rpc.chat.chatRemote.get.route(session)(serverId, roomName);
        console.log(`查询指定房间内的用户列表 roomUserList = ${JSON.stringify(roomUserListNew)}`);
        return {
            code: 200,
            message: "",
            data: roomUserListNew
        };
    }
    /**
     * 用户主动离开游戏房间(非大厅)
     * @param msg
     * @param session
     */
    async leaveRoom(msg, session) {
        let { roomName } = msg;
        const gameId = session.get("gameId");
        if (roomName === gameId) {
            console.warn(`leaveRoom Warn(roomName === gameId) roomName = ${roomName}`);
            return;
        }
        roomName = `${gameId}:${roomName}`;
        // 将该用户从房间内移除
        this.app.rpc.chat.chatRemote.kick.route(session, true)(session.uid, this.app.get("serverId"), roomName);
    }
}
exports.ChatHandler = ChatHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9jaGF0L2hhbmRsZXIvY2hhdEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBUUEsbUJBQXlCLEdBQWdCO0lBQ3ZDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxXQUFXO0lBR3RCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFDbEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBOEIsRUFBRSxPQUF1QjtRQUN4RSxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQztRQUNqQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDNUIsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixJQUFJLGFBQWEsUUFBUSxJQUFJLE9BQU8sYUFBYSxPQUFPLFlBQVksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakksSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1lBQUUsT0FBTztRQUUvQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sT0FBTyxHQUFH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