import { Application, ChannelService, BackendSessionService } from "pinus";
import { Cola } from "../../../../types/Cola";
import { getUpdateInstance } from "../../../domain/Updater";

const updateInstance = getUpdateInstance();

export default function (app: Application) {
  return new GameRemote(app);
}

export class GameRemote {
  private app: Application;
  private channelService: ChannelService;
  private backendSessionService: BackendSessionService;

  constructor(app: Application) {
    this.app = app;
    this.channelService = app.get("channelService");
    this.backendSessionService = app.get("backendSessionService");
  }

  /**
   * 将用户加入大厅channel
   * @param {Cola.PlayerInitInfo} playerInfo 玩家初始化信息
   * @param {string} gameId gameId作为大厅channel
   * @param {String} serverId Frontend Server Id
   */
  public async addToHall(playerInfo: Cola.PlayerInitInfo, gameId: string, serverId: string): Promise<Cola.Status> {
    return new Promise((resolve, _) => {
      console.log(`gameRemote addToHall playerInfo = ${JSON.stringify(playerInfo)} gameId = ${gameId} serverId = ${serverId}`);
      let flag = true;
      try {
        let channel = this.channelService.getChannel(gameId, true);
        const param: Cola.EventRes.OnHallAdd = playerInfo;
        channel.pushMessage("onHallAdd", param);
        channel.add(playerInfo.uid, serverId);
      } catch (e) {
        console.error(e);
        flag = false;
      } finally {
        const res = {
          status: flag,
        };
        resolve(res);
      }
    });
  }

  /**
   * 获取某频道内的所有玩家信息
   *
   * @param {String} channelName 房间名
   * @return {Array} 频道内的玩家信息数组
   *
   */
  public async get(channelName: string): Promise<Cola.PlayerInfo[]> {
    return new Promise(async (resolve, _) => {
      let userIds: any[] = [];
      let channel = this.channelService.getChannel(channelName);
      if (!!channel) {
        userIds = channel.getMembers();
      }
      console.log(`gameRemote.get userIds = ${JSON.stringify(userIds)}`);

      const userList: Cola.PlayerInfo[] = [];
      for (const uid of userIds) {
        let result: Cola.PlayerInfo = null;
        try {
          const targetServerId = channel.getMember(uid)["sid"];
          result = await this.getUserByUid(targetServerId, uid);
        } catch (e) {
          console.error(`this.getUserByUid fail`);
          console.error(e.message);
        } finally {
          userList.push(result);
        }
      }
      console.log(`channelName = ${channelName}, userList = ${JSON.stringify(userList)}`);
      resolve(userList);
    });
  }

  /**
   * 将用户踢出某频道
   *
   * @param {String} uid unique id for user
   * @param {String} sid Frontend Server Id
   * @param {String} rid channel name
   *
   */
  public async kick(uid: string, sid: string, rid: string) {
    const channel = this.channelService.getChannel(rid);
    console.log(`before channelMembers = ${JSON.stringify(channel.getMembers())}`);
    if (!!channel) {
      channel.leave(uid, sid);
    }

    const targetRoom = updateInstance.findRoom(rid);

    if (targetRoom) {
      targetRoom.removePlayer(uid);
      // 房间内无用户，则移除该房间
      if (targetRoom.playerList.length === 0) updateInstance.removeRoom(rid);
    }

    const param = {
      uid,
      rid,
    };
    console.log(`after channelMembers = ${JSON.stringify(channel.getMembers())}`);
    console.log(`[${uid}]被踢出频道，rid = [${rid}]，sid = ${sid}`);
    channel.pushMessage("onKick", param);
  }

  /**
   * 通过uid查询玩家信息
   * @param serverId Frontend Server Id
   * @param uid
   */
  public getUserByUid(serverId, uid): Promise<Cola.PlayerInfo> {
    console.log(`gameRemote getUserByUid serverId = ${serverId}, uid = ${uid}`);
    return new Promise((resolve, reject) => {
      this.backendSessionService.getByUid(serverId, uid, (err, result) => {
        console.log(`gameRemote backendSessionService.getByUid`);
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        const user: Cola.PlayerInfo = {
          uid: result[0].uid,
          gameId: result[0].settings.gameId,
          name: result[0].settings.name,
          teamId: result[0].settings.teamId,
          customPlayerStatus: result[0].settings.customPlayerStatus,
          customProfile: result[0].settings.customProfile,
          matchAttributes: result[0].settings.matchAttributes,
        };
        console.log(`promiseList user = ${JSON.stringify(user)}`);
        resolve(user);
      });
    });
  }

  /**
   * 移除房间
   * @param rid 房间id
   * @param cb 移除房间回调函数
   */
  public destroyRoom(rid: string, cb?: Function) {
    updateInstance.removeRoom(rid);
    if (cb) cb();
  }

  /**
   * 解散房间
   * 房间内全部成员都会收到一条解散房间广播 onDismissRoom
   * @param rid 房间id
   */
  public dismissRoom(rid: string) {
    try {
      const channelService = this.app.get("channelService");
      const channel = channelService.getChannel(rid);
      // 移除房间 -> 向该房间内所有成员广播解散房间 -> 销毁通信频道
      this.destroyRoom(rid, () => {
        channel.pushMessage("onDismissRoom", "dismissRoom");
        channelService.destroyChannel(rid);
      });
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * 检查房间帧同步是否开始
   * @param rid 房间id
   */
  public async checkRoomIsStartFrame(rid: string): Promise<Cola.FrameSyncState> {
    try {
      const room = updateInstance.findRoom(rid);
      if (!room) throw Error(`gameRemote.ts checkRoomIsStartFrame() 检查房间帧同步是否开始 找不到room rid: ${rid}`);
      return room.frameSyncState;
    } catch (e) {
      console.error(e);
    }
  }
}
