import { dispatch } from "./dispatcher";
import { Session, Application } from "pinus";

export function game(session: Session, msg: any, app: Application, cb: (err: Error, serverId?: string) => void) {
  let gameServers = app.getServersByType("game");

  if (!gameServers || gameServers.length === 0) {
    cb(new Error("can not find game servers."));
    return;
  }
  if (!session.uid) {
    console.error(`session.uid 不存在`);
    return;
  }
  let res = dispatch(session.uid, gameServers);
  cb(null, res.id);
}
