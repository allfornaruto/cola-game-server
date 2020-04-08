"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameHandler = void 0;
const uuid_1 = require("uuid");
const Player_1 = require("../../../domain/model/Player");
const Room_1 = require("../../../domain/model/Room");
const Updater_1 = require("../../../domain/Updater");
function default_1(app) {
    return new GameHandler(app);
}
exports.default = default_1;
class GameHandler {
    constructor(app) {
        this.app = app;
        this.channelService = app.get('channelService');
    }
    /**
     * 向用户发送消息
     * @param {Cola.Request.SendToClient} msg 消息体
     * @param {Object} session
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
        const channel = channelService.getChannel(room);
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
     * 创建房间，返回房间信息
     * @param {Cola.Request.CreateRoomMsg} msg 创建房间请求参数
     * @param {Object} session
     */
    async createRoom(msg, session) {
        // 随机一个roomId
        const rid = uuid_1.v4();
        console.log(`[begin] game.gameHandler.createRoom uid = ${session.uid}`);
        // 创建player
        const uid = session.uid;
        const gameId = session.get('gameId');
        const name = session.get('name');
        const teamId = session.get('teamId');
        const customPlayerStatus = session.get('customPlayerStatus');
        const customProfile = session.get('customProfile');
        const matchAttributes = session.get('matchAttributes');
        const serverId = session.get('serverId');
        const playerInfo = {
            uid,
            gameId,
            name,
            teamId,
            customPlayerStatus,
            customProfile,
            matchAttributes,
        };
        const createPlayerParams = Object.assign({ isRobot: false }, playerInfo);
        const player = new Player_1.Player(createPlayerParams);
        // 创建channel、并加用户
        const channel = this.channelService.getChannel(rid, true);
        channel.add(playerInfo.uid, serverId);
        // 创建room
        const addRoomParams = Object.assign({
            rid,
            owner: uid,
            playerList: [player],
            channel,
        }, msg);
        const room = new Room_1.Room(addRoomParams);
        // 将room放入Updater中保存
        Updater_1.default.addRoom(rid, room);
        // 将room信息保存在用户的session中
        session.set('room', rid);
        session.set('ownRoom', rid);
        const sessionPushResult = await session.apushAll();
        if (sessionPushResult)
            console.error('gameHandler createRoom session.apushAll for session service failed! error is : %j', sessionPushResult.stack);
        // 向游戏大厅广播房间创建的消息
        const onRoomCreateMsg = room.getRoomInfo();
        const hallChannel = this.channelService.getChannel(gameId);
        hallChannel.pushMessage('onRoomCreate', onRoomCreateMsg);
        console.log(`[end] game.gameHandler.createRoom uid = ${session.uid}`);
        return {
            code: 200,
            message: '',
            data: onRoomCreateMsg
        };
    }
    /**
     * 进入房间，返回房间信息
     * @param {Cola.Request.ChatEnterRoomMsg} msg 进入房间请求参数
     * @param {Object} session
     */
    async enterRoom(msg, session) {
        console.log(`[begin] game.gameHandler.enterRoom uid = ${session.uid} rid = ${msg.rid}`);
        let { rid } = msg;
        // 先查询用户是否已经在目标房间内
        const userRid = session.get('room');
        if (!!userRid) {
            console.warn(`该用户已进入房间，uid = ${session.uid}, rid = ${rid}, userRid = ${userRid}`);
            return {
                code: 500,
                message: `该用户已进入房间`,
                data: null
            };
        }
        // 创建player
        const uid = session.uid;
        const gameId = session.get('gameId');
        const name = session.get('name');
        const teamId = session.get('teamId');
        const customPlayerStatus = session.get('customPlayerStatus');
        const customProfile = session.get('customProfile');
        const matchAttributes = session.get('matchAttributes');
        const serverId = session.get('serverId');
        const playerInfo = {
            uid,
            gameId,
            name,
            teamId,
            customPlayerStatus,
            customProfile,
            matchAttributes,
        };
        const createPlayerParams = Object.assign({ isRobot: false }, playerInfo);
        const player = new Player_1.Player(createPlayerParams);
        // 找到channel、并加用户
        const channel = this.channelService.getChannel(rid);
        channel.add(playerInfo.uid, serverId);
        // 从Updater中找到目标room，并加入用户
        const room = Updater_1.default.findRoom(rid);
        room.addPlayer(player);
        // 将room信息保存在用户的session中
        session.set('room', rid);
        session.set('ownRoom', null);
        const sessionPushResult = await session.apushAll();
        if (sessionPushResult)
            console.error('gameHandler enterRoom session.apushAll for session service failed! error is : %j', sessionPushResult.stack);
        // 对房间内的所有成员广播onRoomAdd事件
        const param = playerInfo;
        channel.pushMessage('onRoomAdd', param);
        console.log(`[end] game.gameHandler.enterRoom uid = ${uid} success rid = ${rid}`);
        return {
            code: 200,
            message: "",
            data: room.getRoomInfo()
        };
    }
    /**
     * 房主修改房间信息
     * @param {Cola.Request.ChangeRoomMsg} msg 房间变更参数
     * @param {Object} session
     */
    async changeRoom(msg, session) {
        const name = msg === null || msg === void 0 ? void 0 : msg.name;
        const owner = msg === null || msg === void 0 ? void 0 : msg.owner;
        const isPrivate = msg === null || msg === void 0 ? void 0 : msg.isPrivate;
        const customProperties = msg === null || msg === void 0 ? void 0 : msg.customProperties;
        const isForbidJoin = msg === null || msg === void 0 ? void 0 : msg.isForbidJoin;
        const ownRoom = session.get("ownRoom");
        if (!ownRoom) {
            return {
                code: 500,
                message: "非房主无法修改房间信息",
                data: null
            };
        }
    }
    /**
     * 用户主动离开游戏房间(非大厅)
     * @param msg
     * @param session
     */
    async leaveRoom(msg, session) {
        let { rid } = msg;
        console.log(`[begin] game.gameHandler.leaveRoom uid = ${session.uid} rid = ${rid}`);
        const gameId = session.get("gameId");
        if (rid === gameId) {
            console.warn(`leaveRoom Warn(rid === gameId) rid = ${rid}`);
            return;
        }
        // 将该用户从房间内移除
        this.app.rpc.game.gameRemote.kick.route(session, true)(session.uid, this.app.get("serverId"), rid);
        console.log(`[end] game.gameHandler.leaveRoom uid = ${session.uid} rid = ${rid}`);
    }
}
exports.GameHandler = GameHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZUhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nYW1lL2hhbmRsZXIvZ2FtZUhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsK0JBQWtDO0FBQ2xDLHlEQUEwRTtBQUMxRSxxREFBaUU7QUFDakUscURBQThDO0FBRTlDLG1CQUF5QixHQUFnQjtJQUN2QyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsV0FBVztJQUd0QixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBQ2xDLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUE4QixFQUFFLE9BQXVCO1FBQ3hFLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsR0FBRyxDQUFDO1FBQ2pDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUM1QixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLElBQUksYUFBYSxRQUFRLElBQUksT0FBTyxhQUFhLE9BQU8sWUFBWSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqSSxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7WUFBRSxPQUFPO1FBRS9DLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdEQsTUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRCxNQUFNLEtBQUssR0FBeUI7WUFDbEMsR0FBRyxFQUFFLE9BQU87WUFDWixJQUFJLEVBQUUsT0FBTztZQUNiLE1BQU0sRUFBRSxPQUFPO1NBQ2hCLENBQUM7UUFDRixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNwQixNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUM7WUFDdEIsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsaURBQWlELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0gsY0FBYyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0QsT0FBTztZQUNMLElBQUksRUFBRSxHQUFHO1lBQ1QsT0FBTyxFQUFFLEVBQUU7WUFDWCxJQUFJLEVBQUU7Z0JBQ0osTUFBTSxFQUFFLElBQUk7YUFDYjtTQUNGLENBQUE7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBK0IsRUFBRSxPQUF1QjtRQUN2RSxhQUFhO1FBQ2IsTUFBTSxHQUFHLEdBQUcsU0FBSSxFQUFFLENBQUM7UUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2Q0FBNkMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDeEUsV0FBVztRQUNYLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDeEIsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNyQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckMsTUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDN0QsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNuRCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDdkQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6QyxNQUFNLFVBQVUsR0FBb0I7WUFDbEMsR0FBRztZQUNILE1BQU07WUFDTixJQUFJO1lBQ0osTUFBTTtZQUNOLGtCQUFrQjtZQUNsQixhQUFhO1lBQ2IsZUFBZTtTQUNoQixDQUFDO1FBQ0YsTUFBTSxrQkFBa0IsR0FBdUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM3RixNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBRTlDLGlCQUFpQjtRQUNqQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRXRDLFNBQVM7UUFDVCxNQUFNLGFBQWEsR0FBa0IsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUNqRCxHQUFHO1lBQ0gsS0FBSyxFQUFFLEdBQUc7WUFDVixVQUFVLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDcEIsT0FBTztTQUNSLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDUixNQUFNLElBQUksR0FBRyxJQUFJLFdBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVyQyxvQkFBb0I7UUFDcEIsaUJBQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTNCLHdCQUF3QjtRQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM1QixNQUFNLGlCQUFpQixHQUFRLE1BQU0sT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3hELElBQUksaUJBQWlCO1lBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxtRkFBbUYsRUFBRSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVuSixpQkFBaUI7UUFDakIsTUFBTSxlQUFlLEdBQStCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN2RSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzRCxXQUFXLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUV6RCxPQUFPLENBQUMsR0FBRyxDQUFDLDJDQUEyQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUV0RSxPQUFPO1lBQ0wsSUFBSSxFQUFFLEdBQUc7WUFDVCxPQUFPLEVBQUUsRUFBRTtZQUNYLElBQUksRUFBRSxlQUFlO1NBQ3RCLENBQUE7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBOEIsRUFBRSxPQUF1QjtRQUVyRSxPQUFPLENBQUMsR0FBRyxDQUFDLDRDQUE0QyxPQUFPLENBQUMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRXhGLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUM7UUFFbEIsa0JBQWtCO1FBQ2xCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFO1lBQ2IsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsT0FBTyxDQUFDLEdBQUcsV0FBVyxHQUFHLGVBQWUsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNsRixPQUFPO2dCQUNMLElBQUksRUFBRSxHQUFHO2dCQUNULE9BQU8sRUFBRSxVQUFVO2dCQUNuQixJQUFJLEVBQUUsSUFBSTthQUNYLENBQUE7U0FDRjtRQUVELFdBQVc7UUFDWCxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzdELE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDbkQsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFekMsTUFBTSxVQUFVLEdBQW9CO1lBQ2xDLEdBQUc7WUFDSCxNQUFNO1lBQ04sSUFBSTtZQUNKLE1BQU07WUFDTixrQkFBa0I7WUFDbEIsYUFBYTtZQUNiLGVBQWU7U0FDaEIsQ0FBQztRQUNGLE1BQU0sa0JBQWtCLEdBQXVCLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDN0YsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUU5QyxpQkFBaUI7UUFDakIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRXRDLDBCQUEwQjtRQUMxQixNQUFNLElBQUksR0FBRyxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXZCLHdCQUF3QjtRQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3QixNQUFNLGlCQUFpQixHQUFRLE1BQU0sT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3hELElBQUksaUJBQWlCO1lBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxrRkFBa0YsRUFBRSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVsSix5QkFBeUI7UUFDekIsTUFBTSxLQUFLLEdBQTRCLFVBQVUsQ0FBQztRQUNsRCxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QyxPQUFPLENBQUMsR0FBRyxDQUFDLDBDQUEwQyxHQUFHLGtCQUFrQixHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRWxGLE9BQU87WUFDTCxJQUFJLEVBQUUsR0FBRztZQUNULE9BQU8sRUFBRSxFQUFFO1lBQ1gsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUU7U0FDekIsQ0FBQTtJQUNILENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUErQixFQUFFLE9BQXVCO1FBQ3ZFLE1BQU0sSUFBSSxHQUFHLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxJQUFJLENBQUM7UUFDdkIsTUFBTSxLQUFLLEdBQUcsR0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFFLEtBQUssQ0FBQztRQUN6QixNQUFNLFNBQVMsR0FBRyxHQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUUsU0FBUyxDQUFDO1FBQ2pDLE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFFLGdCQUFnQixDQUFDO1FBQy9DLE1BQU0sWUFBWSxHQUFHLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxZQUFZLENBQUM7UUFDdkMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1osT0FBTztnQkFDTCxJQUFJLEVBQUUsR0FBRztnQkFDVCxPQUFPLEVBQUUsYUFBYTtnQkFDdEIsSUFBSSxFQUFFLElBQUk7YUFDWCxDQUFBO1NBQ0Y7SUFFSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBOEIsRUFBRSxPQUF1QjtRQUNyRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDO1FBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsNENBQTRDLE9BQU8sQ0FBQyxHQUFHLFVBQVUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNwRixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JDLElBQUksR0FBRyxLQUFLLE1BQU0sRUFBRTtZQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQzVELE9BQU87U0FDUjtRQUNELGFBQWE7UUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFbkcsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsT0FBTyxDQUFDLEdBQUcsVUFBVSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7Q0FDRjtBQTdORCxrQ0E2TkMifQ==