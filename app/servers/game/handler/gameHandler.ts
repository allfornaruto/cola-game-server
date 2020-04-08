import { Application, BackendSession, ChannelService } from 'pinus';
import { Cola } from '../../../../types/Cola';
import { v4 as uuid } from "uuid";
import { CreatePlayerParams, Player } from "../../../domain/model/Player";
import { AddRoomParams, Room } from "../../../domain/model/Room";
import Updater from "../../../domain/Updater";

export default function (app: Application) {
  return new GameHandler(app);
}

export class GameHandler {
  private channelService: ChannelService;

  constructor(private app: Application) {
    this.channelService = app.get('channelService');
  }

  /**
   * 向用户发送消息
   * @param {Cola.Request.SendToClient} msg 消息体
   * @param {Object} session
   */
  async sendToClient(msg: Cola.Request.SendToClient, session: BackendSession): Promise<Cola.Response.SendToClient> {
    const { content, uidList } = msg;
    const room = session.get('room');
    const fromUid = session.uid;
    const fromName = session.get('name');
    console.log(`sendToClient room=${room} fromName=${fromName}[${fromUid}] content=${content} uidList=${JSON.stringify(uidList)} `);
    if (!uidList || (uidList.length === 0)) return;

    const channelService = this.app.get('channelService');
    const channel = channelService.getChannel(room);
    const param: Cola.EventRes.OnChat = {
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
    }
  }

  /**
   * 创建房间，返回房间信息
   * @param {Cola.Request.CreateRoomMsg} msg 创建房间请求参数
   * @param {Object} session
   */
  async createRoom(msg: Cola.Request.CreateRoomMsg, session: BackendSession): Promise<Cola.Response.CreateRoom> {
    // 随机一个roomId
    const rid = uuid();
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
    const playerInfo: Cola.PlayerInfo = {
      uid,
      gameId,
      name,
      teamId,
      customPlayerStatus,
      customProfile,
      matchAttributes,
    };
    const createPlayerParams: CreatePlayerParams = Object.assign({ isRobot: false }, playerInfo);
    const player = new Player(createPlayerParams);

    // 创建channel、并加用户
    const channel = this.channelService.getChannel(rid, true);
    channel.add(playerInfo.uid, serverId);

    // 创建room
    const addRoomParams: AddRoomParams = Object.assign({
      rid,
      owner: uid,
      playerList: [player],
      channel,
    }, msg);
    const room = new Room(addRoomParams);

    // 将room放入Updater中保存
    Updater.addRoom(rid, room);

    // 将room信息保存在用户的session中
    session.set('room', rid);
    session.set('ownRoom', rid);
    const sessionPushResult: any = await session.apushAll();
    if (sessionPushResult) console.error('gameHandler createRoom session.apushAll for session service failed! error is : %j', sessionPushResult.stack);

    // 向游戏大厅广播房间创建的消息
    const onRoomCreateMsg: Cola.EventRes.OnRoomCreate = room.getRoomInfo();
    const hallChannel = this.channelService.getChannel(gameId);
    hallChannel.pushMessage('onRoomCreate', onRoomCreateMsg);

    console.log(`[end] game.gameHandler.createRoom uid = ${session.uid}`);

    return {
      code: 200,
      message: '',
      data: onRoomCreateMsg
    }
  }

  /**
   * 进入房间，返回房间信息
   * @param {Cola.Request.ChatEnterRoomMsg} msg 进入房间请求参数
   * @param {Object} session
   */
  async enterRoom(msg: Cola.Request.EnterRoomMsg, session: BackendSession): Promise<Cola.Response.EnterRoom> {

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
      }
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

    const playerInfo: Cola.PlayerInfo = {
      uid,
      gameId,
      name,
      teamId,
      customPlayerStatus,
      customProfile,
      matchAttributes,
    };
    const createPlayerParams: CreatePlayerParams = Object.assign({ isRobot: false }, playerInfo);
    const player = new Player(createPlayerParams);

    // 找到channel、并加用户
    const channel = this.channelService.getChannel(rid);
    channel.add(playerInfo.uid, serverId);

    // 从Updater中找到目标room，并加入用户
    const room = Updater.findRoom(rid);
    room.addPlayer(player);

    // 将room信息保存在用户的session中
    session.set('room', rid);
    session.set('ownRoom', null);
    const sessionPushResult: any = await session.apushAll();
    if (sessionPushResult) console.error('gameHandler enterRoom session.apushAll for session service failed! error is : %j', sessionPushResult.stack);

    // 对房间内的所有成员广播onRoomAdd事件
    const param: Cola.EventRes.OnRoomAdd = playerInfo;
    channel.pushMessage('onRoomAdd', param);

    console.log(`[end] game.gameHandler.enterRoom uid = ${uid} success rid = ${rid}`);

    return {
      code: 200,
      message: "",
      data: room.getRoomInfo()
    }
  }

  /**
   * 房主修改房间信息
   * @param {Cola.Request.ChangeRoomMsg} msg 房间变更参数
   * @param {Object} session
   */
  async changeRoom(msg: Cola.Request.ChangeRoomMsg, session: BackendSession): Promise<Cola.Response.ChangeRoom> {
    const name = msg?.name;
    const owner = msg?.owner;
    const isPrivate = msg?.isPrivate;
    const customProperties = msg?.customProperties;
    const isForbidJoin = msg?.isForbidJoin;
    const ownRoom = session.get("ownRoom");
    if (!ownRoom) {
      return {
        code: 500,
        message: "非房主无法修改房间信息",
        data: null
      }
    }

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
}
