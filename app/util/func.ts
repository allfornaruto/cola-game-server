import { BackendSessionService, BackendSession } from 'pinus';

/**
 * 修改其他玩家的session
 * @param serverId Frontend Server Id
 * @param uid
 */
export async function changeOtherPlayerSession(backendSessionService: BackendSessionService, serverId: string, uid: string, cb: (session: BackendSession, resolve: () => void) => void): Promise<void> {
  return new Promise((resolve, _) => {
    backendSessionService.getByUid(serverId, uid, (err, session) => {
      cb(session[0], resolve);
    });
  });
}
