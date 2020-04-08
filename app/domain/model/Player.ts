import { Cola } from "../../../types/Cola";

/**
 * @name 玩家信息参数
 * @field {string} uid 用户uid
 * @field {string} gameId 游戏id
 * @field {string} name 游戏用户昵称
 * @field {string} teamId 房间内队伍id
 * @field {number} customPlayerStatus 自定义玩家状态
 * @field {string} customProfile 自定义玩家信息
 * @field {MatchAttribute[]} matchAttributes 匹配属性列表
 * @field {boolean} isRobot 是否是机器人
 */
export interface CreatePlayerParams extends Cola.PlayerInfo {
  isRobot: boolean;
}
/**
 * @name 玩家信息
 * @field {string} uid  玩家ID
 * @field {string} gameId 游戏ID
 * @field {string} name  玩家昵称
 * @field {string} teamId  队伍ID
 * @field {number} customPlayerStatus  自定义玩家状态
 * @field {string} customProfile  自定义玩家信息
 * @field {Cola.MatchAttribute[]} matchAttributes  玩家匹配属性列表
 * @field {boolean} isRobot  玩家是否为机器人
 * @field {Cola.NetworkState} commonNetworkState  玩家在房间的网络状态
 * @field {Cola.NetworkState} relayNetworkState  玩家在游戏中的网络状态
 */
export class Player {
  uid: string;
  gameId: string;
  name: string;
  teamId: string;
  customPlayerStatus: number;
  customProfile: string;
  matchAttributes: Cola.MatchAttribute[];
  isRobot: boolean;
  commonNetworkState: Cola.NetworkState;
  relayNetworkState: Cola.NetworkState;

  constructor(params: CreatePlayerParams){
    this.uid = params.uid;
    this.gameId = params.gameId;
    this.name = params.name;
    this.teamId = params.teamId;
    this.customPlayerStatus = params.customPlayerStatus;
    this.customProfile = params.customProfile;
    this.matchAttributes = params.matchAttributes;
    this.isRobot = params.isRobot;
    this.commonNetworkState = 1;
    this.relayNetworkState = 3;
  }
}
