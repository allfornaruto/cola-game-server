
import { dispatch} from './dispatcher';
import { Session, Application } from 'pinus';

export function chat(session: Session, msg: any, app: Application, cb: (err: Error , serverId ?: string) => void) {
    let chatServers = app.getServersByType('chat');

    if(!chatServers || chatServers.length === 0) {
        cb(new Error('can not find chat servers.'));
        return;
    }
    if (!session.uid) {
      console.error(`session.uid 不存在`);
      return;
    }
    let res = dispatch(session.uid, chatServers);
    cb(null, res.id);
}
