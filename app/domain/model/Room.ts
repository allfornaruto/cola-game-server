import { Channel } from "pinus";
import Command from "./Command";
import { Player } from "./Player";
import { v4 as uuid } from "uuid";
import constants from "../../util/constants";
import { Cola } from "../../../types/Cola";

/**
 * @name 新增房间参数
 * @field {string} rid 房间ID
 * @field {string} owner  房主ID
 * @field {Player[]} playerList  玩家列表
 * @field {Channel} channel 频道
 * @field {string} gameId  游戏ID
 * @field {string} name  房间名称
 * @field {string} type  房间类型
 * @field {CreateRoomType} createType  创建房间方式
 * @field {number} maxPlayers  房间最大玩家数量
 * @field {boolean} isPrivate  是否私有
 * @field {string} customProperties  房间自定义属性
 * @field {Cola.TeamInfo[]} teamList  团队属性
 */
export interface AddRoomParams extends Cola.Request.CreateRoomMsg {
  rid: string;
  owner: string;
  playerList: Player[];
  channel: Channel;
}

/**
 * @name 房间变更参数
 * @field {string} name  房间名称（可选）
 * @field {string} owner  房主ID（可选）
 * @field {boolean} isPrivate  是否私有（可选）
 * @field {string} customProperties  自定义房间属性（可选）
 * @field {boolean} isForbidJoin  是否禁止加入房间（可选）
 */
export interface ChangeRoomInfoParams extends Cola.Request.ChangeRoomMsg {}

/**
 * @name 房间
 * @field {string} id  房间ID
 * @field {string} gameId 游戏ID
 * @field {string} name  房间名称
 * @field {string} type  房间类型
 * @field {Cola.CreateRoomType} createType  创建房间方式
 * @field {number} maxPlayers  房间最大玩家数量
 * @field {string} owner  房主ID
 * @field {boolean} isPrivate  是否私有
 * @field {string} customProperties  房间自定义属性
 * @field {Player[]} playerList  玩家列表
 * @field {TeamInfo[]} teamList  团队属性
 * @field {Cola.FrameSyncState} frameSyncState  房间帧同步状态
 * @field {number} frameRate  帧率
 * @field {number} createTime  房间创建时的时间戳（单位：秒）
 * @field {number} startGameTime  开始帧同步时的时间戳（单位：秒）
 * @field {boolean} isForbidJoin  是否禁止加入房间
 * @field {Channel} channel  频道
 * @field {number} stepTime  第几帧
 * @field {number} stepUpdateTime  这帧执行了多久
 * @field {Command[]} commands  当前命令
 * @field {Command[][]} historyCommands  历史命令，可以考虑写入到redis中
 */
export class Room {
  public rid: string = uuid();
  public gameId: string;
  public name: string;
  public type: string;
  public createType: Cola.CreateRoomType;
  public maxPlayers: number;
  public owner: string;
  public isPrivate: boolean;
  public customProperties: string;
  public playerList: Player[];
  public teamList: Cola.TeamInfo[];
  public frameSyncState: Cola.FrameSyncState = Cola.FrameSyncState.STOP;
  public frameRate: number = constants.STEP_INTERVAL;
  public createTime: number = Math.floor(+new Date() / 1000);
  public startGameTime: number;
  public isForbidJoin: boolean = false;
  public channel: Channel = null;
  public stepTime: number = 0;
  public stepUpdateTime: number = 0;
  public commands: Command[] = [];
  public historyCommands: Command[][] = [];

  public constructor(params: AddRoomParams) {
    this.rid = params.rid;
    this.gameId = params.gameId;
    this.name = params.name;
    this.type = params.type;
    this.createType = params.createType;
    this.maxPlayers = params.maxPlayers;
    this.owner = params.owner;
    this.isPrivate = params.isPrivate;
    this.customProperties = params.customProperties;
    this.playerList = params.playerList;
    this.teamList = params.teamList;
    this.channel = params.channel;
  }

  /**
   * 获取符合Cola.Room数据结构的对象
   */
  public getRoomInfo(): Cola.Room {
    const playerFormat = function (player: Player): Cola.PlayerInfo {
      return {
        uid: player.uid,
        gameId: player.gameId,
        name: player.name,
        teamId: player.teamId,
        customPlayerStatus: player.customPlayerStatus,
        customProfile: player.customProfile,
        matchAttributes: player.matchAttributes,
      };
    };
    return {
      rid: this.rid,
      gameId: this.gameId,
      name: this.name,
      type: this.type,
      createType: this.createType,
      maxPlayers: this.maxPlayers,
      owner: this.owner,
      isPrivate: this.isPrivate,
      customProperties: this.customProperties,
      playerList: this.playerList.map(playerFormat),
      teamList: this.teamList,
      frameSyncState: this.frameSyncState,
      frameRate: this.frameRate,
      createTime: this.createTime,
      startGameTime: this.startGameTime,
      isForbidJoin: this.isForbidJoin,
    };
  }

  /**
   * 根据玩家uid返回玩家信息
   * @param uid
   */
  public findPlayer(uid: string): Player | undefined {
    return this.playerList.filter(player => player.uid === uid)[0];
  }

  /**
   * 向房间内添加一位玩家
   * @param {Player} player Player实例
   */
  public addPlayer(player: Player) {
    this.playerList.push(player);
  }

  /**
   * 修改房间信息
   * @param {ChangeRoomInfoParams} params 修改房间信息参数
   */
  public changeRoomInfo(params: ChangeRoomInfoParams): Cola.Room {
    if (params.name) this.name = params.name;
    if (params.owner) this.owner = params.owner;
    if (params.isPrivate) this.isPrivate = params.isPrivate;
    if (params.customProperties) this.customProperties = params.customProperties;
    if (params.isForbidJoin) this.isForbidJoin = params.isForbidJoin;
    return this.getRoomInfo();
  }

  /**
   * 修改玩家状态
   * @param {string} uid
   * @param {number} customPlayerStatus 自定义玩家状态
   */
  public changePlayerInfo(uid: string, customPlayerStatus: number) {
    const targetPlayer = this.findPlayer(uid);
    targetPlayer.changeCustomPlayerStatus(customPlayerStatus);
  }

  /**
   * 开始帧同步
   */
  public startFrameSync() {
    this.frameSyncState = 1;
  }

  /**
   * 停止帧同步
   */
  public stopFrameSync() {
    this.frameSyncState = 0;
  }
}
