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
const updateInstance = Updater_1.getUpdateInstance();
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
        const rid = uuid_1.v4();
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
        // 从Updater中找到目标room，并加入用户
        const room = updateInstance.findRoom(rid);
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
                    await func_1.changeOtherPlayerSession(backendSession, newOwner.frontendId, newOwner.uid, (session, resolve) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZUhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nYW1lL2hhbmRsZXIvZ2FtZUhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsaURBQThDO0FBQzlDLCtCQUFrQztBQUNsQyx5REFBMEU7QUFDMUUscURBQWlFO0FBQ2pFLHFEQUE0RDtBQUM1RCw2Q0FBOEQ7QUFDOUQsMkRBQW9EO0FBRXBELE1BQU0sY0FBYyxHQUFHLDJCQUFpQixFQUFFLENBQUM7QUFFM0MsbUJBQXlCLEdBQWdCO0lBQ3ZDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxXQUFXO0lBR3RCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFDbEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQThCLEVBQUUsT0FBdUI7UUFDeEUsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxHQUFHLENBQUM7UUFDakMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQzVCLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsSUFBSSxhQUFhLFFBQVEsSUFBSSxPQUFPLGFBQWEsT0FBTyxZQUFZLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pJLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxD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