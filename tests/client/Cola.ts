import * as pinus from "./PinusForEgret";
import { Cola } from "../../types/Cola";

export default class ColaClient {
  private gameId: string;
  private client: pinus.WSClient;
  private debug: boolean;
  private playerInitInfo: Cola.PlayerInitInfo;
  private gateHost: string;
  private gatePort: number;
  private connectorHost: string;
  private connectorPort: number;

  constructor(params: Cola.Init, options?: Cola.ColaOptions){
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
      cb(data);
    });
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
        playerInfoExtra: params.playerInfoExtra
      };
      this.client.request("game.gameHandler.createRoom", requestData, (res: Cola.Response.CreateRoom) => {
        if (res.code === 200){
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
        if (res.code === 200){
          resolve(res.data);
        } else {
          reject(res);
        }
      });
    })
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
   * 房主修改房间信息
   * @param {Cola.Params.ChangeRoom} params 修改房间信息参数
   */
  public changeRoom(params: Cola.Params.ChangeRoom): Promise<Cola.Room> {
    return new Promise((resolve, reject) => {
      const requestData: Cola.Request.ChangeRoomMsg = params;
      this.client.request("game.gameHandler.changeRoom", requestData, (res: Cola.Response.ChangeRoom) => {
        if (res.code === 200){
          resolve(res.data);
        } else {
          reject(res);
        }
      });
    })
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
        if (res.code === 200){
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
    return new Promise ((resolve, reject) => {
      this.client.init({
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
        })
      });
    })
  }

  /**
   * 连接上connector服务器，并进入大厅
   */
  private startConnectToHall(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.init({
        host: this.connectorHost,
        port: this.connectorPort,
        log: this.debug,
        }, () => {
        const requestData: Cola.Request.ConnectorEnter = this.playerInitInfo;
        this.client.request("connector.entryHandler.enter", requestData, (res: Cola.Response.ConnectorEnter) => {
          if (res.code === 200){
            resolve();
          } else {
            reject(res);
          }
        });
      });
    });
  }
}
