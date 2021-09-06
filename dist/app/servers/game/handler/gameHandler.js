"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameHandler = void 0;
const Cola_1 = require("../../../../types/Cola");
const uuid_1 = require("uuid");
const Player_1 = require("../../../domain/model/Player");
const Room_1 = require("../../../domain/model/Room");
const Updater_1 = require("../../../domain/Updater");
const func_1 = require("../../../util/func");
const Command_1 = require("../../../domain/model/Command");
const updateInstance = (0, Updater_1.getUpdateInstance)();
function default_1(app) {
    return new GameHandler(app);
}
exports.default = default_1;
class GameHandler {
    constructor(app) {
        this.app = app;
        this.channelService = app.get("channelService");
    }
    /**
     * 向用户发送消息
     * @param {Cola.Request.SendToClient} msg 消息体
     * @param {Object} session
     */
    async sendToClient(msg, session) {
        const { content, uidList } = msg;
        const room = session.get("room");
        const fromUid = session.uid;
        const fromName = session.get("name");
        console.log(`sendToClient room=${room} fromName=${fromName}[${fromUid}] content=${content} uidList=${JSON.stringify(uidList)} `);
        if (!uidList || uidList.length === 0)
            return;
        const channelService = this.app.get("channelService");
        const channel = channelService.getChannel(room);
        const param = {
            msg: content,
            from: fromUid,
            target: uidList,
        };
        const pushArr = [];
        uidList.forEach(uid => {
            const targetUid = uid;
            const targetServerId = channel.getMember(targetUid)["sid"];
            pushArr.push({ uid: targetUid, sid: targetServerId });
        });
        console.log(`sendToClient pushMessageByUids onChat param = ${JSON.stringify(param)} pushArr = ${JSON.stringify(uidList)}`);
        channelService.pushMessageByUids("onChat", param, pushArr);
        return {
            code: 200,
            message: "",
            data: {
                status: true,
            },
        };
    }
    /**
     * 创建房间，返回房间信息
     * @param {Cola.Request.CreateRoomMsg} msg 创建房间请求参数
     * @param {Object} session
     */
    async createRoom(msg, session) {
        const playerInfoExtra = msg.playerInfoExtra;
        // 随机一个roomId
        const rid = (0, uuid_1.v4)();
        console.log(`[begin] game.gameHandler.createRoom uid = ${session.uid}`);
        // 创建player
        const uid = session.uid;
        const gameId = session.get("gameId");
        const name = session.get("name");
        const serverId = session.get("serverId");
        const teamId = playerInfoExtra.teamId;
        const customPlayerStatus = playerInfoExtra.customPlayerStatus;
        const customProfile = playerInfoExtra.customProfile;
        const matchAttributes = playerInfoExtra.matchAttributes;
        session.set("teamId", teamId);
        session.set("customPlayerStatus", customPlayerStatus);
        session.set("customProfile", customProfile);
        session.set("matchAttributes", matchAttributes);
        const sessionPushPlayerInfoExtraResult = await session.apushAll();
        if (sessionPushPlayerInfoExtraResult)
            console.error("game.gameHandler.createRoom sessionPushPlayerInfoExtraResult failed! error is : %j", sessionPushPlayerInfoExtraResult.stack);
        const playerInfo = {
            uid,
            gameId,
            name,
            teamId,
            customPlayerStatus,
            customProfile,
            matchAttributes,
        };
        const createPlayerParams = Object.assign({ isRobot: false, frontendId: serverId }, playerInfo);
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
        updateInstance.addRoom(rid, room);
        // 将room信息保存在用户的session中
        session.set("room", rid);
        session.set("ownRoom", rid);
        const sessionPushResult = await session.apushAll();
        if (sessionPushResult)
            console.error("gameHandler createRoom sessionPushResult failed! error is : %j", sessionPushResult.stack);
        // 向游戏大厅广播房间创建的消息
        const onRoomCreateMsg = room.getRoomInfo();
        const hallChannel = this.channelService.getChannel(gameId);
        hallChannel.pushMessage("onRoomCreate", onRoomCreateMsg);
        console.log(`[end] game.gameHandler.createRoom uid = ${session.uid}`);
        return {
            code: 200,
            message: "",
            data: onRoomCreateMsg,
        };
    }
    /**
     * 进入房间，返回房间信息
     * @param {Cola.Request.ChatEnterRoomMsg} msg 进入房间请求参数
     * @param {Object} session
     */
    async enterRoom(msg, session) {
        console.log(`[begin] game.gameHandler.enterRoom uid = ${session.uid} rid = ${msg.rid}`);
        const playerInfoExtra = msg.playerInfoExtra;
        session.set("teamId", playerInfoExtra.teamId);
        session.set("customPlayerStatus", playerInfoExtra.customPlayerStatus);
        session.set("customProfile", playerInfoExtra.customProfile);
        session.set("matchAttributes", playerInfoExtra.matchAttributes);
        const sessionPushPlayerInfoExtraResult = await session.apushAll();
        if (sessionPushPlayerInfoExtraResult)
            console.error("game.gameHandler.createRoom sessionPushPlayerInfoExtraResult failed! error is : %j", sessionPushPlayerInfoExtraResult.stack);
        let { rid } = msg;
        // 从Updater中找到目标room
        const room = updateInstance.findRoom(rid);
        if (room.isForbidJoin) {
            console.warn(`uid = ${session.uid}, rid = ${rid}, room.isForbidJoin = true`);
            return {
                code: 500,
                message: `房主拒绝用户进入房间`,
                data: null,
            };
        }
        // 先查询用户是否已经在目标房间内
        const userRid = session.get("room");
        if (!!userRid) {
            console.warn(`该用户已进入房间，uid = ${session.uid}, rid = ${rid}, userRid = ${userRid}`);
            return {
                code: 500,
                message: `该用户已进入房间`,
                data: null,
            };
        }
        // 创建player
        const uid = session.uid;
        const gameId = session.get("gameId");
        const name = session.get("name");
        const teamId = session.get("teamId");
        const customPlayerStatus = session.get("customPlayerStatus");
        const customProfile = session.get("customProfile");
        const matchAttributes = session.get("matchAttributes");
        const serverId = session.get("serverId");
        const playerInfo = {
            uid,
            gameId,
            name,
            teamId,
            customPlayerStatus,
            customProfile,
            matchAttributes,
        };
        const createPlayerParams = Object.assign({ isRobot: false, frontendId: serverId }, playerInfo);
        const player = new Player_1.Player(createPlayerParams);
        // 找到channel、并加用户
        const channel = this.channelService.getChannel(rid);
        channel.add(playerInfo.uid, serverId);
        room.addPlayer(player);
        // 将room信息保存在用户的session中
        session.set("room", rid);
        session.set("ownRoom", null);
        const sessionPushResult = await session.apushAll();
        if (sessionPushResult)
            console.error("gameHandler enterRoom session.apushAll for session service failed! error is : %j", sessionPushResult.stack);
        // 对房间内的所有成员广播onRoomAdd事件
        const param = playerInfo;
        channel.pushMessage("onRoomAdd", param);
        console.log(`[end] game.gameHandler.enterRoom uid = ${uid} success rid = ${rid}`);
        return {
            code: 200,
            message: "",
            data: room.getRoomInfo(),
        };
    }
    /**
     * 房主修改房间信息
     * @description 修改成功后，房间内全部成员都会收到一条修改房间广播 onChangeRoom，Room实例将更新。
     * @description 只有房主有权限修改房间
     * @param {Cola.Request.ChangeRoomMsg} msg 房间变更参数
     * @param {Object} session
     */
    async changeRoom(msg, session) {
        const ownRoom = session.get("ownRoom");
        if (!ownRoom) {
            return {
                code: 500,
                message: "非房主无法修改房间信息",
                data: null,
            };
        }
        // 从Updater中找到目标room
        const room = updateInstance.findRoom(ownRoom);
        // 如果涉及到房主变更，需要修改新/旧房主的session ownRoom字段
        const owner = msg === null || msg === void 0 ? void 0 : msg.owner;
        if (!!owner) {
            const backendSession = this.app.get("backendSessionService");
            const newOwner = room.findPlayer(owner);
            // 确认新房主在房间中
            if (!!newOwner) {
                // 删除旧房主的ownRoom
                session.set("ownRoom", null);
                // 更新新房主的ownRoom
                try {
                    await (0, func_1.changeOtherPlayerSession)(backendSession, newOwner.frontendId, newOwner.uid, (session, resolve) => {
                        session.set("ownRoom", ownRoom);
                        resolve();
                    });
                }
                catch (e) {
                    console.error(`gameHandler changeRoom changeOtherPlayerSession fail frontendId = ${newOwner.frontendId} uid = ${newOwner.uid}`, e);
                    // 还原旧房主
                    session.set("ownRoom", ownRoom);
                }
            }
        }
        // 修改房间信息
        const newRoomInfo = room.changeRoomInfo(msg);
        // 向该房间内所有成员广播房间信息变化事件
        const channelService = this.app.get("channelService");
        const channel = channelService.getChannel(ownRoom);
        const param = newRoomInfo;
        channel.pushMessage("onChangeRoom", param);
        return {
            code: 200,
            message: "",
            data: newRoomInfo,
        };
    }
    /**
     * 玩家修改自定义状态
     * @description 修改玩家状态是修改 Player 中的 customPlayerStatus 字段，玩家的状态由开发者自定义。
     * @description 修改成功后，房间内全部成员都会收到一条修改玩家状态广播 onChangeCustomPlayerStatus，Room实例将更新。
     * @param {Cola.Request.ChangeCustomPlayerStatus} msg 修改自定义状态参数
     * @param {BackendSession} session
     */
    async changeCustomPlayerStatus(msg, session) {
        const customPlayerStatus = msg.customPlayerStatus;
        // 从Updater中找到目标room
        const uid = session.uid;
        const rid = session.get("room");
        const room = updateInstance.findRoom(rid);
        // 修改房间内玩家自定义状态
        room.changePlayerInfo(uid, customPlayerStatus);
        const newRoomInfo = room.getRoomInfo();
        // 向该房间内所有成员广播房间信息变化事件
        const channelService = this.app.get("channelService");
        const channel = channelService.getChannel(rid);
        const param = {
            customPlayerStatus,
            changePlayerId: uid,
            roomInfo: newRoomInfo,
        };
        channel.pushMessage("onChangeCustomPlayerStatus", param);
        return {
            code: 200,
            message: "",
            data: {
                status: true,
            },
        };
    }
    /**
     * 开始帧同步
     * 房间内任意一个玩家成功调用该接口将导致全部玩家开始接收帧广播
     * 调用成功后房间内全部成员将收到 onStartFrameSync 广播。该接口会修改房间帧同步状态为“已开始帧同步”
     * @param {Cola.Request.StartFrameSync} msg 开始帧同步参数
     * @param {BackendSession} session
     */
    async startFrameSync(msg, session) {
        // 从Updater中找到目标room
        const rid = session.get("room");
        const room = updateInstance.findRoom(rid);
        // 开始帧同步
        room.startFrameSync();
        return {
            code: 200,
            message: "",
            data: {
                status: true,
            },
        };
    }
    /**
     * 停止帧同步
     * 房间内任意一个玩家成功调用该接口将导致全部玩家停止接收帧广播
     * 调用成功后房间内全部成员将收到 onStopFrameSync 广播。该接口会修改房间帧同步状态为“已停止帧同步”
     * @param {Cola.Request.StopFrameSync} msg 停止帧同步参数
     * @param {BackendSession} session
     */
    async stopFrameSync(msg, session) {
        // 从Updater中找到目标room
        const rid = session.get("room");
        const room = updateInstance.findRoom(rid);
        // 停止帧同步
        room.stopFrameSync();
        return {
            code: 200,
            message: "",
            data: {
                status: true,
            },
        };
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
    /**
     * 发送帧同步数据
     * @param msg
     * @param session
     */
    async sendFrame(msg, session) {
        const { data } = msg;
        console.log(`发送帧同步数据 data=${data}`);
        // 从Updater中找到目标room
        const uid = session.uid;
        const rid = session.get("room");
        const room = updateInstance.findRoom(rid);
        if (room.frameSyncState === Cola_1.Cola.FrameSyncState.STOP) {
            return {
                code: 500,
                message: "房间未开始帧同步",
                data: null,
            };
        }
        updateInstance.addCommand(rid, new Command_1.default(uid, data, room.stepTime));
        return {
            code: 200,
            message: "",
            data: {
                status: true,
            },
        };
    }
}
exports.GameHandler = GameHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZUhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nYW1lL2hhbmRsZXIvZ2FtZUhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsaURBQThDO0FBQzlDLCtCQUFrQztBQUNsQyx5REFBMEU7QUFDMUUscURBQWlFO0FBQ2pFLHFEQUE0RDtBQUM1RCw2Q0FBOEQ7QUFDOUQsMkRBQW9EO0FBRXBELE1BQU0sY0FBYyxHQUFHLElBQUEsMkJBQWlCLEdBQUUsQ0FBQztBQUUzQyxtQkFBeUIsR0FBZ0I7SUFDdkMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRkQsNEJBRUM7QUFFRCxNQUFhLFdBQVc7SUFHdEIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQUNsQyxJQUFJLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBOEIsRUFBRSxPQUF1QjtRQUN4RSxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQztRQUNqQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDNUIsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixJQUFJLGFBQWEsUUFBUSxJQUFJLE9BQU8sYUFBYSxPQUFPLFlBQVksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakksSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUM7WUFBRSxPQUFPO1FBRTdDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdEQsTUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRCxNQUFNLEtBQUssR0FBeUI7WUFDbEMsR0FBRyxFQUFFLE9BQU87WUFDWixJQUFJLEVBQUUsT0FBTztZQUNiLE1BQU0sRUFBRSxPQUFPO1NBQ2hCLENBQUM7UUFDRixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNwQixNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUM7WUFDdEIsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsaURBQWlELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0gsY0FBYyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0QsT0FBTztZQUNMLElBQUksRUFBRSxHQUFHO1lBQ1QsT0FBTyxFQUFFLEVBQUU7WUFDWCxJQUFJLEVBQUU7Z0JBQ0osTUFBTSxFQUFFLElBQUk7YUFDYjtTQUNGLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBK0IsRUFBRSxPQUF1QjtRQUN2RSxNQUFNLGVBQWUsR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDO1FBQzVDLGFBQWE7UUFDYixNQUFNLEdBQUcsR0FBRyxJQUFBLFNBQUksR0FBRSxDQUFDO1FBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkNBQTZDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3hFLFdBQVc7UUFDWCxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqQyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUM7UUFDdEMsTUFBTSxrQkFBa0IsR0FBRyxlQUFlLENBQUMsa0JBQWtCLENBQUM7UUFDOUQsTUFBTSxhQUFhLEdBQUcsZUFBZSxDQUFDLGFBQWEsQ0FBQztRQUNwRCxNQUFNLGVBQWUsR0FBRyxlQUFlLENBQUMsZUFBZSxDQUFDO1FBRXhELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUN0RCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUM1QyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sZ0NBQWdDLEdBQVEsTUFBTSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdkUsSUFBSSxnQ0FBZ0M7WUFDbEMsT0FBTyxDQUFDLEtBQUssQ0FDWCxvRkFBb0YsRUFDcEYsZ0NBQWdDLENBQUMsS0FBSyxDQUN2QyxDQUFDO1FBRUosTUFBTSxVQUFVLEdBQW9CO1lBQ2xDLEdBQUc7WUFDSCxNQUFNO1lBQ04sSUFBSTtZQUNKLE1BQU07WUFDTixrQkFBa0I7WUFDbEIsYUFBYTtZQUNiLGVBQWU7U0FDaEIsQ0FBQztRQUNGLE1BQU0sa0JBQWtCLEdBQXVCLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNuSCxNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBRTlDLGlCQUFpQjtRQUNqQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRXRDLFNBQVM7UUFDVCxNQUFNLGFBQWEsR0FBa0IsTUFBTSxDQUFDLE1BQU0sQ0FDaEQ7WUFDRSxHQUFHO1lBQ0gsS0FBSyxFQUFFLEdBQUc7WUFDVixVQUFVLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDcEIsT0FBTztTQUNSLEVBQ0QsR0FBRyxDQUNKLENBQUM7UUFDRixNQUFNLElBQUksR0FBRyxJQUFJLFdBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVyQyxvQkFBb0I7UUFDcEIsY0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFbEMsd0JBQXdCO1FBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLE1BQU0saUJBQWlCLEdBQVEsTUFBTSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDeEQsSUFBSSxpQkFBaUI7WUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLGdFQUFnRSxFQUFFLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWhJLGlCQUFpQjtRQUNqQixNQUFNLGVBQWUsR0FBK0IsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3ZFLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNELFdBQVcsQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRXpELE9BQU8sQ0FBQyxHQUFHLENBQUMsMkNBQTJDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRXRFLE9BQU87WUFDTCxJQUFJLEVBQUUsR0FBRztZQUNULE9BQU8sRUFBRSxFQUFFO1lBQ1gsSUFBSSxFQUFFLGVBQWU7U0FDdEIsQ0FBQztJQUNKLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUE4QixFQUFFLE9BQXVCO1FBQ3JFLE9BQU8sQ0FBQyxHQUFHLENBQUMsNENBQTRDLE9BQU8sQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFFeEYsTUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQztRQUM1QyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxlQUFlLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUN0RSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDNUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDaEUsTUFBTSxnQ0FBZ0MsR0FBUSxNQUFNLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN2RSxJQUFJLGdDQUFnQztZQUNsQyxPQUFPLENBQUMsS0FBSyxDQUNYLG9GQUFvRixFQUNwRixnQ0FBZ0MsQ0FBQyxLQUFLLENBQ3ZDLENBQUM7UUFFSixJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDO1FBRWxCLG9CQUFvQjtRQUNwQixNQUFNLElBQUksR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFDLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsT0FBTyxDQUFDLEdBQUcsV0FBVyxHQUFHLDRCQUE0QixDQUFDLENBQUM7WUFDN0UsT0FBTztnQkFDTCxJQUFJLEVBQUUsR0FBRztnQkFDVCxPQUFPLEVBQUUsWUFBWTtnQkFDckIsSUFBSSxFQUFFLElBQUk7YUFDWCxDQUFDO1NBQ0g7UUFFRCxrQkFBa0I7UUFDbEIsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUU7WUFDYixPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixPQUFPLENBQUMsR0FBRyxXQUFXLEdBQUcsZUFBZSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ2xGLE9BQU87Z0JBQ0wsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsT0FBTyxFQUFFLFVBQVU7Z0JBQ25CLElBQUksRUFBRSxJQUFJO2FBQ1gsQ0FBQztTQUNIO1FBRUQsV0FBVztRQUNYLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDeEIsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNyQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckMsTUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDN0QsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNuRCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDdkQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV6QyxNQUFNLFVBQVUsR0FBb0I7WUFDbEMsR0FBRztZQUNILE1BQU07WUFDTixJQUFJO1lBQ0osTUFBTTtZQUNOLGtCQUFrQjtZQUNsQixhQUFhO1lBQ2IsZUFBZTtTQUNoQixDQUFDO1FBQ0YsTUFBTSxrQkFBa0IsR0FBdUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ25ILE1BQU0sTUFBTSxHQUFHLElBQUksZUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFFOUMsaUJBQWlCO1FBQ2pCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BELE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUV0QyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXZCLHdCQUF3QjtRQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3QixNQUFNLGlCQUFpQixHQUFRLE1BQU0sT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3hELElBQUksaUJBQWlCO1lBQ25CLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0ZBQWtGLEVBQUUsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFN0gseUJBQXlCO1FBQ3pCLE1BQU0sS0FBSyxHQUE0QixVQUFVLENBQUM7UUFDbEQsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsR0FBRyxrQkFBa0IsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUVsRixPQUFPO1lBQ0wsSUFBSSxFQUFFLEdBQUc7WUFDVCxPQUFPLEVBQUUsRUFBRTtZQUNYLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO1NBQ3pCLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUErQixFQUFFLE9BQXVCO1FBQ3ZFLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNaLE9BQU87Z0JBQ0wsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsT0FBTyxFQUFFLGFBQWE7Z0JBQ3RCLElBQUksRUFBRSxJQUFJO2FBQ1gsQ0FBQztTQUNIO1FBRUQsb0JBQW9CO1FBQ3BCLE1BQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFOUMsd0NBQXdDO1FBQ3hDLE1BQU0sS0FBSyxHQUFHLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxLQUFLLENBQUM7UUFDekIsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQ1gsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUM3RCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLFlBQVk7WUFDWixJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2QsZ0JBQWdCO2dCQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDN0IsZ0JBQWdCO2dCQUNoQixJQUFJO29CQUNGLE1BQU0sSUFBQSwrQkFBd0IsRUFBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFO3dCQUNyRyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQzt3QkFDaEMsT0FBTyxFQUFFLENBQUM7b0JBQ1osQ0FBQyxDQUFDLENBQUM7aUJBQ0o7Z0JBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FDWCxxRUFBcUUsUUFBUSxDQUFDLFVBQVUsVUFBVSxRQUFRLENBQUMsR0FBRyxFQUFFLEVBQ2hILENBQUMsQ0FDRixDQUFDO29CQUNGLFFBQVE7b0JBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7aUJBQ2pDO2FBQ0Y7U0FDRjtRQUVELFNBQVM7UUFDVCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTdDLHNCQUFzQjtRQUN0QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sT0FBTyxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkQsTUFBTSxLQUFLLEdBQStCLFdBQVcsQ0FBQztRQUN0RCxPQUFPLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUUzQyxPQUFPO1lBQ0wsSUFBSSxFQUFFLEdBQUc7WUFDVCxPQUFPLEVBQUUsRUFBRTtZQUNYLElBQUksRUFBRSxXQUFXO1NBQ2xCLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLHdCQUF3QixDQUM1QixHQUEwQyxFQUMxQyxPQUF1QjtRQUV2QixNQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQztRQUNsRCxvQkFBb0I7UUFDcEIsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUN4QixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFMUMsZUFBZTtRQUNmLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUMvQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFdkMsc0JBQXNCO1FBQ3RCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdEQsTUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQyxNQUFNLEtBQUssR0FBNkM7WUFDdEQsa0JBQWtCO1lBQ2xCLGNBQWMsRUFBRSxHQUFHO1lBQ25CLFFBQVEsRUFBRSxXQUFXO1NBQ3RCLENBQUM7UUFDRixPQUFPLENBQUMsV0FBVyxDQUFDLDRCQUE0QixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXpELE9BQU87WUFDTCxJQUFJLEVBQUUsR0FBRztZQUNULE9BQU8sRUFBRSxFQUFFO1lBQ1gsSUFBSSxFQUFFO2dCQUNKLE1BQU0sRUFBRSxJQUFJO2FBQ2I7U0FDRixDQUFDO0lBQ0osQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBZ0MsRUFBRSxPQUF1QjtRQUM1RSxvQkFBb0I7UUFDcEIsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoQyxNQUFNLElBQUksR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTFDLFFBQVE7UUFDUixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFdEIsT0FBTztZQUNMLElBQUksRUFBRSxHQUFHO1lBQ1QsT0FBTyxFQUFFLEVBQUU7WUFDWCxJQUFJLEVBQUU7Z0JBQ0osTUFBTSxFQUFFLElBQUk7YUFDYjtTQUNGLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUErQixFQUFFLE9BQXVCO1FBQzFFLG9CQUFvQjtRQUNwQixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFMUMsUUFBUTtRQUNSLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUVyQixPQUFPO1lBQ0wsSUFBSSxFQUFFLEdBQUc7WUFDVCxPQUFPLEVBQUUsRUFBRTtZQUNYLElBQUksRUFBRTtnQkFDSixNQUFNLEVBQUUsSUFBSTthQUNiO1NBQ0YsQ0FBQztJQUNKLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUE4QixFQUFFLE9BQXVCO1FBQ3JFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUM7UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0Q0FBNEMsT0FBTyxDQUFDLEdBQUcsVUFBVSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3BGLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckMsSUFBSSxHQUFHLEtBQUssTUFBTSxFQUFFO1lBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0NBQXdDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDNUQsT0FBTztTQUNSO1FBQ0QsYUFBYTtRQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVuRyxPQUFPLENBQUMsR0FBRyxDQUFDLDBDQUEwQyxPQUFPLENBQUMsR0FBRyxVQUFVLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQTJCLEVBQUUsT0FBdUI7UUFDbEUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQztRQUVyQixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRXBDLG9CQUFvQjtRQUNwQixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQ3hCLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEMsTUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUUxQyxJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssV0FBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUU7WUFDcEQsT0FBTztnQkFDTCxJQUFJLEVBQUUsR0FBRztnQkFDVCxPQUFPLEVBQUUsVUFBVTtnQkFDbkIsSUFBSSxFQUFFLElBQUk7YUFDWCxDQUFDO1NBQ0g7UUFFRCxjQUFjLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxJQUFJLGlCQUFPLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUV0RSxPQUFPO1lBQ0wsSUFBSSxFQUFFLEdBQUc7WUFDVCxPQUFPLEVBQUUsRUFBRTtZQUNYLElBQUksRUFBRTtnQkFDSixNQUFNLEVBQUUsSUFBSTthQUNiO1NBQ0YsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQXBhRCxrQ0FvYUMifQ==