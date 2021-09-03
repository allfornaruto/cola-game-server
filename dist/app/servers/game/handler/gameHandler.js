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
        Updater_1.default.addRoom(rid, room);
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
        const room = Updater_1.default.findRoom(rid);
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
        const room = Updater_1.default.findRoom(ownRoom);
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
        const room = Updater_1.default.findRoom(rid);
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
        const room = Updater_1.default.findRoom(rid);
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
        const room = Updater_1.default.findRoom(rid);
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
        const room = Updater_1.default.findRoom(rid);
        if (room.frameSyncState === Cola_1.Cola.FrameSyncState.STOP) {
            return {
                code: 500,
                message: "房间未开始帧同步",
                data: null,
            };
        }
        Updater_1.default.addCommand(rid, new Command_1.default(uid, data, room.stepTime));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZUhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nYW1lL2hhbmRsZXIvZ2FtZUhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsaURBQThDO0FBQzlDLCtCQUFrQztBQUNsQyx5REFBMEU7QUFDMUUscURBQWlFO0FBQ2pFLHFEQUE4QztBQUM5Qyw2Q0FBOEQ7QUFDOUQsMkRBQW9EO0FBRXBELG1CQUF5QixHQUFnQjtJQUN2QyxPQUFPLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsV0FBVztJQUd0QixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBQ2xDLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUE4QixFQUFFLE9BQXVCO1FBQ3hFLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsR0FBRyxDQUFDO1FBQ2pDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUM1QixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLElBQUksYUFBYSxRQUFRLElBQUksT0FBTyxhQUFhLE9BQU8sWUFBWSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqSSxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUFFLE9BQU87UUFFN0MsTUFB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