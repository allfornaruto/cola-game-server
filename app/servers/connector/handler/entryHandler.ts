import { Application, FrontendSession } from "pinus";
import { Cola } from "../../../../types/Cola";

interface MyFrontendSession {
  serverId: string;
  // 游戏大厅
  gameId: string;
  name: string;
  customPlayerStatus: number;
  customProfile: string;
  // 该用户所在的房间名 房间名格式：gameId:roomName
  room: string;
  // 作为哪个房间的房主
  ownRoom: string | null;
}
interface MyBackendSession {
  serverId: string;
  // 游戏大厅
  gameId: string;
  name: string;
  customPlayerStatus: number;
  customProfile: string;
  // 该用户所在的房间名 房间名格式：gameId:roomName
  room: string;
  // 作为哪个房间的房主
  ownRoom: string | null;
}

export default function (app: Application) {
  return new Handler(app);
}

export class Handler {
  constructor(private app: Application) {}

  async enter(playerInfo: Cola.PlayerInitInfo, session: FrontendSession): Promise<Cola.Response.ConnectorEnter> {
    const { uid, gameId, name } = playerInfo;
    const serverId = this.app.get("serverId");
    console.log(`[begin] connector.entryHandler.enter playerInfo=${JSON.stringify(playerInfo)}`);
    let sessionService = this.app.get("sessionService");

    // uid对应的session已存在,保证一位用户一个连接
    if (!!sessionService.getByUid(uid)) {
      return {
        code: 500,
        message: `该uid（${uid}）已建立连接，不要重复连接`,
        data: { status: false },
      };
    }

    await session.abind(uid);
    session.set("uid", uid);
    session.set("serverId", serverId);
    session.set("gameId", gameId);
    session.set("name", name);
    // session.set('teamId', teamId);
    // session.set('customPlayerStatus', customPlayerStatus);
    // session.set('customProfile', customProfile);
    // session.set('matchAttributes', matchAttributes);
    const sessionPushResult: any = await session.apushAll();
    if (sessionPushResult)
      console.error("connector.entryHandler.enter session.apushAll for session service failed! error is : %j", sessionPushResult.stack);

    // 监听到用户断开连接时，通知后端服务器把用户从房间里移除
    session.on("closed", this.onUserLeave.bind(this));

    // 将用户加入大厅
    const addToHall = this.app.rpc.game.gameRemote.addToHall.route(session);
    const addResult = await addToHall(playerInfo, gameId, serverId);
    console.log(`[end] connector.entryHandler.enter playerInfo=${JSON.stringify(playerInfo)}`);
    return {
      code: 200,
      message: "",
      data: addResult,
    };
  }

  // 通知后端服务器把用户从大厅channel、房间channel里移除，游戏未开始时，如果房主退出了房间channel，则销毁该房间
  private onUserLeave(session: FrontendSession) {
    if (!session || !session.uid) return;

    const hallRid = session.get("gameId");
    const uid = session.uid;
    const rid = session.get("room");
    const ownRid = session.get("ownRoom");

    // 将该用户从游戏大厅中移除
    if (hallRid) {
      console.log(`将该用户从游戏大厅中移除, uid=${uid}`);
      this.app.rpc.game.gameRemote.kick.route(session, true)(uid, this.app.get("serverId"), hallRid);
    }
    // 将该用户从房间内移除
    if (rid) {
      console.log(`将该用户从房间内移除, uid=${uid}`);
      this.app.rpc.game.gameRemote.kick.route(session, true)(uid, this.app.get("serverId"), rid);
    }
    // 该用户是房主，游戏未开始则解散该房间
    if (!!ownRid) {
      // todo 不确定是否需要踢出所有房间内用户
      this.app.get("channelService").destroyChannel(ownRid);
      this.app.rpc.game.gameRemote.destroyRoom.route(session, true)(rid);
      console.log(`房主(${uid})离开房间，房间已解散，rid = ${ownRid}`);
    }
  }
}
