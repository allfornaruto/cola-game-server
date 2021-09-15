import * as pinus from "./PinusForEgret";
import { Cola } from "../types/Cola";

export default class ColaClient {
  private gameId: string;
  private client: pinus.WSClient;
  private debug: boolean;
  private playerInitInfo: Cola.PlayerInitInfo;
  private gateHost: string;
  private gatePort: number;
  private connectorHost: string;
  private connectorPort: number;

  constructor(params: Cola.Init, options?: Cola.ColaOptions) {
    this.gameId = params.gameId;
    this.playerInitInfo = params.playerInitInfo;
    this.gateHost = params.gateHost;
    this.gatePort = params.gatePort;
    this.client = new pinus.WSClient();
    if (!!options) {
      this.debug = Boolean(options.debug);
    }
  }

  /**
   * Cola事件监听处理
   * @param event 事件名称
   * @param cb 监听回调
   */
  public listen(event: Cola.Event, cb: (e: any) => void) {
    this.client.on(event, data => {
      try {
        cb(data);
      } catch (e) {
        console.error(e);
      }
    });
  }

  /**
   * 取消Cola事件监听处理
   * @param event 事件名称
   * @param cb 取消回调
   */
  public listenOff(event: Cola.Event, cb: Function) {
    try {
      this.client.off(event, () => {
        try {
          cb();
        } catch (e) {
          console.error(e);
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * 输出日志格式化
   */
  public log(message: string, payload?: object) {
    try {
      console.log(JSON.stringify(Object.assign({}, this.playerInitInfo, { message, payload: payload ? JSON.stringify(payload) : "" })));
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * 进入游戏大厅
   */
  public async enterHall(): Promise<void> {
    try {
      const { host, port } = await this.getConnector();
      this.connectorHost = host;
      this.connectorPort = port;
      await this.startConnectToHall();
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * 创建房间
   * @param {Cola.Params.CreateRoom} params 创建房间参数
   */
  public createRoom(params: Cola.Params.CreateRoom): Promise<Cola.Room> {
    return new Promise((resolve, reject) => {
      const requestData: Cola.Request.CreateRoomMsg = {
        gameId: this.gameId,
        name: params.name,
        type: params.type,
        createType: params.createType,
        maxPlayers: params.maxPlayers,
        isPrivate: params.isPrivate,
        customProperties: params.customProperties,
        teamList: params.teamList,
        playerInfoExtra: params.playerInfoExtra,
      };
      this.client.request("game.gameHandler.createRoom", requestData, (res: Cola.Response.CreateRoom) => {
        if (res.code === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      });
    });
  }

  /**
   * 进入房间
   * @param {Cola.Params.EnterRoom} params 进入房间参数
   */
  public enterRoom(params: Cola.Params.EnterRoom): Promise<Cola.Room> {
    return new Promise((resolve, reject) => {
      const requestData: Cola.Request.EnterRoomMsg = params;
      this.client.request("game.gameHandler.enterRoom", requestData, (res: Cola.Response.EnterRoom) => {
        if (res.code === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      });
    });
  }

  /**
   * 离开房间
   * @param {string} rid 房间id
   */
  public leaveRoom(rid: string) {
    const requestData: Cola.Request.LeaveRoomMsg = { rid };
    this.client.notify("game.gameHandler.leaveRoom", requestData);
  }

  /**
   * 房主解散房间
   * @param {string} rid 房间id
   */
  public dismissRoom(rid: string) {
    const requestData: Cola.Request.DismissRoomMsg = { rid };
    this.client.notify("game.gameHandler.dismissRoom", requestData);
  }

  /**
   * 根据房间ID获取房间信息
   * @param {Cola.Request.GetRoomByRoomId} params
   */
  public getRoomByRoomId(params: Cola.Request.GetRoomByRoomId): Promise<Cola.Room> {
    return new Promise((resolve, reject) => {
      const requestData: Cola.Request.GetRoomByRoomId = params;
      this.client.request("game.gameHandler.getRoomByRoomId", requestData, (res: Cola.Response.GetRoomByRoomId) => {
        if (res.code === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      });
    });
  }

  /**
   * 获取房间列表
   * @param {Cola.Request.GetRoomList} params
   */
  public getRoomList(params: Cola.Request.GetRoomList): Promise<Cola.Room[]> {
    return new Promise((resolve, reject) => {
      const requestData: Cola.Request.GetRoomList = params;
      this.client.request("game.gameHandler.getRoomList", requestData, (res: Cola.Response.GetRoomList) => {
        if (res.code === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      });
    });
  }

  /**
   * 房主修改房间信息
   * @description 修改成功后，房间内全部成员都会收到一条修改房间广播 onChangeRoom，Room实例将更新。
   * @description 只有房主有权限修改房间
   * @param {Cola.Params.ChangeRoom} params 修改房间信息参数
   */
  public changeRoom(params: Cola.Params.ChangeRoom): Promise<Cola.Room> {
    return new Promise((resolve, reject) => {
      const requestData: Cola.Request.ChangeRoomMsg = params;
      this.client.request("game.gameHandler.changeRoom", requestData, (res: Cola.Response.ChangeRoom) => {
        if (res.code === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      });
    });
  }

  /**
   * 修改玩家状态
   * @description 修改玩家状态是修改 Player 中的 customPlayerStatus 字段，玩家的状态由开发者自定义。
   * @description 修改成功后，房间内全部成员都会收到一条修改玩家状态广播 onChangeCustomPlayerStatus，Room实例将更新。
   * @param {number} customPlayerStatus 修改玩家状态参数
   */
  public changeCustomPlayerStatus(customPlayerStatus: number): Promise<Cola.Status> {
    return new Promise((resolve, reject) => {
      const requestData: Cola.Request.ChangeCustomPlayerStatus = {
        customPlayerStatus,
      };
      this.client.request("game.gameHandler.changeCustomPlayerStatus", requestData, (res: Cola.Response.ChangeCustomPlayerStatus) => {
        if (res.code === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      });
    });
  }

  /**
   * 房间内任意一个玩家成功调用该接口将导致全部玩家开始接收帧广播
   *
   * 调用成功后房间内全部成员将收到 onStartFrameSync 广播。该接口会修改房间帧同步状态为“已开始帧同步”
   */
  public startFrameSync(): Promise<Cola.Status> {
    return new Promise((resolve, reject) => {
      const requestData: Cola.Request.StartFrameSync = {};
      this.client.request("game.gameHandler.startFrameSync", requestData, (res: Cola.Response.StartFrameSync) => {
        if (res.code === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      });
    });
  }

  /**
   * 发送帧数据参数
   *
   * 必须在调用startFrameSync之后才可调用该方法
   *
   */
  public sendFrame(data: string): Promise<Cola.Status> {
    return new Promise((resolve, reject) => {
      const requestData: Cola.Request.SendFrame = { data };
      this.client.request("game.gameHandler.sendFrame", requestData, (res: Cola.Response.SendFrame) => {
        if (res.code === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      });
    });
  }

  /**
   * 房间内任意一个玩家成功调用该接口将导致全部玩家停止接收帧广播
   *
   * 调用成功后房间内全部成员将收到 onStopFrameSync 广播。该接口会修改房间帧同步状态为“已停止帧同步”
   */
  public stopFrameSync(): Promise<Cola.Status> {
    return new Promise((resolve, reject) => {
      const requestData: Cola.Request.StopFrameSync = {};
      this.client.request("game.gameHandler.stopFrameSync", requestData, (res: Cola.Response.StopFrameSync) => {
        if (res.code === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      });
    });
  }

  /**
   * 在房间内发送消息给指定用户
   * @param {string[]} uidList 用户uid数组
   * @param {string} content 发送内容
   */
  public sendMsg(uidList: string[], content: string): Promise<Cola.Status> {
    return new Promise((resolve, _) => {
      const requestData: Cola.Request.SendToClient = { uidList, content };
      this.client.request("game.gameHandler.sendToClient", requestData, (res: Cola.Response.SendToClient) => {
        if (res.code === 200) {
          resolve(res.data);
        }
      });
    });
  }

  /**
   * 与服务器断开连接
   */
  public async close(): Promise<Cola.Status> {
    const status = await this.client.disconnect();
    return { status };
  }

  /**
   * 通过gate服务器查询分配的connector服务器
   */
  private getConnector(): Promise<Cola.Connector> {
    return new Promise((resolve, reject) => {
      this.client.init(
        {
          host: this.gateHost,
          port: this.gatePort,
          log: this.debug,
        },
        () => {
          const requestData: Cola.Request.GetConnectorEntry = this.playerInitInfo.uid;
          this.client.request("gate.gateHandler.getConnectorEntry", requestData, (res: Cola.Response.GateGetConnectorEntry) => {
            if (res.code === 200) {
              resolve(res.data);
            } else {
              reject(res);
            }
          });
        }
      );
    });
  }

  /**
   * 连接上connector服务器，并进入大厅
   */
  private startConnectToHall(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.init(
        {
          host: this.connectorHost,
          port: this.connectorPort,
          log: this.debug,
        },
        () => {
          const requestData: Cola.Request.ConnectorEnter = this.playerInitInfo;
          this.client.request("connector.entryHandler.enter", requestData, (res: Cola.Response.ConnectorEnter) => {
            if (res.code === 200) {
              resolve();
            } else {
              reject(res);
            }
          });
        }
      );
    });
  }
}
