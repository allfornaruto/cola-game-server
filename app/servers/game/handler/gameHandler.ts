import { Application, BackendSession, ChannelService } from "pinus";
import { Cola } from "../../../../types/Cola";
import { v4 as uuid } from "uuid";
import { CreatePlayerParams, Player } from "../../../domain/model/Player";
import { AddRoomParams, Room } from "../../../domain/model/Room";
import Updater from "../../../domain/Updater";
import { changeOtherPlayerSession } from "../../../util/func";
import Command from "../../../domain/model/Command";

export default function (app: Application) {
  return new GameHandler(app);
}

export class GameHandler {
  private channelService: ChannelService;

  constructor(private app: Application) {
    this.channelService = app.get("channelService");
  }

  /**
   * 向用户发送消息
   * @param {Cola.Request.SendToClient} msg 消息体
   * @param {Object} session
   */
  async sendToClient(msg: Cola.Request.SendToClient, session: BackendSession): Promise<Cola.Response.SendToClient> {
    const { content, uidList } = msg;
    const room = session.get("room");
    const fromUid = session.uid;
    const fromName = session.get("name");
    console.log(`sendToClient room=${room} fromName=${fromName}[${fromUid}] content=${content} uidList=${JSON.stringify(uidList)} `);
    if (!uidList || uidList.length === 0) return;

    const channelService = this.app.get("channelService");
    const channel = channelService.getChannel(room);
    const param: Cola.EventRes.OnChat = {
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
  async createRoom(msg: Cola.Request.CreateRoomMsg, session: BackendSession): Promise<Cola.Response.CreateRoom> {
    const playerInfoExtra = msg.playerInfoExtra;
    // 随机一个roomId
    const rid = uuid();
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
    const sessionPushPlayerInfoExtraResult: any = await session.apushAll();
    if (sessionPushPlayerInfoExtraResult)
      console.error(
        "game.gameHandler.createRoom sessionPushPlayerInfoExtraResult failed! error is : %j",
        sessionPushPlayerInfoExtraResult.stack
      );

    const playerInfo: Cola.PlayerInfo = {
      uid,
      gameId,
      name,
      teamId,
      customPlayerStatus,
      customProfile,
      matchAttributes,
    };
    const createPlayerParams: CreatePlayerParams = Object.assign({ isRobot: false, frontendId: serverId }, playerInfo);
    const player = new Player(createPlayerParams);

    // 创建channel、并加用户
    const channel = this.channelService.getChannel(rid, true);
    channel.add(playerInfo.uid, serverId);

    // 创建room
    const addRoomParams: AddRoomParams = Object.assign(
      {
        rid,
        owner: uid,
        playerList: [player],
        channel,
      },
      msg
    );
    const room = new Room(addRoomParams);

    // 将room放入Updater中保存
    Updater.addRoom(rid, room);

    // 将room信息保存在用户的session中
    session.set("room", rid);
    session.set("ownRoom", rid);
    const sessionPushResult: any = await session.apushAll();
    if (sessionPushResult) console.error("gameHandler createRoom sessionPushResult failed! error is : %j", sessionPushResult.stack);

    // 向游戏大厅广播房间创建的消息
    const onRoomCreateMsg: Cola.EventRes.OnRoomCreate = room.getRoomInfo();
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
  async enterRoom(msg: Cola.Request.EnterRoomMsg, session: BackendSession): Promise<Cola.Response.EnterRoom> {
    console.log(`[begin] game.gameHandler.enterRoom uid = ${session.uid} rid = ${msg.rid}`);

    const playerInfoExtra = msg.playerInfoExtra;
    session.set("teamId", playerInfoExtra.teamId);
    session.set("customPlayerStatus", playerInfoExtra.customPlayerStatus);
    session.set("customProfile", playerInfoExtra.customProfile);
    session.set("matchAttributes", playerInfoExtra.matchAttributes);
    const sessionPushPlayerInfoExtraResult: any = await session.apushAll();
    if (sessionPushPlayerInfoExtraResult)
      console.error(
        "game.gameHandler.createRoom sessionPushPlayerInfoExtraResult failed! error is : %j",
        sessionPushPlayerInfoExtraResult.stack
      );

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

    const playerInfo: Cola.PlayerInfo = {
      uid,
      gameId,
      name,
      teamId,
      customPlayerStatus,
      customProfile,
      matchAttributes,
    };
    const createPlayerParams: CreatePlayerParams = Object.assign({ isRobot: false, frontendId: serverId }, playerInfo);
    const player = new Player(createPlayerParams);

    // 找到channel、并加用户
    const channel = this.channelService.getChannel(rid);
    channel.add(playerInfo.uid, serverId);

    // 从Updater中找到目标room，并加入用户
    const room = Updater.findRoom(rid);
    room.addPlayer(player);

    // 将room信息保存在用户的session中
    session.set("room", rid);
    session.set("ownRoom", null);
    const sessionPushResult: any = await session.apushAll();
    if (sessionPushResult)
      console.error("gameHandler enterRoom session.apushAll for session service failed! error is : %j", sessionPushResult.stack);

    // 对房间内的所有成员广播onRoomAdd事件
    const param: Cola.EventRes.OnRoomAdd = playerInfo;
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
  async changeRoom(msg: Cola.Request.ChangeRoomMsg, session: BackendSession): Promise<Cola.Response.ChangeRoom> {
    const ownRoom = session.get("ownRoom");
    if (!ownRoom) {
      return {
        code: 500,
        message: "非房主无法修改房间信息",
        data: null,
      };
    }

    // 从Updater中找到目标room
    const room = Updater.findRoom(ownRoom);

    // 如果涉及到房主变更，需要修改新/旧房主的session ownRoom字段
    const owner = msg?.owner;
    if (!!owner) {
      const backendSession = this.app.get("backendSessionService");
      const newOwner = room.findPlayer(owner);
      // 确认新房主在房间中
      if (!!newOwner) {
        // 删除旧房主的ownRoom
        session.set("ownRoom", null);
        // 更新新房主的ownRoom
        try {
          await changeOtherPlayerSession(backendSession, newOwner.frontendId, newOwner.uid, (session, resolve) => {
            session.set("ownRoom", ownRoom);
            resolve();
          });
        } catch (e) {
          console.error(
            `gameHandler changeRoom changeOtherPlayerSession fail frontendId = ${newOwner.frontendId} uid = ${newOwner.uid}`,
            e
          );
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
    const param: Cola.EventRes.OnChangeRoom = newRoomInfo;
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
  async changeCustomPlayerStatus(
    msg: Cola.Request.ChangeCustomPlayerStatus,
    session: BackendSession
  ): Promise<Cola.Response.ChangeCustomPlayerStatus> {
    const customPlayerStatus = msg.customPlayerStatus;
    // 从Updater中找到目标room
    const uid = session.uid;
    const rid = session.get("room");
    const room = Updater.findRoom(rid);

    // 修改房间内玩家自定义状态
    room.changePlayerInfo(uid, customPlayerStatus);
    const newRoomInfo = room.getRoomInfo();

    // 向该房间内所有成员广播房间信息变化事件
    const channelService = this.app.get("channelService");
    const channel = channelService.getChannel(rid);
    const param: Cola.EventRes.OnChangeCustomPlayerStatus = {
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
  async startFrameSync(msg: Cola.Request.StartFrameSync, session: BackendSession): Promise<Cola.Response.StartFrameSync> {
    // 从Updater中找到目标room
    const rid = session.get("room");
    const room = Updater.findRoom(rid);

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
  async stopFrameSync(msg: Cola.Request.StopFrameSync, session: BackendSession): Promise<Cola.Response.StopFrameSync> {
    // 从Updater中找到目标room
    const rid = session.get("room");
    const room = Updater.findRoom(rid);

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
  async leaveRoom(msg: Cola.Request.LeaveRoomMsg, session: BackendSession) {
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
  async sendFrame(msg: Cola.Request.SendFrame, session: BackendSession): Promise<Cola.Response.SendFrame> {
    const { data } = msg;

    console.log(`发送帧同步数据 data=${data}`);

    // 从Updater中找到目标room
    const uid = session.uid;
    const rid = session.get("room");
    const room = Updater.findRoom(rid);

    if (room.frameSyncState === Cola.FrameSyncState.STOP) {
      return {
        code: 500,
        message: "房间未开始帧同步",
        data: null,
      };
    }

    Updater.addCommand(rid, new Command(uid, data, room.stepTime));

    return {
      code: 200,
      message: "",
      data: {
        status: true,
      },
    };
  }
}
