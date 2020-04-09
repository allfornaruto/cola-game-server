export namespace Cola {
  export namespace Request {
    export type GetConnectorEntry = string;
    export interface ConnectorEnter extends PlayerInitInfo {

    }
    /**
     * @name 创建房间请求参数
     * @field {string} gameId  游戏ID
     * @field {string} name  房间名称
     * @field {string} type  房间类型
     * @field {CreateRoomType} createType  创建房间方式
     * @field {number} maxPlayers  房间最大玩家数量
     * @field {boolean} isPrivate  是否私有
     * @field {string} customProperties  房间自定义属性
     * @field {TeamInfo[]} teamList  团队属性
     * @field {PlayerInfoExtra} playerInfoExtra 加入房间用户额外信息参数
     */
    export interface CreateRoomMsg {
      gameId: string;
      name: string;
      type: string;
      createType: CreateRoomType;
      maxPlayers: number;
      isPrivate: boolean;
      customProperties: string;
      teamList: TeamInfo[];
      playerInfoExtra: PlayerInfoExtra;
    }
    /**
     * @name 进入房间请求参数
     * @field {string} rid 房间ID
     * @field {PlayerInfoExtra} playerInfoExtra 加入房间用户额外信息参数
     */
    export interface EnterRoomMsg {
      rid: string;
      playerInfoExtra: PlayerInfoExtra;
    }
    /**
     * @name 房间变更参数
     * @field {string} roomName  房间名称（可选）
     * @field {string} owner  房主ID（可选）
     * @field {boolean} isPrivate  是否私有（可选）
     * @field {string} customProperties  自定义房间属性（可选）
     * @field {boolean} isForbidJoin  是否禁止加入房间（可选）
     */
    export interface ChangeRoomMsg {
      name?: string;
      owner?: string;
      isPrivate?: boolean;
      customProperties?: string;
      isForbidJoin?: boolean;
    }
    /**
     * @name 离开房间请求参数
     * @field {string} rid 房间ID
     */
    export interface LeaveRoomMsg {
      rid: string;
    }
    /**
     * @name 在房间内向指定用户发送消息
     * @field {string[]} uidList 用户uid数组
     * @field {string} content 消息内容
     */
    export interface SendToClient {
      uidList: string[];
      content: string;
    }
  }
  export namespace Response {
    export interface GateGetConnectorEntry {
      code: number;
      message: string;
      data: Connector | null;
    }
    export interface ConnectorEnter {
      code: number;
      message: string;
      data: Status;
    }
    export interface CreateRoom {
      code: number;
      message: string;
      data: Room;
    }
    export interface EnterRoom {
      code: number;
      message: string;
      data: Room;
    }
    export interface ChangeRoom {
      code: number;
      message: string;
      data: Room;
    }
    export interface SendToClient {
      code: number;
      message: string;
      data: Status;
    }
  }
  export namespace EventRes {
    export interface OnRoomCreate extends Room {

    }
    export interface OnHallAdd extends PlayerInitInfo {

    }
    export interface OnRoomAdd extends PlayerInfo {

    }

    /**
     * @name 用户离开房间事件
     * @field {string} uid  用户uid
     * @field {string} rid  房间id
     */
    export interface OnKick {
      uid: string;
      rid: string;
    }

    /**
     * @name 房间内玩家聊天消息事件
     * @field {string} msg  消息内容
     * @field {string} from  消息发送者uid
     * @field {string[]} target  消息接收者uid数组
     */
    export interface OnChat {
      msg: string;
      from: string;
      target: string[];
    }

  }
  export namespace Params {
    /**
     * @name 创建房间请求参数
     * @field {string} name  房间名称
     * @field {string} type  房间类型
     * @field {CreateRoomType} createType  创建房间方式
     * @field {number} maxPlayers  房间最大玩家数量
     * @field {boolean} isPrivate  是否私有
     * @field {string} customProperties  房间自定义属性
     * @field {TeamInfo[]} teamList  团队属性
     * @field {PlayerInfoExtra} playerInfoExtra 加入房间用户额外信息参数
     */
    export interface CreateRoom {
      name: string;
      type: string;
      createType: CreateRoomType;
      maxPlayers: number;
      isPrivate: boolean;
      customProperties: string;
      teamList: TeamInfo[];
      playerInfoExtra: PlayerInfoExtra;
    }
    /**
     * @name 进入房间请求参数
     * @field {string} rid 房间ID
     * @field {PlayerInfoExtra} playerInfoExtra 加入房间用户额外信息参数
     */
    export interface EnterRoom {
	    rid: string;
	    playerInfoExtra: PlayerInfoExtra;
    }
  }

  export type Event = "io-error" | "close" | "onKick" | "heartbeat timeout" | "onRoomCreate" | "onHallAdd" | "onRoomAdd" | "onChat";

  /**
   * @name Cola客户端初始化参数
   * @field {string} gameId 游戏ID
   * @fidld {PlayerInitInfo} playerInitInfo 玩家初始化信息
   * @field {string} gateHost 游戏服务器地址
   * @fidld {number} gatePort 游戏服务器端口
   */
  export interface Init {
    gameId: string;
    playerInitInfo: PlayerInitInfo;
    gateHost: string;
    gatePort: number;
  }
  /**
   * @name Cola客户端配置参数
   * @field {boolean} debug 是否开启打印日志
   */
  export interface ColaOptions {
    debug: boolean;
  }
  /**
   * @name 玩家初始化信息参数
   * @field {string} uid 用户uid
   * @field {string} gameId 游戏id
   * @field {string} name 游戏用户昵称
   */
  export interface PlayerInitInfo {
    uid: string;
    gameId: string;
    name: string;
  }
  /**
   * @name 玩家信息参数
   * @field {string} uid 用户uid
   * @field {string} gameId 游戏id
   * @field {string} name 游戏用户昵称
   * @field {string} teamId 房间内队伍id
   * @field {number} customPlayerStatus 自定义玩家状态
   * @field {string} customProfile 自定义玩家信息
   * @field {MatchAttribute[]} matchAttributes 匹配属性列表
   */
  export interface PlayerInfo {
    uid: string;
    gameId: string;
    name: string;
    teamId: string;
    customPlayerStatus: number;
    customProfile: string;
    matchAttributes: MatchAttribute[];
  }
  /**
   * @name 玩家Session信息
   * @field {string} uid 用户uid
   * @field {string} gameId 游戏id
   * @field {string} name 游戏用户昵称
   * @field {string} teamId 房间内队伍id
   * @field {number} customPlayerStatus 自定义玩家状态
   * @field {string} customProfile 自定义玩家信息
   * @field {MatchAttribute[]} matchAttributes 匹配属性列表
   * @field {string} serverId frontendServerId
   * @field {number} room 该用户所在的房间ID
   * @field {string | null} ownRoom 作为哪个房间的房主 房间ID
   */
  export interface PlayerSessionInfo extends PlayerInfo {
    serverId: string;
    room?: string;
    ownRoom?: string | null;
  }
   /**
   * @name 前端服务器地址
   * @field {string} host IP地址
   * @field {number} port 端口
   */
  export interface Connector {
    host: string;
    port: number;
  }
  /**
   * @name 加入房间用户额外信息参数
   * @field {string} teamId 房间内队伍id
   * @field {number} customPlayerStatus 自定义玩家状态
   * @field {string} customProfile 自定义玩家信息
   * @field {MatchAttribute[]} matchAttributes 匹配属性列表
   */
  export interface PlayerInfoExtra {
    teamId: string;
    customPlayerStatus: number;
    customProfile: string;
    matchAttributes: MatchAttribute[];
  }
  /**
   * @name 房间信息
   * @field {string} rid 房间ID
   * @field {string} gameId  游戏ID
   * @field {string} name  房间名称
   * @field {string} type  房间类型
   * @field {CreateRoomType} createType  创建房间方式
   * @field {number} maxPlayers  房间最大玩家数量
   * @field {string} owner 房主Id
   * @field {boolean} isPrivate  是否私有
   * @field {string} customProperties  房间自定义属性
   * @field {PlayerInfo[]} playerList 玩家列表
   * @field {TeamInfo[]} teamList  团队属性
   * @field {FrameSyncState} frameSyncState  房间帧同步状态
   * @field {number} frameRate  帧率
   * @field {number} createTime  房间创建时的时间戳（单位：秒）
   * @field {number} startGameTime  开始帧同步时的时间戳（单位：秒）
   * @field {boolean} isForbidJoin  是否禁止加入房间
   */
  export interface Room {
    rid: string;
    gameId: string;
    name: string;
    type: string;
    createType: CreateRoomType;
    maxPlayers: number;
    owner: string;
    isPrivate: boolean;
    customProperties: string;
    playerList: PlayerInfo[];
    teamList: TeamInfo[];
    frameSyncState: FrameSyncState;
    frameRate: number;
    createTime: number;
    startGameTime: number;
    isForbidJoin: boolean;
  }
  /**
   * @name 接口调用状态
   * @field {boolean} status 成功or失败
   */
  export interface Status {
    status: boolean;
  }
  /**
   * @name 帧数据
   * @description 附加信息包含一个 number 类型随机种子，开发者可以使用帧 ID 与随机种子组合成一个值来初始化 RandomUtil 工具。
   * @description time 为 SDK 拟合出来的时间，目的是使每一帧到达客户端的时间尽量均匀分布，并且时间间隔尽量接近帧率的倒数。
   * @description isReplay 表示该帧是否为自动补帧产生的帧，自动补帧需要在初始化 Listener 时设置。
   * @description items 数组表示各个客户端发送的帧消息，按照到达服务器时间先后进行排序（数组中第0个为最先到服务器）。
   * @field {number} frameId  帧ID
   * @field {MGOBE.types.FrameItem[]} items  帧内容
   * @field {MGOBE.types.FrameExtInfo} ext  附加信息
   * @field {number} roomId  房间ID
   * @field {number} time  该帧到达客户端时间
   * @field {boolean} isReplay  是否为补帧
   */
  export interface Frame {
    id: number;
    items: MGOBE.types.FrameItem[];
    ext: MGOBE.types.FrameExtInfo;
    roomId: string;
    time?: number;
    isReplay?: boolean;
  }
  /**
   * @name 帧数据附加信息
   * @field {number} seed  随机数种子
   */
  export interface FrameExtInfo {
    seed: number;
  }
  /**
   * @name 帧内容
   * @field {string} playerId  玩家ID
   * @field {object} data  玩家帧内容
   * @field {number} timestamp  时间戳，各玩家本地发送帧的时间
   */
  export interface FrameItem {
    playerId: string;
    data: object;
    timestamp: number;
  }
  /**
   * @name 创建房间方式
   * @field {0} COMMON_CREATE  普通创建
   * @field {1} MATCH_CREATE  匹配创建
   */
  export enum CreateRoomType {
    COMMON_CREATE = 0,
    MATCH_CREATE = 1
  }
  /**
   * @name 房间帧同步状态
   * @field {0} STOP 未开始帧同步
   * @field {1} START 已开始帧同步
   */
  export enum FrameSyncState {
    STOP = 0,
    START = 1
  }
  /**
   * @name 玩家网络状态
   * @field {0} COMMON_OFFLINE  房间中玩家掉线
   * @field {1} COMMON_ONLINE  房间中玩家在线
   * @field {2} RELAY_OFFLINE  帧同步中玩家掉线
   * @field {3} RELAY_ONLINE  帧同步中玩家在线
   */
  export enum NetworkState {
    COMMON_OFFLINE = 0,
    COMMON_ONLINE = 1,
    RELAY_OFFLINE = 2,
    RELAY_ONLINE = 3
  }
  /**
   * @name 团队属性
   * @field {string} id  队伍ID
   * @field {string} name  队伍名称
   * @field {number} minPlayers  队伍最小人数
   * @field {number} maxPlayers  队伍最大人数
   */
  export interface TeamInfo {
    id: string;
    name: string;
    minPlayers: number;
    maxPlayers: number;
  }
  /**
   * @name 匹配属性
   * @field {string} name  属性名称
   * @field {number} value  属性值
   */
  export interface MatchAttribute {
    name: string;
    value: number;
  }
}
